# Tags API

**EN:** Express + SQLite taxonomy — tags CRUD, items with many-to-many tags, filter `?tag=`, Zod validation, Node 22 `node:sqlite`.

**ES:** API de etiquetas e ítems con relación N:N.

## Setup
```bash
npm install && npm run init-db && npm start
```
Port: `3883`.

## curl
```bash
curl http://localhost:3883/api/tags
curl http://localhost:3883/api/items?tag=frontend
curl -X POST http://localhost:3883/api/tags -H "Content-Type: application/json" -d "{\"name\":\"backend\",\"color\":\"#34d399\"}"
curl -X POST http://localhost:3883/api/items -H "Content-Type: application/json" -d "{\"title\":\"New demo\",\"tag_ids\":[1,2]}"
```

## Author
Juliana Chantre Astudillo — MIT License
