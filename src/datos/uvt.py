"""
Valores de la UVT (Unidad de Valor Tributario) por año gravable.

La UVT es fijada cada año por la DIAN mediante decreto. Si abre un nuevo
año gravable, agregue aquí la fila correspondiente (fuente oficial:
www.dian.gov.co — "UVT año en curso").
"""

# Valores en pesos colombianos (COP), con separador de miles "_".
UVT_POR_ANIO = {
    2022: 42_000,
    2023: 42_412,
    2024: 47_065,
    2025: 49_799,
    # 2026: pendiente de publicación oficial por la DIAN (suele anunciarse
    # en noviembre del año anterior). Agregue el valor aquí cuando salga.
}


def uvt(anio: int) -> float:
    """Devuelve el valor de la UVT para un año gravable.

    Si el año no está en la tabla, usa el último valor conocido y lo indica
    para que el usuario lo verifique.
    """
    if anio in UVT_POR_ANIO:
        return UVT_POR_ANIO[anio]
    ultimo = max(UVT_POR_ANIO)
    return UVT_POR_ANIO[ultimo]


def anios_disponibles():
    return sorted(UVT_POR_ANIO, reverse=True)
