"""Página de inicio — bienvenida y mapa de la herramienta."""

import streamlit as st


def pagina_inicio():
    st.title("🇨🇴 ContaIA Colombia")
    st.markdown(
        """
        Bienvenido, contador(a). 👋 Esta herramienta lo acompaña en las
        **diferentes épocas del año contable**: declaración de renta, exógenas,
        prima de servicios, cesantías y más. Todo se calcula **en su
        computador**, con las normas colombianas vigentes y con IA de apoyo.
        """
    )

    c1, c2, c3 = st.columns(3)
    with c1:
        st.info("🧾 **Liquidador de Renta**\n\nCalcule el impuesto con la tarifa del art. 241 ET, paso a paso y sin fórmulas de Excel.", icon="🧾")
    with c2:
        st.info("📊 **Validador de Exógenas**\n\nRevise su archivo 1003/1004 **antes** de subirlo a la DIAN y evite rechazos.", icon="📊")
    with c3:
        st.info("💰 **Nómina y Prestaciones**\n\nPrima de servicios, cesantías e intereses, con la fórmula explicada.", icon="💰")

    c4, c5, c6 = st.columns(3)
    with c4:
        st.info("📅 **Calendario**\n\nLas fechas típicas de cada obligación, ordenadas por cercanía.", icon="📅")
    with c5:
        st.info("🤖 **Asistente IA**\n\nPregunte lo que quiera; el escudo anti-fuga protege sus datos.", icon="🤖")
    with c6:
        st.info("📖 **Guía Rápida**\n\nTodo lo que necesita saber en 5 minutos, sin tecnicismos.", icon="📖")

    st.divider()
    st.subheader("🛡️ ¿Cómo lo protegemos?")
    st.markdown(
        """
        1. **Sus datos no salen de su computador:** los cálculos de renta,
           nómina y exógenas ocurren aquí, localmente.
        2. **Escudo anti-fuga:** si usa el Asistente IA, antes de enviar su
           texto buscamos cédulas, NITs, tarjetas, cuentas, correos, teléfonos
           y claves; los **ocultamos automáticamente** y le mostramos qué se
           protegió.
        3. **No guardamos nada:** cierre la pestaña y la herramienta olvida todo.
        """
    )
    st.success(
        "💡 **Empiece por la Guía Rápida** (menú lateral) o vaya directo al "
        "módulo que necesite hoy."
    )
