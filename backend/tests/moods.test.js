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

// Autenticación de Supabase simulada, sin salida a red
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

vi.mock('../src/lib/prisma.js', () => ({
  prisma: {
    moodEntry: {
      create: vi.fn()
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

describe('Historial de emociones - Butaca', () => {

  it('Sin token devuelve HTTP 401 y no escribe en la base de datos', async () => {
    const res = await request(app)
      .post('/api/moods')
      .send({ emotion: 'happy', confidence: 0.9 });

    expect(res.status).toBe(401);
    expect(prisma.moodEntry.create).not.toHaveBeenCalled();
  });

  it('Con token inválido devuelve HTTP 401', async () => {
    const res = await request(app)
      .post('/api/moods')
      .set('Authorization', 'Bearer otro-token')
      .send({ emotion: 'happy', confidence: 0.9 });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Token inválido o expirado');
  });

  it('POST /api/moods guarda la emoción y responde HTTP 201', async () => {
    vi.mocked(prisma.moodEntry.create).mockResolvedValue({
      emotion: 'happy',
      createdAt: new Date('2026-11-05T10:00:00.000Z')
    });

    const res = await authed(request(app).post('/api/moods'))
      .send({ emotion: 'happy', confidence: 0.82 });

    expect(res.status).toBe(201);
    expect(res.body.emotion).toBe('happy');
    expect(res.body.createdAt).toBe('2026-11-05T10:00:00.000Z');

    expect(prisma.moodEntry.create).toHaveBeenCalledWith({
      data: { userId: USER_ID, emotion: 'happy', confidence: 0.82 },
      select: { emotion: true, createdAt: true }
    });
  });

  it('Acepta una emoción sin nivel de confianza', async () => {
    vi.mocked(prisma.moodEntry.create).mockResolvedValue({
      emotion: 'neutral',
      createdAt: new Date('2026-11-05T10:00:00.000Z')
    });

    const res = await authed(request(app).post('/api/moods'))
      .send({ emotion: 'neutral' });

    expect(res.status).toBe(201);
    expect(vi.mocked(prisma.moodEntry.create).mock.calls[0][0].data.confidence)
      .toBeNull();
  });

  it('Rechaza una emoción desconocida con HTTP 400', async () => {
    const res = await authed(request(app).post('/api/moods'))
      .send({ emotion: 'enamorada', confidence: 0.5 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Datos inválidos');
    expect(prisma.moodEntry.create).not.toHaveBeenCalled();
  });

  it('Rechaza una confianza fuera de rango con HTTP 400', async () => {
    const res = await authed(request(app).post('/api/moods'))
      .send({ emotion: 'happy', confidence: 1.5 });

    expect(res.status).toBe(400);
    expect(prisma.moodEntry.create).not.toHaveBeenCalled();
  });

});
