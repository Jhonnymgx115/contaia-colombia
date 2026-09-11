# Base de datos PostgreSQL de ContaIA

```bash
docker compose -f db/docker-compose.yml up -d   # levantar PostgreSQL 16
cp .env.example .env.local                       # configurar DATABASE_URL
npx prisma generate                              # generar cliente
npx prisma migrate dev --name inicial            # crear tablas
npm run dev                                      # la app con historial
```

Los datos (cifras de liquidaciones, bitácora del escudo) quedan en el
volumen `contaia_pgdata` de su máquina. Nunca se guardan datos personales.
