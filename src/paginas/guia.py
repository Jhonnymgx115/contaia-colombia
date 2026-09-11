"""Página de Guía Rápida — todo lo esencial en 5 minutos."""

import streamlit as st


def render():
    st.title("📖 Guía Rápida")
    st.markdown(
        "Todo lo que necesita saber para usar ContaIA Colombia, sin tecnicismos "
        "y en 5 minutos."
    )

    st.subheader("1️⃣ El año contable colombiano, de un vistazo")
    st.markdown(
        """
        | Época | Qué toca | Módulo que lo ayuda |
        |---|---|---|
        | Enero–Febrero | Intereses a cesantías (31 ene), consignar cesantías (14 feb) | 💰 Nómina |
        | Marzo–Junio | Bimestres de IVA; renta de personas jurídicas; exógenas de empresas (mayo–junio) | 📊 Exógenas, 📅 Calendario |
        | Junio y Diciembre | Prima de servicios (30 jun / 20 dic) | 💰 Nómina |
        | Agosto–Octubre | Declaración de renta de personas naturales (por NIT) | 🧾 Renta |
        | Octubre | Exógenas de personas naturales | 📊 Exógenas |
        """
    )

    st.subheader("2️⃣ Conceptos que hay que tener claros")
    with st.expander("¿Qué es la UVT y por qué importa tanto?"):
        st.markdown(
            "La **UVT** (Unidad de Valor Tributario) es la “medida” del sistema "
            "tributario: casi todos los topes y tarifas se expresan en UVT. Su "
            "valor cambia cada año (en 2025 fue **$49.799**). ContaIA la aplica "
            "automáticamente según el año gravable que elija."
        )
    with st.expander("¿Qué es la tarifa marginal del art. 241 ET?"):
        st.markdown(
            "Es una tarifa **por tramos**: la primera porción de su base se "
            "grava al 0%, la siguiente al 19%, y así hasta el 37%. **No** es "
            "que todo el ingreso se grave con la tarifa del último tramo. El "
            "liquidador le muestra el desglose por tramo."
        )
    with st.expander("¿Qué son las exógenas?"):
        st.markdown(
            "Son reportes de **medios magnéticos** donde informa a la DIAN "
            "terceros con quienes tuvo transacciones (pagos, compras, honorarios…). "
            "Se presentan por formatos (1003 para personas naturales, 1004 para "
            "jurídicas) según la Resolución 000162 de 2016. El validador revisa "
            "su archivo **antes** de subirlo, para evitar rechazos."
        )
    with st.expander("¿Por qué el escudo anti-fuga es tan importante?"):
        st.markdown(
            "Cuando usa la IA, su texto sale de su computador hacia un servicio "
            "externo. La **Ley 1581 de 2012** (protección de datos personales) y "
            "el deber de reserva del contador (Ley 43 de 1990, art. 6) obligan a "
            "minimizar lo que se comparte. Por eso el escudo detecta y oculta "
            "datos sensibles **antes** de enviar nada, y le muestra el informe."
        )

    st.subheader("3️⃣ Consejos de uso")
    st.markdown(
        """
        - ✅ Use el liquidador para **verificar** sus cálculos, no como única fuente.
        - ✅ En exógenas, valide el archivo **antes** de la fecha límite; el validador no reemplaza la resolución vigente.
        - ⚠️ En el asistente IA, no pegue bases de datos completas de clientes; pregunte conceptos, no datos.
        - 🔄 Verifique en el README las actualizaciones de UVT y tarifas cada año gravable.
        """
    )

    st.subheader("4️⃣ ¿Problemas técnicos?")
    st.markdown(
        """
        - La app no abre: confirme que ejecutó `streamlit run app.py` en la carpeta del proyecto.
        - El asistente IA dice "sin configuración": necesita el archivo `.env` con su clave (README, paso 4).
        - Un Excel no carga: guárdelo como `.xlsx` (Excel moderno) o `.csv` e intente de nuevo.
        """
    )
