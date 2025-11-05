## Express + Mongo API (Uber Eats demo)

### Local setup

```bash
cd server
npm install
cp .env.example .env
# update MONGO_URI / JWT_SECRET if needed
```

### Run the API in development

```bash
npm run dev
```

The API listens on `http://localhost:4000` by default.

### Seed MongoDB

Make sure MongoDB is running (local or Docker) then:

```bash
npm run seed
```

Seed files:

- `categories.json`
- `restaurants.json`
- `users.json` (passwords are hashed during seeding)

### Cart endpoints (JWT protected)

- `GET /api/cart` – get current cart (auto creates an empty cart)
- `POST /api/cart/items` – add or increment an item (`{ item, quantity }`)
- `PATCH /api/cart/items/:itemKey` – update quantity
- `DELETE /api/cart/items/:itemKey` – remove an item
- `DELETE /api/cart` – clear the cart

### Docker

Use `docker compose up --build` at repo root to start Mongo, the API, and the frontend. The API service name is `api` (port `4000` inside Docker).
