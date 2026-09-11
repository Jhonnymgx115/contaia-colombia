# 🚀 Despliegue de ContaIA (rama `v0`) a v0.app / Vercel

La rama `v0` es un proyecto **Next.js 15 + Tailwind estándar**, exactamente la
estructura que esperan v0.app y Vercel (App Router, `app/` en la raíz).

## Opción A — Usar v0 (v0.app)

1. Entre a [v0.app](https://v0.app) con su cuenta de Vercel.
2. Use **"Import from GitHub"** (o pegue el repo en un chat con `@code`) y
   seleccione `Jhonnymgx115/contaia-colombia`, rama `v0`.
3. v0 detectará Next.js + Tailwind automáticamente y podrá seguir editando la
   interfaz con IA, luego hacer **Deploy** con un clic (crea el proyecto en
   Vercel por usted).

## Opción B — Vercel directo (sin v0)

```bash
npm i -g vercel
git checkout v0
vercel --prod          # acepte los valores por defecto
```

## Variables de entorno (para el Asistente IA)

En Vercel: *Settings → Environment Variables*:

| Variable | Valor |
|---|---|
| `IA_API_KEY` | su clave de OpenAI o Anthropic |
| `IA_PROVEEDOR` | `openai` o `anthropic` |
| `IA_MODELO` | p. ej. `gpt-4o-mini` |

Sin clave, la app funciona igual: solo el chat con IA responde que está
desactivado. **El escudo anti-fuga corre siempre**, con o sin IA.

## ¿Y la base de datos?

La rama `v0` es sin base de datos (ideal para el prototipo en v0). Para
historial persistente use la rama `web` (PostgreSQL con Prisma; en Vercel
conecte un Postgres como Neon/Supabase con `DATABASE_URL`) o la rama
`desktop` (PostgreSQL embebida en la app de escritorio, todo local).
