# 🇨🇴 ContaIA Colombia

**Asistente contable y tributario con IA para contadores colombianos.**

ContaIA Colombia es una herramienta web didáctica que ayuda a los contadores
colombianos a automatizar los cálculos y trámites de las diferentes épocas del
año contable: **declaración de renta, exógenas, prima de servicios, cesantías**
y más — siempre alineada con el **Estatuto Tributario**, la normativa DIAN y
el **Código Sustantivo del Trabajo**.

> ⚠️ **Aviso importante:** ContaIA es una herramienta de apoyo y aprendizaje.
> No reemplaza el criterio profesional del contador público ni la asesoría
> legal. Verifique siempre las cifras contra la norma vigente antes de
> presentar ante la DIAN.

---

## ✨ ¿Qué puede hacer?

| Módulo | Descripción |
|---|---|
| 🧾 **Liquidador de Renta** | Calcula el impuesto de renta de persona natural y jurídica (art. 241 ET) con las tarifas y UVT del año seleccionado. |
| 📊 **Validador de Exógenas** | Revisa que sus archivos de medios magnéticos (formatos 1003/1004) tengan las columnas correctas antes de cargarlos a la DIAN. |
| 💰 **Nómina y Prestaciones** | Calcula prima de servicios, cesantías e intereses a las cesantías con un asistente paso a paso. |
| 📅 **Calendario Tributario** | Fechas típicas de vencimiento de renta, exógenas, IVA, retención, factores… con recordatorios. |
| 🤖 **Asistente IA** | Un asistente conversacional que responde preguntas contables y redacta textos — **con escudo anti-fuga de datos integrado**. |
| 🛡️ **Escudo Anti-Fuga** | Antes de que cualquier documento o texto salga hacia la IA, ContaIA detecta y oculta cédulas, NITs, cuentas bancarias, correos y teléfonos. |

---

## 🚀 Cómo iniciar (sin conocimientos técnicos)

Solo necesita **Python 3.10 o superior**. Siga estos pasos:

### 1. Instalar Python
Descárguelo de [python.org](https://www.python.org/downloads/) (en Windows marque
la casilla **"Add Python to PATH"** durante la instalación).

### 2. Descargar el proyecto
```bash
git clone https://github.com/TU-USUARIO/contaia-colombia.git
cd contaia-colombia
```
*(Si no usa git, descargue el botón **Code → Download ZIP** y descomprima.)*

### 3. Instalar lo necesario
```bash
pip install -r requirements.txt
```

### 4. (Opcional) Activar el asistente IA
```bash
copy .env.example .env      # Windows
cp .env.example .env        # Mac / Linux
```
Luego abra el archivo `.env` con el Bloc de notas y pegue su clave de API
(OpenAI, Anthropic, etc.). **Sin clave, la herramienta funciona igual** — solo
el chat con IA queda desactivado.

### 5. Abrir la herramienta
```bash
streamlit run app.py
```
¡Listo! Se abrirá en su navegador en `http://localhost:8501`.

---

## 🛡️ Seguridad y protección de datos

- **Procesamiento local:** todos los cálculos (renta, nómina, validación de
  exógenas) se ejecutan en su computador. Ningún dato contable sale de él.
- **Escudo anti-fuga:** antes de enviar texto a la IA, el detector busca
  cédulas (CC), NITs, tarjetas, cuentas bancarias, correos, teléfonos y CLP
  (claves operativas), las **oculta automáticamente** y muestra un informe de
  lo que fue protegido.
- **Sin almacenamiento:** ContaIA no guarda archivos ni resultados; al cerrar
  la pestaña todo se olvida.
- Detalles técnicos en [`docs/SEGURIDAD.md`](docs/SEGURIDAD.md).

---

## 🗺️ Hoja de ruta

- [x] Liquidador de renta con UVT configurable
- [x] Validador de exógenas 1003/1004
- [x] Prima de servicios / cesantías / intereses
- [x] Calendario tributario
- [x] Asistente IA con escudo anti-fuga
- [ ] Retención en la fuente (art. 383 ET)
- [ ] IVA bimestral — asistente de declaración
- [ ] Generación de plantillas Excel listas para DIAN
- [ ] Facturación electrónica DIAN (v2)

---

## 🤝 Contribuir

¡Las sugerencias de contadores son bienvenidas! Abra un *issue* o envíe un
*pull request*. Las normas se actualizan cada año — si detecta una tarifa o
fecha desactualizada, avísenos.

## 📄 Licencia

MIT — vea [LICENSE](LICENSE).
