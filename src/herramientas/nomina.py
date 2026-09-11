"""
Cálculos de nómina y prestaciones sociales (Colombia).

Basado en el Código Sustantivo del Trabajo (arts. 185-197 prima, 196 cesantías,
210 intereses) y la Ley 50 de 1990. Los cálculos usan el salario base mensual
sin auxilios ni remuneración en especie.
"""

from datetime import date
from calendar import monthrange

SALARIO_MINIMO_2025 = 1_423_500  # Resolución 1361 de 2024 ( vigente en 2025 )


def dias_trabajados_semestre(inicio: date, fin: date) -> int:
    """Días laborados entre dos fechas (incluyendo extremos), regla CST."""
    return (fin - inicio).days + 1


def prima_servicios(
    salario_mensual: float,
    dias_semestre: int,
    auxilio_transporte: float = 0.0,
) -> dict:
    """Prima de servicios: 15 días de salario por cada semestre (art. 186 CST).

    Fórmula legal: (salario × días trabajados del semestre) ÷ 360,
    que equivale a 15 días completos cuando el semestre está entero.
    El auxilio de transporte hace parte de la prima (art. 194 CST).
    """
    if dias_semestre <= 0:
        raise ValueError("Los días del semestre deben ser mayores a cero.")
    dias_reconocidos = min(dias_semestre, 180)
    salario_diario = salario_mensual / 30
    transporte_diario = auxilio_transporte / 30
    prima = (salario_diario + transporte_diario) * dias_reconocidos / 12
    return {
        "prima": round(prima, 2),
        "dias_reconocidos": dias_reconocidos,
        "formula": "(salario mensual / 30) × días trabajados ÷ 12 (equivale a 15 días por semestre completo)",
    }


def cesantias(salario_mensual: float, dias_trabajados: int) -> dict:
    """Cesantías: un mes de salario por cada año laborado (art. 196 CST)."""
    if dias_trabajados <= 0:
        raise ValueError("Los días trabajados deben ser mayores a cero.")
    valor = salario_mensual * dias_trabajados / 360
    return {
        "cesantias": round(valor, 2),
        "dias_trabajados": dias_trabajados,
        "formula": "(salario mensual) × días trabajados ÷ 360",
    }


def intereses_cesantias(valor_cesantias: float, dias_trabajados: int) -> dict:
    """Intereses a las cesantías: 12% anual sobre lo acumulado (art. 210 CST)."""
    if valor_cesantias < 0 or dias_trabajados <= 0:
        raise ValueError("Valores inválidos para el cálculo de intereses.")
    valor = valor_cesantias * 0.12 * dias_trabajados / 360
    return {
        "intereses": round(valor, 2),
        "tasa": "12% anual",
        "formula": "(cesantías) × 12% × días trabajados ÷ 360",
    }


def liquidacion_completa(
    salario_mensual: float,
    fecha_ingreso: date,
    fecha_fin: date,
    auxilio_transporte: float = 0.0,
    semestre: int = 1,
) -> dict:
    """Resumen didáctico de prima + cesantías + intereses para un periodo."""
    dias = dias_trabajados_semestre(fecha_ingreso, fecha_fin)
    p = prima_servicios(salario_mensual, dias, auxilio_transporte)
    c = cesantias(salario_mensual, dias)
    i = intereses_cesantias(c["cesantias"], dias)
    return {
        "dias_trabajados": dias,
        "prima": p,
        "cesantias": c,
        "intereses": i,
        "total_prestaciones": round(p["prima"] + c["cesantias"] + i["intereses"], 2),
    }
