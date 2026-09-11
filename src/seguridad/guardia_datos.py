"""
Escudo anti-fuga de datos de ContaIA Colombia.

Antes de que cualquier texto o documento se envíe a un servicio de IA
(que está fuera del computador del usuario), este módulo:

  1. DETECTA datos personales y financieros colombianos:
     cédulas, NITs, tarjetas, cuentas bancarias, correos, teléfonos,
     claves operativas (CLP), direcciones IP.
  2. OCULTA (enmascara) cada dato conservando una pista mínima,
     p. ej. 1.023.456.789 → 102***789.
  3. GENERA un informe para que el contador vea exactamente qué
     se protegió antes de enviar nada.

Principio rector (Ley 1581 de 2012 — protección de datos personales en
Colombia): minimización; nunca enviar más de lo necesario.
"""

import re
from dataclasses import dataclass, field


@dataclass
class Hallazgo:
    categoria: str
    cantidad: int
    descripcion: str


@dataclass
class InformeEscaneo:
    texto_original: str = ""
    texto_seguro: str = ""
    hallazgos: list = field(default_factory=list)
    total_datos_protegidos: int = 0

    @property
    def hay_datos(self) -> bool:
        return self.total_datos_protegidos > 0

    @property
    def nivel_riesgo(self) -> str:
        if self.total_datos_protegidos == 0:
            return "🟢 Sin datos sensibles detectados"
        financieros = sum(
            h.cantidad
            for h in self.hallazgos
            if h.categoria in ("Tarjeta / cuenta bancaria", "Clave operativa (CLP)")
        )
        if financieros:
            return "🔴 Alto — se detectaron datos financieros"
        return "🟡 Medio — se detectaron datos personales"

    def resumen(self) -> str:
        if not self.hay_datos:
            return "El escudo no encontró datos sensibles: el texto puede enviarse tal como está."
        lineas = [f"Nivel de riesgo: {self.nivel_riesgo}", ""]
        for h in self.hallazgos:
            lineas.append(f"• {h.categoria}: {h.cantidad} detectado(s). {h.descripcion}")
        lineas.append("")
        lineas.append("Todos los datos anteriores fueron OCULTADOS automáticamente.")
        return "\n".join(lineas)


# ── Patrones de datos colombianos ──────────────────────────────────────────
# Cada patrón: (categoría, regex compilada, descripción didáctica, función de enmascaramiento)

def _mascara_digitos(valor: str, visibles_final: int = 3) -> str:
    """Deja visibles solo los últimos dígitos: 10234567 → 102****567."""
    solo = re.sub(r"\D", "", valor)
    if len(solo) <= visibles_final:
        return "*" * len(valor)
    prefijo = valor[: max(len(valor) - len(solo) + visibles_final, 1)]
    return prefijo + "*" * max(len(valor) - len(prefijo), 3)


def _mascara_correo(valor: str) -> str:
    usuario, _, dominio = valor.partition("@")
    if len(usuario) <= 2:
        usuario_m = usuario[0] + "*"
    else:
        usuario_m = usuario[:2] + "*" * max(len(usuario) - 2, 3)
    return f"{usuario_m}@{dominio}"


def _mascara_total(valor: str) -> str:
    return "*" * len(valor)


_PATRONES = [
    (
        "Clave operativa (CLP)",
        re.compile(r"(?i)(?:clave|clp|token|contrase[ñn]a|password)\s*[:=]?\s*(\S{6,32})"),
        "Claves o tokens escritos en el texto.",
        _mascara_total,
    ),
    (
        "Tarjeta / cuenta bancaria",
        re.compile(r"\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})\b"),
        "Números que corresponden a tarjetas Visa/Mastercard/Amex.",
        _mascara_digitos,
    ),
    (
        "NIT con dígito de verificación",
        re.compile(r"\b\d{3}\.?\d{3}\.?\d{3}-\d\b"),
        "NITs colombianos (formato con guión y DV).",
        _mascara_digitos,
    ),
    (
        "Cédula / identificación",
        re.compile(r"(?i)(?:c[ée]dula|cc|identificaci[óo]n|nit)\s*[:\.]?\s*(\d{5,10})"),
        "Documentos de identidad con etiqueta en el texto.",
        _mascara_digitos,
    ),
    (
        "Correo electrónico",
        re.compile(r"\b[\w\.\-+]+@[\w\-]+\.[\w\.]{2,}\b"),
        "Correos electrónicos.",
        _mascara_correo,
    ),
    (
        "Teléfono / celular",
        re.compile(r"(?:(?:\+?57)[\s\-]?)?3\d{2}[\s\-]?\d{3}[\s\-]?\d{4}\b"),
        "Celulares colombianos (empiezan por 3 y tienen 10 dígitos).",
        _mascara_digitos,
    ),
    (
        "Dirección IP",
        re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b"),
        "Direcciones IP que podrían identificar equipos.",
        _mascara_total,
    ),
]


def escanear(texto: str) -> InformeEscaneo:
    """Escanea un texto, lo devuelve enmascarado y genera el informe."""
    informe = InformeEscaneo(texto_original=texto)
    texto_seguro = texto

    for categoria, patron, descripcion, mascara in _PATRONES:
        coincidencias = list(patron.finditer(texto))
        if not coincidencias:
            continue
        # Usa el grupo de captura cuando existe; si no, toda la coincidencia.
        for m in coincidencias:
            dato = m.group(1) if m.groups() else m.group(0)
            texto_seguro = texto_seguro.replace(dato, mascara(dato))
        informe.hallazgos.append(Hallazgo(categoria, len(coincidencias), descripcion))
        informe.total_datos_protegidos += len(coincidencias)

    informe.texto_seguro = texto_seguro
    return informe


def escanear_o_bloquear(texto: str, permitir_enmascarado: bool = True) -> tuple[bool, InformeEscaneo]:
    """Decide si un texto puede enviarse a un servicio externo.

    Devuelve (puede_enviarse, informe). Si hay datos sensibles y el
    enmascarado está permitido, se envía SOLO la versión enmascarada.
    """
    informe = escanear(texto)
    if not informe.hay_datos:
        return True, informe
    return permitir_enmascarado, informe
