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

vi.mock('../src/lib/prisma.js', () => ({
  prisma: {
    favorite: {
      findMany: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn()
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

const favoriteItem = {
  tmdbId: 155,
  mediaType: 'movie',
  title: 'Película de prueba',
  posterPath: '/poster.jpg'
};

describe('CRUD de favoritas - Butaca', () => {

  it('Sin token ninguna ruta de favoritas es accesible', async () => {
    const get = await request(app).get('/api/favorites');
    const post = await request(app).post('/api/favorites').send(favoriteItem);
    const del = await request(app).delete('/api/favorites/movie/155');

    expect(get.status).toBe(401);
    expect(post.status).toBe(401);
    expect(del.status).toBe(401);

    expect(prisma.favorite.findMany).not.toHaveBeenCalled();
    expect(prisma.favorite.create).not.toHaveBeenCalled();
    expect(prisma.favorite.deleteMany).not.toHaveBeenCalled();
  });

  it('GET /api/favorites devuelve solo las favoritas del usuario', async () => {
    vi.mocked(prisma.favorite.findMany).mockResolvedValue([favoriteItem]);

    const res = await authed(request(app).get('/api/favorites'));

    expect(res.status).toBe(200);
    expect(res.body.favorites).toEqual([favoriteItem]);

    expect(prisma.favorite.findMany).toHaveBeenCalledWith({
      where: { userId: USER_ID },
      orderBy: { createdAt: 'desc' },
      select: { tmdbId: true, mediaType: true, title: true, posterPath: true }
    });
  });

  it('POST /api/favorites crea una favorita y responde HTTP 201', async () => {
    vi.mocked(prisma.favorite.create).mockResolvedValue(favoriteItem);

    const res = await authed(request(app).post('/api/favorites'))
      .send(favoriteItem);

    expect(res.status).toBe(201);
    expect(res.body.tmdbId).toBe(155);

    expect(prisma.favorite.create).toHaveBeenCalledWith({
      data: { ...favoriteItem, userId: USER_ID },
      select: { tmdbId: true, mediaType: true, title: true, posterPath: true }
    });
  });

  it('POST /api/favorites acepta un póster inexistente', async () => {
    vi.mocked(prisma.favorite.create).mockResolvedValue({
      ...favoriteItem,
      posterPath: null
    });

    const res = await authed(request(app).post('/api/favorites'))
      .send({ ...favoriteItem, posterPath: null });

    expect(res.status).toBe(201);
    expect(vi.mocked(prisma.favorite.create).mock.calls[0][0].data.posterPath)
      .toBeNull();
  });

  it('POST rechaza un tipo de contenido inválido con HTTP 400', async () => {
    const res = await authed(request(app).post('/api/favorites'))
      .send({ ...favoriteItem, mediaType: 'documental' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Datos inválidos');
    expect(prisma.favorite.create).not.toHaveBeenCalled();
  });

  it('POST rechaza un tmdbId no numérico con HTTP 400', async () => {
    const res = await authed(request(app).post('/api/favorites'))
      .send({ ...favoriteItem, tmdbId: 'abc' });

    expect(res.status).toBe(400);
    expect(prisma.favorite.create).not.toHaveBeenCalled();
  });

  it('Una favorita repetida devuelve HTTP 409', async () => {
    vi.mocked(prisma.favorite.create).mockRejectedValue({ code: 'P2002' });

    const res = await authed(request(app).post('/api/favorites'))
      .send(favoriteItem);

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Ese contenido ya está en tus favoritas');
  });

  it('DELETE /api/favorites/:mediaType/:tmdbId responde HTTP 204', async () => {
    vi.mocked(prisma.favorite.deleteMany).mockResolvedValue({ count: 1 });

    const res = await authed(request(app).delete('/api/favorites/movie/155'));

    expect(res.status).toBe(204);
    expect(res.body).toEqual({});

    expect(prisma.favorite.deleteMany).toHaveBeenCalledWith({
      where: { userId: USER_ID, mediaType: 'movie', tmdbId: 155 }
    });
  });

  it('Eliminar una favorita que no existe devuelve HTTP 404', async () => {
    vi.mocked(prisma.favorite.deleteMany).mockResolvedValue({ count: 0 });

    const res = await authed(request(app).delete('/api/favorites/tv/1399'));

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Ese contenido no está en tus favoritas');
  });

  it('Un parámetro inválido en la ruta devuelve HTTP 400', async () => {
    const res = await authed(request(app).delete('/api/favorites/pelicula/155'));

    expect(res.status).toBe(400);
    expect(prisma.favorite.deleteMany).not.toHaveBeenCalled();
  });

});
