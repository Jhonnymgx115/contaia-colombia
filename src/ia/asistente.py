"""
Asistente IA de ContaIA Colombia.

Reglas de oro de esta integración:
  1. NUNCA se envía texto a la IA sin pasar por el escudo anti-fuga
     (src.seguridad.guardia_datos).
  2. Si el escudo detecta datos sensibles, se envía SOLO la versión
     enmascarada y el usuario ve el informe de lo que fue protegido.
  3. Si no hay clave de API configurada, el asistente responde con
     capacidades locales (sin conexión) en lugar de fallar.

Se soporta OpenAI y Anthropic mediante peticiones HTTP simples (requests),
sin dependencias de SDK adicionales.
"""

import os

import requests
from dotenv import load_dotenv

from ..seguridad.guardia_datos import escanear

load_dotenv()

SISTEMA_PROMPT = (
    "Eres un asistente contable y tributario experto en la normativa colombiana: "
    "Estatuto Tributario, normatividad DIAN, NIIF, Código Sustantivo del Trabajo "
    "y Códigos de Comercio y General. Respondes en español claro, con lenguaje "
    "didáctico para contadores (sin tecnicismos de programación), citas la norma "
    "o artículo cuando la conoces, y adviertes cuando una cifra puede cambiar "
    "según resoluciones vigentes. Nunca inventas artículos ni valores: si no "
    "estás seguro, lo dices. Recuerda: no ofreces asesoría legal formal, solo "
    "apoyo didáctico."
)


def ia_disponible() -> bool:
    """Indica si hay configuración suficiente para usar la IA."""
    return bool(os.getenv("IA_API_KEY")) and os.getenv("IA_API_KEY") != "tu-clave-aqui"


def _llamar_openai(pregunta: str) -> str:
    url = "https://api.openai.com/v1/chat/completions"
    headers = {"Authorization": f"Bearer {os.getenv('IA_API_KEY')}"}
    cuerpo = {
        "model": os.getenv("IA_MODELO", "gpt-4o-mini"),
        "messages": [
            {"role": "system", "content": SISTEMA_PROMPT},
            {"role": "user", "content": pregunta},
        ],
    }
    r = requests.post(url, headers=headers, json=cuerpo, timeout=60)
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"]


def _llamar_anthropic(pregunta: str) -> str:
    url = "https://api.anthropic.com/v1/messages"
    headers = {
        "x-api-key": os.getenv("IA_API_KEY"),
        "anthropic-version": "2023-06-01",
    }
    cuerpo = {
        "model": os.getenv("IA_MODELO", "claude-3-5-haiku-20241022"),
        "max_tokens": 1024,
        "system": SISTEMA_PROMPT,
        "messages": [{"role": "user", "content": pregunta}],
    }
    r = requests.post(url, headers=headers, json=cuerpo, timeout=60)
    r.raise_for_status()
    return r.json()["content"][0]["text"]


def preguntar(pregunta: str) -> dict:
    """Envía una pregunta a la IA con el escudo anti-fuga activado.

    Devuelve un diccionario con: la respuesta (o None), el informe del
    escaneo y el estado (ok / sin_configuracion / bloqueado / error).
    """
    informe = escanear(pregunta)

    if not ia_disponible():
        return {
            "estado": "sin_configuracion",
            "respuesta": (
                "El asistente IA no está activado porque no hay clave de API "
                "configurada. Vea el archivo README (paso 4) para activarla. "
                "Mientras tanto, los demás módulos funcionan sin conexión."
            ),
            "informe_escaneo": informe,
        }

    if informe.hay_datos:
        pregunta_enviada = informe.texto_seguro
    else:
        pregunta_enviada = pregunta

    try:
        proveedor = os.getenv("IA_PROVEEDOR", "openai").lower()
        if proveedor == "anthropic":
            respuesta = _llamar_anthropic(pregunta_enviada)
        else:
            respuesta = _llamar_openai(pregunta_enviada)
        return {
            "estado": "ok",
            "respuesta": respuesta,
            "informe_escaneo": informe,
        }
    except requests.RequestException as exc:
        return {
            "estado": "error",
            "respuesta": f"No se pudo contactar el servicio de IA: {exc}",
            "informe_escaneo": informe,
        }
