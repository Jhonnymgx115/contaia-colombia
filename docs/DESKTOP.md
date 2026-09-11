# 🖥️ ContaIA Colombia — Aplicación de Escritorio

Electron + Next.js + **PostgreSQL embebida**. Sin Docker, sin instalar
Postgres: la base de datos vive dentro de la aplicación y sus datos en la
carpeta de usuario (Windows: `%APPDATA%/contaia-colombia`, Linux:
`~/.config/contaia-colombia`, macOS: `~/Library/Application Support/contaia-colombia`).

> **Nota sobre iOS:** Electron no empaqueta para iOS (Apple no lo permite para
> apps de escritorio ni móviles con este motor). Cubrimos **Windows, Linux y
> macOS**. Para iPhone/iPad el camino correcto sería una app con Capacitor o
> React Native reutilizando esta misma lógica en `lib/` — está anotado en la
> hoja de ruta del README.

## Desarrollo

```bash
npm install
npm run electron:dev     # build + ventana de escritorio con Postgres embebida
```

## Generar instaladores

En cada sistema operativo (electron-builder necesita el SO nativo; o use la
acción de GitHub `.github/workflows/desktop.yml`, que genera los tres):

```bash
npm run dist:win    # ContaIA-Colombia-Setup-x.y.z.exe (NSIS) + portable
npm run dist:linux  # .AppImage y .deb
npm run dist:mac    # .dmg
```

Los instaladores salen en `dist-empaquetado/`.

## Arquitectura

```
┌─ Electron (main.cjs) ─────────────────────────────┐
│  1. PostgreSQL embebida (embedded-postgres)       │
│     → datos en carpeta de usuario, persistentes   │
│  2. Servidor Next.js standalone (server.js)       │
│     → 127.0.0.1, solo local                       │
│  3. Ventana Electron → http://127.0.0.1:38501     │
└───────────────────────────────────────────────────┘
```

- **Todo corre local**: ni la base de datos ni la interfaz salen del equipo.
- La base se inicializa sola (SQL idempotente en `electron/servicios.cjs`).
- El escudo anti-fuga aplica igual antes de cualquier llamada externa a la IA.
