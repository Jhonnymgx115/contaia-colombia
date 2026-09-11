"""
Validador de exógenas — medios magnéticos DIAN (Resolución 000162 de 2016).

Revisa que un archivo (CSV o Excel) cumpla la estructura esperada de los
formatos 1003 (personas naturales / empleados) y 1004 (personas jurídicas)
antes de que el contador lo cargue a la DIAN, y calcula el dígito de
verificación de los NIT con el algoritmo oficial.
"""

import re

FORMATOS = {
    "1003": {
        "nombre": "1003 — Personas naturales, sucesiones líquidas y patrimonios autónomos",
        "columnas_minimas": [
            "nit",
            "primer apellido",
            "segundo apellido",
            "primer nombre",
            "otros nombres",
            "razón social",
            "dirección",
            "departamento",
            "municipio",
            "país",
            "ingresos",
            "aportes a seguridad social",
            "pensiones",
            "otros ingresos",
            "consignaciones y pagos",
        ],
    },
    "1004": {
        "nombre": "1004 — Personas jurídicas, sociedades y entes colectivos",
        "columnas_minimas": [
            "nit",
            "razón social",
            "dirección",
            "departamento",
            "municipio",
            "país",
            "ingresos brutos",
            "costos",
            "pagos a terceros",
            "consignaciones y pagos",
        ],
    },
}

# Pesos oficiales para el dígito de verificación del NIT (DIAN).
PESOS_NIT = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71]


def digito_verificacion_nit(nit: str | int) -> int:
    """Calcula el dígito de verificación de un NIT colombiano.

    Algoritmo oficial DIAN: cada dígito (de derecha a izquierda) se multiplica
    por los pesos 3, 7, 13, 17, 19, … en ese orden; la suma se toma módulo 11
    y el DV es 11 menos el resto (0 o 1 si el resto es 0 o 1).
    """
    nit = re.sub(r"\D", "", str(nit))
    if not nit:
        raise ValueError("NIT vacío")
    suma = 0
    for digito, peso in zip(reversed(nit), PESOS_NIT):
        suma += int(digito) * peso
    resto = suma % 11
    return 0 if resto in (0, 1) else 11 - resto


def normalizar(texto: str) -> str:
    """Normaliza un encabezado para comparar de forma tolerante."""
    texto = texto.strip().lower()
    texto = re.sub(r"[áàäâ]", "a", texto)
    texto = re.sub(r"[éèëê]", "e", texto)
    texto = re.sub(r"[íìïî]", "i", texto)
    texto = re.sub(r"[óòöô]", "o", texto)
    texto = re.sub(r"[úùüû]", "u", texto)
    texto = re.sub(r"ñ", "n", texto)
    texto = re.sub(r"[^a-z0-9 ]", " ", texto)
    texto = re.sub(r"\s+", " ", texto)
    return texto.strip()


def validar_exogenas(df, formato: str = "1003") -> dict:
    """Valida un DataFrame de exógenas contra la estructura del formato.

    Devuelve un informe didáctico: columnas encontradas, faltantes, posibles
    equivalentes y advertencias básicas de datos.
    """
    if formato not in FORMATOS:
        raise ValueError(f"Formato no soportado: {formato}. Use {list(FORMATOS)}")

    config = FORMATOS[formato]
    columnas_archivo = [normalizar(c) for c in df.columns]
    faltantes, encontradas = [], []

    for esperada in config["columnas_minimas"]:
        objetivo = normalizar(esperada)
        coincidencia = next((c for c in columnas_archivo if objetivo == c), None)
        if coincidencia is None:
            coincidencia = next(
                (c for c in columnas_archivo if objetivo in c or c in objetivo), None
            )
        if coincidencia:
            encontradas.append(esperada)
        else:
            faltantes.append(esperada)

    advertencias = []

    if "nit" in columnas_archivo:
        col_nit = df.columns[columnas_archivo.index("nit")]
        malos = 0
        for valor in df[col_nit].astype(str):
            solo = re.sub(r"\D", "", valor)
            if not solo or len(solo) < 6:
                malos += 1
        if malos:
            advertencias.append(
                f"{malos} fila(s) tienen un NIT/identificación con formato dudoso "
                f"(muy corto o vacío). Revíselas antes de cargar a la DIAN."
            )

    if df.empty:
        advertencias.append("El archivo no contiene filas de datos.")

    estado = "LISTO" if not faltantes else "CON OBSERVACIONES"
    return {
        "formato": formato,
        "nombre_formato": config["nombre"],
        "total_filas": len(df),
        "columnas_encontradas": encontradas,
        "columnas_faltantes": faltantes,
        "advertencias": advertencias,
        "estado": estado,
    }
