"""
Tarifa marginal del impuesto sobre la renta y complementarios.

Artículo 241 del Estatuto Tributario (vigente desde la Ley 2277 de 2022).
Aplica tanto a personas naturales como jurídicas para el impuesto básico.

Cada tramo es una tupla: (límite superior en UVT, tarifa marginal).
El tramo con límite None es el tramo final (sin techo).
"""

TRAMOS_ART_241 = [
    (1_090, 0.00),
    (1_780, 0.19),
    (4_100, 0.28),
    (8_670, 0.33),
    (18_970, 0.35),
    (None, 0.37),
]

# Renta laboral exenta (art. 336 ET): 790 UVT para ingresos laborales,
# con tope total de rentas exentas y deducibles de 2.400 UVT (persona natural).
RENTA_LABORAL_EXENTA_UVT = 790
TOPE_EXENTAS_PERSONA_NATURAL_UVT = 2_400


def impuesto_basico(base_uvt: float) -> dict:
    """Calcula el impuesto básico de renta con la tarifa marginal del art. 241 ET.

    Devuelve un diccionario con el impuesto y el detalle por trama, útil para
    que el contador vea y explique cómo se llegó al resultado.
    """
    detalle = []
    impuesto = 0.0
    limite_anterior = 0.0

    for limite, tarifa in TRAMOS_ART_241:
        if base_uvt <= limite_anterior:
            break
        tope = base_uvt if limite is None else min(base_uvt, limite)
        uvt_gravadas = tope - limite_anterior
        valor_tramo = uvt_gravadas * tarifa
        impuesto += valor_tramo
        detalle.append(
            {
                "tramo_desde": limite_anterior,
                "tramo_hasta": limite if limite is not None else "sin límite",
                "uvt_en_tramo": round(uvt_gravadas, 2),
                "tarifa": tarifa,
                "impuesto_tramo": valor_tramo,
            }
        )
        if limite is None or base_uvt <= limite:
            break
        limite_anterior = limite

    return {"impuesto_uvt": impuesto, "detalle": detalle}
