
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

// Simular autenticación de Supabase
vi.mock('../src/lib/supabase.js', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(async (token) =>
        token === 'token-valido-para-pruebas'
          ? {
              data: { user: { id: 'usuario-de-prueba' } },
              error: null
            }
          : {
              data: { user: null },
              error: new Error('Token inválido')
            }
      )
    }
  }
}));

// NO simulamos emotionGenres.js.
// Utilizamos el mapa real del motor de recomendaciones.

// Simular la base de datos
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
  return requestBuilder.set(
    'Authorization',
    `Bearer ${VALID_TOKEN}`
  );
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
      {
        emotion: 'angry',
        createdAt: new Date('2026-11-05T10:00:00.000Z')
      },
      {
        emotion: 'disgusted',
        createdAt: new Date('2026-11-04T10:00:00.000Z')
      }
    ]);

    vi.mocked(prisma.moodEntry.groupBy).mockResolvedValue([
      {
        emotion: 'angry',
        _count: { _all: 3 }
      },
      {
        emotion: 'disgusted',
        _count: { _all: 2 }
      }
    ]);

    const res = await authed(
      request(app).get('/api/dashboard')
    );

    expect(res.status).toBe(200);

    expect(res.body.moods).toEqual([
      {
        emotion: 'angry',
        createdAt: '2026-11-05T10:00:00.000Z'
      },
      {
        emotion: 'disgusted',
        createdAt: '2026-11-04T10:00:00.000Z'
      }
    ]);

    // Los géneros compartidos suman ambas emociones.
    // Cada género se cuenta una sola vez por emoción.
    expect(res.body.genres).toEqual([
      { name: 'Animación', count: 5 },
      { name: 'Comedia', count: 5 },
      { name: 'Familia', count: 5 },
      { name: 'Aventura', count: 3 }
    ]);
  });

  it('Limita la línea de tiempo y el ranking de géneros', async () => {
    vi.mocked(prisma.moodEntry.findMany).mockResolvedValue([]);

    vi.mocked(prisma.moodEntry.groupBy).mockResolvedValue(
      [
        'happy',
        'sad',
        'angry',
        'fearful',
        'surprised',
        'neutral'
      ].map((emotion) => ({
        emotion,
        _count: { _all: 1 }
      }))
    );

    const res = await authed(
      request(app).get('/api/dashboard')
    );

    expect(res.status).toBe(200);

    expect(prisma.moodEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 50 })
    );

    expect(res.body.genres).toHaveLength(6);

    const counts = res.body.genres.map(
      (genre) => genre.count
    );

    expect(counts).toEqual(
      [...counts].sort((a, b) => b - a)
    );

    expect(res.body.genres[0]).toEqual({
      name: 'Comedia',
      count: 5
    });
  });

  it('Consulta únicamente los registros del usuario autenticado', async () => {
    vi.mocked(prisma.moodEntry.findMany).mockResolvedValue([]);
    vi.mocked(prisma.moodEntry.groupBy).mockResolvedValue([]);

    await authed(request(app).get('/api/dashboard'));

    expect(prisma.moodEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: USER_ID }
      })
    );

    expect(prisma.moodEntry.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        by: ['emotion'],
        where: { userId: USER_ID }
      })
    );
  });

  it('Un usuario nuevo responde con el tablero vacío', async () => {
    vi.mocked(prisma.moodEntry.findMany).mockResolvedValue([]);
    vi.mocked(prisma.moodEntry.groupBy).mockResolvedValue([]);

    const res = await authed(
      request(app).get('/api/dashboard')
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      moods: [],
      genres: []
    });
  });

  it('Combina géneros de películas y series sin duplicarlos', async () => {
    vi.mocked(prisma.moodEntry.findMany).mockResolvedValue([]);

    vi.mocked(prisma.moodEntry.groupBy).mockResolvedValue([
      {
        emotion: 'surprised',
        _count: { _all: 2 }
      }
    ]);

    const res = await authed(
      request(app).get('/api/dashboard')
    );

    expect(res.status).toBe(200);

    // Surprised tiene géneros de películas y de series.
    // Misterio aparece en ambos, pero no se duplica.
    expect(res.body.genres).toHaveLength(5);

    expect(res.body.genres).toEqual(
      expect.arrayContaining([
        { name: 'Aventura', count: 2 },
        { name: 'Ciencia ficción', count: 2 },
        { name: 'Misterio', count: 2 },
        { name: 'Acción y aventura', count: 2 },
        { name: 'Ciencia ficción y fantasía', count: 2 }
      ])
    );
  });

});
