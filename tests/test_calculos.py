"""Pruebas de los cálculos contables: renta, exógenas y nómina."""

import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import pandas as pd

from src.herramientas.renta import liquidar
from src.herramientas.exogenas import validar_exogenas, digito_verificacion_nit
from src.herramientas.nomina import prima_servicios, cesantias, intereses_cesantias


# ── Renta ──────────────────────────────────────────────────────────────────

def test_renta_baja_no_paga():
    r = liquidar(ingresos_totales=40_000_000, anio=2025)
    # 40 millones COP ≈ 803 UVT (2025: UVT 49.799) → dentro del tramo 0%.
    assert r["impuesto_basico_cop"] == 0.0


def test_renta_con_tarifa_marginal():
    # Persona jurídica: sin exenciones, la renta gravable son los ingresos.
    r = liquidar(ingresos_totales=100_000_000, anio=2025, es_persona_natural=False)
    assert r["impuesto_basico_cop"] > 0
    # Verifica que la base en UVT sea coherente con la UVT de 2025.
    assert abs(r["base_uvt"] - 100_000_000 / 49_799) < 0.01


def test_exencion_laboral_reduccion():
    # Con ingresos altos, la exención laboral (790 UVT) reduce el impuesto.
    sin_exencion = liquidar(300_000_000, anio=2025, es_persona_natural=False)
    con_exencion = liquidar(300_000_000, anio=2025, es_persona_natural=True)
    assert con_exencion["impuesto_basico_cop"] < sin_exencion["impuesto_basico_cop"]


def test_tope_de_exenciones_persona_natural():
    # Exentas enormes: deben ajustarse al tope de 2.400 UVT (2025 ≈ 119.5 M).
    r = liquidar(
        ingresos_totales=200_000_000,
        rentas_exentas=500_000_000,
        anio=2025,
        es_persona_natural=True,
        ingresos_laborales=0.0,  # desactiva la exención laboral para aislar el tope
    )
    tope = 2_400 * 49_799
    assert r["rentas_exentas"] <= tope + 0.01


# ── Exógenas ───────────────────────────────────────────────────────────────

def test_digito_verificacion_nit_oficial():
    # NIT de prueba calculado con el algoritmo oficial DIAN (módulo 11).
    assert digito_verificacion_nit("900123456") == 8


def test_validador_exogenas_formato_completo():
    df = pd.DataFrame(
        columns=[
            "NIT", "Primer Apellido", "Segundo Apellido", "Primer Nombre",
            "Otros Nombres", "Razón Social", "Dirección", "Departamento",
            "Municipio", "País", "Ingresos", "Aportes a Seguridad Social",
            "Pensiones", "Otros Ingresos", "Consignaciones y Pagos",
        ]
    )
    informe = validar_exogenas(df, "1003")
    assert informe["estado"] == "LISTO"


def test_validador_detecta_faltantes():
    df = pd.DataFrame(columns=["NIT", "Razón Social", "Ingresos"])
    informe = validar_exogenas(df, "1004")
    assert informe["estado"] == "CON OBSERVACIONES"
    assert len(informe["columnas_faltantes"]) > 0


# ── Nómina ─────────────────────────────────────────────────────────────────

def test_prima_semestre_completo():
    p = prima_servicios(salario_mensual=2_000_000, dias_semestre=180)
    # 15 días de salario: 2.000.000 / 2
    assert abs(p["prima"] - 1_000_000) < 0.01


def test_prima_prorrateada():
    p = prima_servicios(salario_mensual=2_000_000, dias_semestre=90)
    assert abs(p["prima"] - 500_000) < 0.01


def test_cesantias_anio_completo():
    c = cesantias(salario_mensual=2_000_000, dias_trabajados=360)
    assert abs(c["cesantias"] - 2_000_000) < 0.01


def test_intereses_cesantias_12():
    i = intereses_cesantias(valor_cesantias=2_000_000, dias_trabajados=360)
    assert abs(i["intereses"] - 240_000) < 0.01


def test_periodo_con_fecha():
    from src.herramientas.nomina import liquidacion_completa
    r = liquidacion_completa(
        salario_mensual=1_500_000,
        fecha_ingreso=date(2025, 1, 1),
        fecha_fin=date(2025, 6, 30),
    )
    assert r["dias_trabajados"] == 181  # enero-junio incluye ambos extremos
