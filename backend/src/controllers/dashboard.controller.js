import { prisma } from '../lib/prisma.js';

// El mapa lo aporta feature/recommendation-engine; mientras esté vacío el
// tablero responde sin géneros en lugar de fallar.
import { EMOTION_GENRES } from '../lib/emotionGenres.js';

// El tablero dibuja una línea de tiempo corta; se limita para no responder
// con todo el historial del usuario.
const MOODS_TIMELINE = 50;
const GENRES_TOP = 6;
const GENRE_NAMES = {
  12: 'Aventura',
  16: 'Animación',
  18: 'Drama',
  35: 'Comedia',
  878: 'Ciencia ficción',
  9648: 'Misterio',
  10751: 'Familia',
  10759: 'Acción y aventura',
  10765: 'Ciencia ficción y fantasía'
};


export async function getDashboard(req, res, next) {
  try {
    const where = { userId: req.user.id };

    const [moods, moodCounts] = await Promise.all([
      prisma.moodEntry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        select: { emotion: true, createdAt: true },
        take: MOODS_TIMELINE
      }),
      prisma.moodEntry.groupBy({
        by: ['emotion'],
        where,
        _count: { _all: true }
      })
    ]);

    // Un género puede salir de varias emociones, así que se suman sus coincidencias
    const genresByName = new Map();

    for (const { emotion, _count } of moodCounts) {
  const emotionGenres = EMOTION_GENRES[emotion];

  if (!emotionGenres) continue;

  const genreIds = new Set([
    ...emotionGenres.movie,
    ...emotionGenres.tv
  ]);

  for (const genreId of genreIds) {
    const name = GENRE_NAMES[genreId];

    if (!name) continue;

    genresByName.set(
      name,
      (genresByName.get(name) ?? 0) + _count._all
    );
  }
}

    const genres = [...genresByName.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
      .slice(0, GENRES_TOP);

    return res.status(200).json({ moods, genres });
  } catch (error) {
    next(error);
  }
}
