# 🚀 Guía de inicio — ContaIA Colombia (todas las versiones)

Todas las ramas están subidas a GitHub. Esta es la manera de iniciar cada
versión cuando la necesite.

## 1. Web completa (rama `web`) — la principal

Interfaz moderna + PostgreSQL + IA (Gemini, DeepSeek, OpenAI, Claude) +
Excel/LibreOffice + Formplus.

```bash
git checkout web
npm install
# Base de datos local (PostgreSQL 17 real, sin Docker; los datos quedan
# guardados en .db-local/ entre sesiones):
npm run db:local          # en una terminal, la deja corriendo
# en otra terminal:
npm run dev               # → http://localhost:3200 (o el puerto que muestre)
```

Con datos reales (SIGEP II de datos.gov.co): `npm run seed:real`
Respaldo del historial a Google Drive: `npm run backup:drive` (requiere
cuenta de servicio — ver encabezado de scripts/respaldar-drive.mjs)

## 2. Prototipo v0 (rama `v0`) — para v0.app / Vercel

```bash
git checkout v0
npm install
npm run dev               # o impórtelo en https://v0.app / `vercel --prod`
```

## 3. Aplicación de escritorio (rama `desktop`)

```bash
git checkout desktop
npm install
npm run electron:dev      # ventana de escritorio con PostgreSQL embebida
# Instaladores: npm run dist:win | dist:linux | dist:mac
# (o descárguelos de GitHub → Actions → "Empaquetado de escritorio")
```

## 4. Versión original Streamlit (rama `main`)

```bash
git checkout main
pip install -r requirements.txt
streamlit run app.py      # → http://localhost:8501
```

## Claves de IA

En `.env.local` (excluido de git): `GEMINI_API_KEY`, `DEEPSEEK_API_KEY`,
`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`. El escudo anti-fuga corre siempre.

## Acceso sin localhost (producción)

Vea docs/DESPLIEGUE_V0.md: despliegue en Vercel/v0.app con base de datos
en la nube (Neon/Supabase) y variables de entorno.
