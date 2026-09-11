# 📖 Manual de Usuario — ContaIA Colombia

*Guía para contadores sin conocimientos técnicos. No necesita programar.*

---

## 1. Instalación (solo la primera vez)

1. **Instale Python** desde [python.org/downloads](https://www.python.org/downloads/)
   (versión 3.10 o superior). En Windows, marque **"Add Python to PATH"**.
2. **Descargue el proyecto** (botón verde `Code → Download ZIP`) y descomprímalo.
3. Abra una terminal **dentro de la carpeta del proyecto**:
   - Windows: abra la carpeta, haga clic en la barra de dirección, escriba
     `cmd` y presione Enter.
   - Mac/Linux: abra Terminal y arrastre la carpeta al ventana.
4. Instale las dependencias:
   ```
   pip install -r requirements.txt
   ```

## 2. Abrir la herramienta (todos los días)

En la misma terminal:
```
streamlit run app.py
```
Se abrirá su navegador en `http://localhost:8501`. Para cerrarla, presione
`Ctrl + C` en la terminal.

## 3. Activar el Asistente IA (opcional)

1. Copie el archivo `.env.example` y renómbrelo `.env`.
2. Ábralo con el Bloc de notas y pegue su clave de API.
3. Guarde y reinicie la app.

## 4. Usar cada módulo

### 🧾 Liquidador de Renta
Ingrese ingresos, no constitutivos, costos/deducciones y exenciones del año
gravable. La herramienta muestra el impuesto **y el camino paso a paso**
(tramos del art. 241 ET incluidos), ideal para soportar sus cifras.
> Tip: tome los datos del informe de ingresos de su software contable.

### 📊 Validador de Exógenas
Suba su CSV/Excel del formato 1003 o 1004. Verá columnas faltantes, filas con
NIT dudosos y una vista previa. **Corrija y revalide antes** de la fecha DIAN.
> Su archivo nunca sale del computador ni se guarda.

### 💰 Nómina y Prestaciones
Salario + fechas del periodo → prima, cesantías e intereses, con las fórmulas
explicadas para conciliar con su nómina.

### 📅 Calendario Tributario
Las 4 obligaciones más cercanas primero; abajo, la temporada completa con su
norma. Confirme siempre la resolución DIAN del año.

### 🤖 Asistente IA
Escriba su pregunta. Si el escudo detecta datos sensibles, los oculta y le
muestra el informe antes de responder. Pregunte conceptos, no datos de clientes.

## 5. Preguntas frecuentes

**¿Se guardan mis archivos?** No. Todo vive en memoria mientras la pestaña
está abierta.

**¿Funciona sin internet?** Todos los módulos, sí; solo el chat con IA
requiere conexión.

**¿Sirve para hacer la declaración oficial?** Es una herramienta de apoyo:
los cálculos le sirven de verificación y estudio, pero la declaración se
presenta en MUISCA con el criterio profesional del contador.

**¿Cómo se actualiza la UVT?** Cada año, un colaborador agrega la fila del
nuevo valor en `src/datos/uvt.py` y se publica una nueva versión.
