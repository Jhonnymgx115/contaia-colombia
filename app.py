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
    st.Page(inicio.render, title="Inicio", icon="🏠", default=True),
    st.Page(renta.render, title="Liquidador de Renta", icon="🧾"),
    st.Page(exogenas.render, title="Validador de Exógenas", icon="📊"),
    st.Page(nomina.render, title="Nómina y Prestaciones", icon="💰"),
    st.Page(calendario.render, title="Calendario Tributario", icon="📅"),
    st.Page(asistente.render, title="Asistente IA", icon="🤖"),
    st.Page(guia.render, title="Guía Rápida", icon="📖"),
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
