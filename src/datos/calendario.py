"""
Calendario tributario colombiano — fechas típicas de vencimiento.

⚠️ Las fechas exactas se publican cada año en la resolución de la DIAN
(por ejemplo, la Resolución 000162 de 2016 y las específicas de cada
temporada). Aquí se muestran las ventanas TÍPICAS para orientación;
verifique siempre la resolución vigente del año en curso.
"""

from datetime import date

# Ventanas típicas por obligación. "tipico" indica mes/día aproximado.
OBLIGACIONES = [
    {
        "nombre": "Impuesto de renta y complementarios — Personas naturales y asimiladas",
        "norma": "Art. 1.6-2 ET (plazos por últimos dos dígitos del NIT)",
        "tipico": "Agosto a octubre (según últimos dos dígitos del NIT)",
        "mes_aprox": 8,
    },
    {
        "nombre": "Impuesto de renta — Grandes contribuyentes y personas jurídicas",
        "norma": "Art. 1.6-2 ET",
        "tipico": "Abril a junio (según últimos dos dígitos del NIT)",
        "mes_aprox": 4,
    },
    {
        "nombre": "Exógenas — Grandes contribuyentes y entidades públicas (código 47)",
        "norma": "Resolución 000162 de 2016 y resoluciones de cada temporada",
        "tipico": "31 de mayo (aprox.)",
        "mes_aprox": 5,
    },
    {
        "nombre": "Exógenas — Demás personas jurídicas y sucesiones (código 48)",
        "norma": "Resolución 000162 de 2016",
        "tipico": "18 de junio (aprox.)",
        "mes_aprox": 6,
    },
    {
        "nombre": "Exógenas — Personas naturales y asimiladas (código 49)",
        "norma": "Resolución 000162 de 2016",
        "tipico": "Octubre, según últimos dos dígitos del NIT",
        "mes_aprox": 10,
    },
    {
        "nombre": "IVA — Bimestre 1 (enero-febrero)",
        "norma": "Art. 1.6.1.13.1 DUT",
        "tipico": "Marzo, según últimos dos dígitos del NIT",
        "mes_aprox": 3,
    },
    {
        "nombre": "IVA — Bimestre 2 (marzo-abril)",
        "norma": "Art. 1.6.1.13.1 DUT",
        "tipico": "Mayo, según últimos dos dígitos del NIT",
        "mes_aprox": 5,
    },
    {
        "nombre": "IVA — Bimestre 3 (mayo-junio)",
        "norma": "Art. 1.6.1.13.1 DUT",
        "tipico": "Julio, según últimos dos dígitos del NIT",
        "mes_aprox": 7,
    },
    {
        "nombre": "IVA — Bimestre 4 (julio-agosto)",
        "norma": "Art. 1.6.1.13.1 DUT",
        "tipico": "Septiembre, según últimos dos dígitos del NIT",
        "mes_aprox": 9,
    },
    {
        "nombre": "IVA — Bimestre 5 (septiembre-octubre)",
        "norma": "Art. 1.6.1.13.1 DUT",
        "tipico": "Noviembre, según últimos dos dígitos del NIT",
        "mes_aprox": 11,
    },
    {
        "nombre": "IVA — Bimestre 6 (noviembre-diciembre)",
        "norma": "Art. 1.6.1.13.1 DUT",
        "tipico": "Enero del año siguiente, según NIT",
        "mes_aprox": 1,
    },
    {
        "nombre": "Prima de servicios — Primer semestre",
        "norma": "Arts. 185-197 CST; Ley 50 de 1990",
        "tipico": "A más tardar el 30 de junio",
        "mes_aprox": 6,
    },
    {
        "nombre": "Prima de servicios — Segundo semestre",
        "norma": "Arts. 185-197 CST",
        "tipico": "A más tardar el 20 de diciembre",
        "mes_aprox": 12,
    },
    {
        "nombre": "Cesantías — Consignación al fondo",
        "norma": "Ley 50 de 1990, art. 205; Ley 52 de 1975",
        "tipico": "A más tardar el 14 de febrero",
        "mes_aprox": 2,
    },
    {
        "nombre": "Intereses a las cesantías",
        "norma": "Art. 210 CST (12% anual)",
        "tipico": "Se pagan el 31 de enero",
        "mes_aprox": 1,
    },
    {
        "nombre": "Proyección de nómina y aportes a seguridad social",
        "norma": "PIL — Planilla Integrada de Liquidación de Aportes",
        "tipico": "Mensual, primeros días del mes siguiente",
        "mes_aprox": 1,
    },
]


def proximas(hoy: date | None = None, cuantas: int = 4) -> list:
    """Devuelve las próximas obligaciones según el mes actual.

    Es una guía didáctica: ordena las obligaciones típicas por cercanía de
    mes al día de hoy.
    """
    hoy = hoy or date.today()

    def cercania(ob):
        diff = (ob["mes_aprox"] - hoy.month) % 12
        return diff if diff != 0 else 12

    ordenadas = sorted(OBLIGACIONES, key=cercania)
    return ordenadas[:cuantas]
