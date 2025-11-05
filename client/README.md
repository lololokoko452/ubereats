# Uber Eats Demo (full stack)

This repository contains:

- Vue 2 + Vuetify frontend (login, home, restaurant details, cart modal)
- Express API + MongoDB (auth, catalog, cart, search)
- Seed files to populate Mongo with demo data

## Requirements

- Node.js 18+
- MongoDB 6+ (local instance or Docker)

## Local development

### Frontend

```bash
npm install
npm run serve
```

By default the frontend targets `http://localhost:4000/api`. You can override it in `.env.development`.

### API

```bash
cd server
npm install
cp .env.example .env
# update MONGO_URI / JWT_SECRET if needed
npm run dev
```

### Seed the database

```bash
cd server
npm run seed
```

Seed files live in `server/seeds/` (`categories.json`, `restaurants.json`, `users.json`).

## Docker workflow

`docker-compose.yml` now runs Mongo, the API, and the frontend (served by nginx).

```bash
docker compose up --build
```

Services:

- `mongo` on port `27017`
- `api` on port `4000`
- `web` on port `8080` (static Vue build, proxies `/api` to the API container)

For production builds only:

```bash
docker build -t ubereats-web .
docker run -p 8080:80 ubereats-web
```

## Useful npm scripts

- `npm run build` – production build for the frontend
- `npm run lint` – lint the frontend codebase
- `server/npm run start` – start the API in production mode
