# 📋 Integración con Formplus — verificación de viabilidad

**Veredicto (verificado 2026-09): Formplus no ofrece una API REST pública.**
Su documentación no publica endpoints de consulta de formularios y varias
fuentes de comparación de software indican que no provee API. Lo que sí
soporta oficialmente son **webhooks**: Formplus puede enviar cada respuesta
del formulario por POST a una URL nuestra.

## Cómo queda la integración (vía soportada)

1. En Formplus: **Form → Settings → Integrations → Webhooks**.
2. URL del webhook: `https://SU-DOMINIO/api/formplus/webhook`
3. (Recomendado) Defina `FORMPLUS_SECRETO` en `.env.local`; el webhook debe
   enviarlo en el encabezado `x-contaia-secreto`.
4. El formulario debe incluir campos cuyo nombre contenga:
   - **ingresos** (obligatorio)
   - no constitutivos · costos · exentas · año gravable · tipo (natural/jurídica) — opcionales

Cada respuesta del formulario se convierte automáticamente en una
**liquidación guardada en PostgreSQL** y aparece en `/historial`.

## Escudo anti-fuga también aquí

Antes de guardar, el contenido del formulario pasa por el escudo: si un
campo trae cédulas o datos sensibles, **no se registran**; la respuesta del
webhook informa cuántos datos fueron protegidos.

## Alternativa probada para "Formplus-like"

Si lo que necesita es formularios con API abierta, considere alternativas
con API documentada (p. ej. Form.io, Baserow, NocoDB autoalojados). Nuestra
implementación webhook funciona con cualquiera de ellas enviando el mismo
formato JSON.

## Prueba local (sin Formplus)

```bash
curl -X POST http://localhost:3200/api/formplus/webhook \
  -H "Content-Type: application/json" \
  -d '{"campos":[{"label":"ingresos totales","value":80000000},{"label":"tipo","value":"natural"}]}'
```
