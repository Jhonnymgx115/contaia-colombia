"""
Liquidador de renta (Colombia) — personas naturales y jurídicas.

Implementa el flujo clásico del Estatuto Tributario:
  1. Ingresos totales
  2. (-) Ingresos no constitutivos de renta (art. 45 ET)
  3. (=) Ingresos netos
  4. (-) Costos y deducciones
  5. (=) Renta líquida
  6. (-) Rentas exentas (art. 206/336 ET, con topes)
  7. (=) Renta líquida gravable
  8. Impuesto básico con tarifa marginal del art. 241 ET

El resultado incluye el detalle paso a paso para que el contador pueda
explicarlo y auditarlo.
"""

from ..datos.uvt import uvt as valor_uvt
from ..datos.tarifas import (
    impuesto_basico,
    RENTA_LABORAL_EXENTA_UVT,
    TOPE_EXENTAS_PERSONA_NATURAL_UVT,
)


def liquidar(
    ingresos_totales: float,
    ingresos_no_constitutivos: float = 0.0,
    costos_y_deducciones: float = 0.0,
    rentas_exentas: float = 0.0,
    anio: int = 2025,
    es_persona_natural: bool = True,
    ingresos_laborales: float | None = None,
) -> dict:
    """Liquida el impuesto de renta y devuelve el resultado con su detalle.

    Args:
        ingresos_totales: total de ingresos del año gravable (COP).
        ingresos_no_constitutivos: art. 45 ET (p. ej. aportes obligatorios a salud/pensión del trabajador dependiente).
        costos_y_deducciones: costos + deducciones aceptadas fiscalmente.
        rentas_exentas: rentas exentas adicionales (art. 206 ET), antes de topes.
        anio: año gravable (define el valor de la UVT).
        es_persona_natural: True aplica topes de exenciones del art. 336 ET.
        ingresos_laborales: porción de ingresos de fuente laboral (para la
            exención de 790 UVT del art. 336 ET). Si es None se asume que
            todos los ingresos son laborales cuando es persona natural.
    """
    v_uvt = valor_uvt(anio)

    ingresos_netos = max(ingresos_totales - ingresos_no_constitutivos, 0.0)
    renta_liquida = max(ingresos_netos - costos_y_deducciones, 0.0)

    exenciones_aplicadas = rentas_exentas
    notas = []

    if es_persona_natural:
        # Exención de ingresos laborales (art. 336 ET): 790 UVT sobre la
        # porción laboral del ingreso, sujeta al tope de 2.400 UVT en total
        # de rentas exentas y deducciones.
        porcion_laboral = ingresos_laborales if ingresos_laborales is not None else ingresos_netos
        exencion_laboral = min(
            RENTA_LABORAL_EXENTA_UVT * v_uvt,
            max(porcion_laboral, 0.0),
        )
        exenciones_aplicadas += exencion_laboral
        notas.append(
            f"Se aplicó la exención de ingresos laborales (art. 336 ET): "
            f"{RENTA_LABORAL_EXENTA_UVT} UVT = ${exencion_laboral:,.0f} COP."
        )

        tope_total = TOPE_EXENTAS_PERSONA_NATURAL_UVT * v_uvt
        if exenciones_aplicadas > tope_total:
            notas.append(
                f"Las rentas exentas y deducciones superaron el tope de "
                f"{TOPE_EXENTAS_PERSONA_NATURAL_UVT} UVT "
                f"(${tope_total:,.0f} COP); se ajustaron al tope."
            )
        exenciones_aplicadas = min(exenciones_aplicadas, tope_total, renta_liquida)

    exenciones_aplicadas = min(exenciones_aplicadas, renta_liquida)
    renta_gravable = renta_liquida - exenciones_aplicadas

    base_uvt = renta_gravable / v_uvt
    resultado = impuesto_basico(base_uvt)
    impuesto_cop = resultado["impuesto_uvt"] * v_uvt

    return {
        "anio_gravable": anio,
        "uvt": v_uvt,
        "ingresos_totales": ingresos_totales,
        "ingresos_no_constitutivos": ingresos_no_constitutivos,
        "ingresos_netos": ingresos_netos,
        "costos_y_deducciones": costos_y_deducciones,
        "renta_liquida": renta_liquida,
        "rentas_exentas": exenciones_aplicadas,
        "renta_liquida_gravable": renta_gravable,
        "base_uvt": base_uvt,
        "impuesto_basico_uvt": resultado["impuesto_uvt"],
        "impuesto_basico_cop": impuesto_cop,
        "detalle_tramos": resultado["detalle"],
        "notas": notas,
    }
