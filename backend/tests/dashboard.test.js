import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  vi
} from 'vitest';

import request from 'supertest';

const VALID_TOKEN = 'token-valido-para-pruebas';
const USER_ID = 'usuario-de-prueba';

vi.mock('../src/lib/supabase.js', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(async (token) =>
        token === 'token-valido-para-pruebas'
          ? { data: { user: { id: 'usuario-de-prueba' } }, error: null }
          : { data: { user: null }, error: new Error('Token inválido') }
      )
    }
  }
}));

// Mapa de prueba propio: la suma y el orden de géneros son lógica del tablero,
// el contenido real del mapa lo define feature/recommendation-engine.
vi.mock('../src/lib/emotionGenres.js', () => ({
  EMOTION_GENRES: {
    happy: [
      { name: 'Comedia' },
      { name: 'Animación' },
      { name: 'Familia' },
      { name: 'Música' },
      { name: 'Fantasía' }
    ],
    sad: [
      { name: 'Drama' },
      { name: 'Romance' },
      { name: 'Documental' }
    ],
    angry: [
      { name: 'Acción' },
      { name: 'Crimen' },
      { name: 'Aventura' },
      { name: 'Ciencia ficción' }
    ],
    fearful: [
      { name: 'Terror' },
      { name: 'Misterio' },
      { name: 'Fantasía' }
    ],
    disgusted: [
      { name: 'Crimen' },
      { name: 'Misterio' },
      { name: 'Terror' }
    ]
  }
}));

vi.mock('../src/lib/prisma.js', () => ({
  prisma: {
    moodEntry: {
      findMany: vi.fn(),
      groupBy: vi.fn()
    }
  }
}));

import { prisma } from '../src/lib/prisma.js';

let app;

beforeAll(async () => {
  process.env.PORT = '3000';
  process.env.FRONTEND_URL = 'http://localhost:5173';

  const module = await import('../src/app.js');
  app = module.default;
});

beforeEach(() => {
  vi.clearAllMocks();
});

function authed(requestBuilder) {
  return requestBuilder.set('Authorization', `Bearer ${VALID_TOKEN}`);
}

describe('Consultas del tablero - Butaca', () => {

  it('Sin token devuelve HTTP 401 y no consulta la base de datos', async () => {
    const res = await request(app).get('/api/dashboard');

    expect(res.status).toBe(401);
    expect(prisma.moodEntry.findMany).not.toHaveBeenCalled();
    expect(prisma.moodEntry.groupBy).not.toHaveBeenCalled();
  });

  it('GET /api/dashboard devuelve la línea de tiempo y los géneros', async () => {
    vi.mocked(prisma.moodEntry.findMany).mockResolvedValue([
      { emotion: 'angry', createdAt: new Date('2026-11-05T10:00:00.000Z') },
      { emotion: 'disgusted', createdAt: new Date('2026-11-04T10:00:00.000Z') }
    ]);

    vi.mocked(prisma.moodEntry.groupBy).mockResolvedValue([
      { emotion: 'angry', _count: { _all: 3 } },
      { emotion: 'disgusted', _count: { _all: 2 } }
    ]);

    const res = await authed(request(app).get('/api/dashboard'));

    expect(res.status).toBe(200);

    expect(res.body.moods).toEqual([
      { emotion: 'angry', createdAt: '2026-11-05T10:00:00.000Z' },
      { emotion: 'disgusted', createdAt: '2026-11-04T10:00:00.000Z' }
    ]);

    // Crimen pertenece a ambas emociones, así que sus coincidencias se suman
    expect(res.body.genres).toEqual([
      { name: 'Crimen', count: 5 },
      { name: 'Acción', count: 3 },
      { name: 'Aventura', count: 3 },
      { name: 'Ciencia ficción', count: 3 },
      { name: 'Misterio', count: 2 },
      { name: 'Terror', count: 2 }
    ]);
  });

  it('Limita la línea de tiempo y el ranking de géneros', async () => {
    vi.mocked(prisma.moodEntry.findMany).mockResolvedValue([]);

    vi.mocked(prisma.moodEntry.groupBy).mockResolvedValue(
      ['happy', 'sad', 'angry', 'fearful'].map((emotion) => ({
        emotion,
        _count: { _all: 1 }
      }))
    );

    const res = await authed(request(app).get('/api/dashboard'));

    expect(prisma.moodEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 50 })
    );
    expect(res.body.genres.length).toBe(6);

    const counts = res.body.genres.map((genre) => genre.count);
    expect(counts).toEqual([...counts].sort((a, b) => b - a));
  });

  it('Consulta únicamente los registros del usuario autenticado', async () => {
    vi.mocked(prisma.moodEntry.findMany).mockResolvedValue([]);
    vi.mocked(prisma.moodEntry.groupBy).mockResolvedValue([]);

    await authed(request(app).get('/api/dashboard'));

    expect(prisma.moodEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: USER_ID } })
    );
    expect(prisma.moodEntry.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ by: ['emotion'], where: { userId: USER_ID } })
    );
  });

  it('Un usuario nuevo responde con el tablero vacío', async () => {
    vi.mocked(prisma.moodEntry.findMany).mockResolvedValue([]);
    vi.mocked(prisma.moodEntry.groupBy).mockResolvedValue([]);

    const res = await authed(request(app).get('/api/dashboard'));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ moods: [], genres: [] });
  });

});
