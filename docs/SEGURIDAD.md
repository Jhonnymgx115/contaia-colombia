# 🛡️ Documento de Seguridad — ContaIA Colombia

## Principios

1. **Procesamiento local primero.** Todos los cálculos (renta, nómina,
   validación de exógenas) corren en el computador del usuario con Python.
   Ningún dato contable se transmite a ningún servidor.
2. **Minimización de datos (Ley 1581 de 2012).** Solo se envía a un servicio
   externo lo estrictamente necesario para responder, y siempre después de
   pasar por el escudo anti-fuga.
3. **Sin persistencia.** La aplicación no escribe archivos de usuario en
   disco: los Excel/CSV se leen en memoria y se descartan al cerrar la pestaña.

## El escudo anti-fuga (`src/seguridad/guardia_datos.py`)

Toda comunicación hacia un proveedor de IA pasa obligatoriamente por
`src/ia/asistente.py`, que llama a `escanear()` antes de enviar. El escudo
detecta y enmascara:

| Categoría | Ejemplo | Enmascarado |
|---|---|---|
| Cédula / identificación etiquetada | `cédula 1023456789` | `102***789` |
| NIT con dígito de verificación | `900.123.456-1` | `9001***4561` |
| Tarjetas Visa/Mastercard/Amex | `4111…1111` | `4111***1111` |
| Correos electrónicos | `juan@empresa.com` | `ju***@empresa.com` |
| Celulares colombianos | `310 123 4567` | `310***567` |
| Claves / tokens (CLP, MUISCA) | `clave: MiS3cr3t0` | `**********` |
| Direcciones IP | `192.168.1.10` | `************` |

La ruta del dato es: **usuario → escaneo → enmascaramiento → informe en
pantalla → (solo versión segura) proveedor de IA**. El usuario ve siempre qué
se protegió y puede inspeccionar la versión enmascarada exacta que se envió.

## Gestión de secretos

- Las claves de API viven en un archivo `.env` **local**, excluido de git vía
  `.gitignore`. El repositorio solo contiene `.env.example` con valores de
  ejemplo.
- **Nunca** pegue claves en el código, en issues ni en mensajes de commit.

## Limitaciones conocidas

- **Números de documento "sueltos":** si el usuario pega listas de cédulas sin
  ninguna etiqueta ni formato (p. ej. `1023456789, 79876543`), el escudo no
  puede distinguirlas de montos o fechas y por ahora **no las enmascara**.
  Ver issue correspondiente en GitHub. Mientras tanto, la guía al usuario es
  clara: no pegue bases de datos completas de clientes.
- El detector es heurístico (patrones), no perfecto: un dato escrito de forma
  inusual podría no detectarse.
- El enmascaramiento altera la pregunta original; el usuario decide si
  envía la versión segura o descarta el envío.

## Reporte de vulnerabilidades

Si encuentra un problema de seguridad, abra un *issue* con la etiqueta
`security` o contacte directamente a los mantenedores. Por favor no publique
detalles de explotación hasta que se publique la corrección.
