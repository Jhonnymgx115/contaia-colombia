"""Pruebas del módulo de seguridad — escudo anti-fuga de datos."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.seguridad.guardia_datos import escanear, escanear_o_bloquear


def test_sin_datos_sensibles():
    informe = escanear("¿Qué es la renta líquida gravable según el Estatuto Tributario?")
    assert not informe.hay_datos
    assert informe.texto_seguro == informe.texto_original


def test_detecta_y_oculta_cedula():
    informe = escanear("El cliente con cédula 1023456789 pregunta por su declaración.")
    assert informe.hay_datos
    assert "1023456789" not in informe.texto_seguro


def test_detecta_correo():
    informe = escanear("Escríbeme a juan.perez@empresa.com para coordinar.")
    assert any(h.categoria == "Correo electrónico" for h in informe.hallazgos)
    assert "juan.perez@empresa.com" not in informe.texto_seguro


def test_detecta_tarjeta():
    informe = escanear("Se pagó con la tarjeta 4111111111111111.")
    assert any(h.categoria == "Tarjeta / cuenta bancaria" for h in informe.hallazgos)
    assert "4111111111111111" not in informe.texto_seguro


def test_detecta_clave_operativa():
    informe = escanear("La clave: miSecreto2024 para entrar a MUISCA.")
    assert any("Clave" in h.categoria for h in informe.hallazgos)
    assert "miSecreto2024" not in informe.texto_seguro


def test_detecta_nit_con_dv():
    informe = escanear("Facturamos al NIT 900.123.456-1 del proveedor.")
    assert any("NIT" in h.categoria for h in informe.hallazgos)
    assert "900.123.456-1" not in informe.texto_seguro


def test_bloqueo_con_enmascarado():
    puede, informe = escanear_o_bloquear("Correo: ana.gomez@firma.co, teléfono 3101234567")
    assert puede  # se permite enviar SOLO enmascarado
    assert "ana.gomez@firma.co" not in informe.texto_seguro
    assert "3101234567" not in informe.texto_seguro


def test_informe_resumen_legible():
    informe = escanear("cédula 1012345678 en el contrato")
    resumen = informe.resumen()
    assert "OCULTADOS" in resumen
