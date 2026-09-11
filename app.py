"""
Aplicación principal de ContaIA Colombia.

Ejecutar con:  streamlit run app.py
"""

import sys
from pathlib import Path

# Permite importar src/ tanto con `streamlit run app.py` desde la raíz
# como desde cualquier otro directorio de trabajo.
sys.path.insert(0, str(Path(__file__).parent))

import streamlit as st

from src.paginas import inicio, renta, exogenas, nomina, calendario, asistente, guia

st.set_page_config(
    page_title="ContaIA Colombia",
    page_icon="🇨🇴",
    layout="wide",
    initial_sidebar_state="expanded",
)

PAGINAS = [
    st.Page(inicio.pagina_inicio, title="Inicio", icon="🏠", default=True),
    st.Page(renta.pagina_renta, title="Liquidador de Renta", icon="🧾", url_path="renta"),
    st.Page(exogenas.pagina_exogenas, title="Validador de Exógenas", icon="📊", url_path="exogenas"),
    st.Page(nomina.pagina_nomina, title="Nómina y Prestaciones", icon="💰", url_path="nomina"),
    st.Page(calendario.pagina_calendario, title="Calendario Tributario", icon="📅", url_path="calendario"),
    st.Page(asistente.pagina_asistente, title="Asistente IA", icon="🤖", url_path="asistente"),
    st.Page(guia.pagina_guia, title="Guía Rápida", icon="📖", url_path="guia"),
]

with st.sidebar:
    st.markdown("## 🇨🇴 ContaIA Colombia")
    st.caption("Tu asistente contable con IA — hecho para contadores, no para ingenieros.")
    st.divider()

pagina = st.navigation(PAGINAS)
pagina.run()

with st.sidebar:
    st.divider()
    st.caption(
        "🛡️ Todos los cálculos se hacen en su computador. "
        "Antes de enviar algo a la IA, el escudo anti-fuga oculta "
        "sus datos sensibles automáticamente."
    )
    st.caption("⚠️ Herramienta de apoyo didáctico. No reemplaza el criterio profesional del contador público.")
