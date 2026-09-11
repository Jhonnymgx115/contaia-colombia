"""Página del Asistente IA — con escudo anti-fuga siempre activo."""

import streamlit as st

from src.ia.asistente import preguntar, ia_disponible

SUGERENCIAS = [
    "Explícame con un ejemplo qué son los ingresos no constitutivos de renta del artículo 45 ET.",
    "¿Qué diferencias hay entre costo y gasto deducible en el Estatuto Tributario?",
    "Prepara una nota interna para un cliente recordándole la fecha de exógenas.",
    "¿Cómo prorrateo la prima de servicios de un empleado que trabajó 3 meses?",
]


def render():
    st.title("🤖 Asistente IA Contable")
    st.markdown(
        "Pregúntele lo que quiera sobre normativa colombiana. Antes de que su "
        "texto viaje a la IA, el **escudo anti-fuga** revisa y oculta "
        "automáticamente cédulas, NITs, tarjetas, cuentas, correos, teléfonos "
        "y claves."
    )

    if not ia_disponible():
        st.warning(
            "🔌 El asistente IA aún **no está activado**: falta la clave de API. "
            "Vea el paso 4 del README para activarla. Los demás módulos "
            "funcionan sin conexión.",
            icon="🔌",
        )
    else:
        st.success("🟢 IA activada — con el escudo anti-fuga siempre encendido.", icon="🛡️")

    st.subheader("💡 Pruébese con una de estas")
    for s in SUGERENCIAS:
        if st.button(s, use_container_width=True):
            st.session_state["pregunta_ia"] = s

    pregunta = st.text_area(
        "Su pregunta o encargo",
        value=st.session_state.get("pregunta_ia", ""),
        height=120,
        placeholder="Ej: ¿Qué documentos necesito para soportar la exención laboral de 790 UVT?",
        help="Consejo: no pegue listas de clientes ni datos de terceros. Si lo hace, el escudo los ocultará igual.",
    )

    enviar = st.button("🚀 Enviar a la IA", type="primary", disabled=not pregunta.strip())

    if enviar:
        resultado = preguntar(pregunta.strip())

        informe = resultado["informe_escaneo"]
        if informe.hay_datos:
            with st.container(border=True):
                st.markdown("### 🛡️ Escudo anti-fuga — informe de protección")
                st.markdown(informe.resumen())
                with st.expander("Ver cómo quedó el texto que se envió (versión segura)"):
                    st.code(informe.texto_seguro)

        if resultado["estado"] == "ok":
            st.markdown("### 🤖 Respuesta")
            st.markdown(resultado["respuesta"])
        else:
            st.info(resultado["respuesta"])

    st.divider()
    with st.expander("🔐 ¿Cómo funciona el escudo anti-fuga?"):
        st.markdown(
            """
            1. **Escaneo:** buscamos en su texto cédulas, NITs con DV, tarjetas
               Visa/Mastercard/Amex, correos, celulares colombianos, direcciones
               IP y claves (palabras como *clave*, *token*, *password* seguidas de texto).
            2. **Enmascaramiento:** cada dato se reemplaza por una versión
               segura, p. ej. `1.023.456.789-4` → `1023******789`.
            3. **Envío:** a la IA solo sale la versión enmascarada; usted ve el
               informe de todo lo que se protegió.
            4. **Minimización** (Ley 1581 de 2012): nunca enviamos más de lo
               necesario para responder su pregunta.
            """
        )
