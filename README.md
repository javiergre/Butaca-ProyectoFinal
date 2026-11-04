# Butaca

Proyecto Final · Programación Web (URL). Recomienda películas y series según el ánimo que detecta la cámara.

```
butaca/
  frontend/   React + Vite
  backend/    Express + Prisma + Supabase
```

## Primeros pasos

```bash
npm run install:all
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
npm run dev:back    # http://localhost:3000
npm run dev:front   # http://localhost:5173 (/api se reenvía al backend)
```

## Contrato de la API

Todas las rutas reciben `Authorization: Bearer <access_token de Supabase>`.

| Método y ruta | Cuerpo | Respuesta |
| --- | --- | --- |
| `GET /api/recommendations?emotion=` | — | `{ results: [{ id, mediaType, title, posterPath, overview }] }` |
| `POST /api/moods` | `{ emotion, confidence }` | `201` |
| `GET /api/favorites` | — | `{ favorites: [{ tmdbId, mediaType, title, posterPath }] }` |
| `POST /api/favorites` | `{ tmdbId, mediaType, title, posterPath }` | `201` |
| `DELETE /api/favorites/:mediaType/:tmdbId` | — | `204` |
| `GET /api/dashboard` | — | `{ moods: [{ emotion, createdAt }], genres: [{ name, count }] }` |

`emotion` ∈ `happy, sad, angry, fearful, surprised, disgusted, neutral`.
