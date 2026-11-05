
import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi
} from 'vitest';

import request from 'supertest';

import { EMOTION_GENRES } from '../src/lib/emotionGenres.js';

let app;

const TEST_TOKEN = 'token-ficticio-para-pruebas';

beforeAll(async () => {
  const module = await import('../src/app.js');
  app = module.default;
});

beforeEach(() => {
  process.env.TMDB_READ_ACCESS_TOKEN = TEST_TOKEN;
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.TMDB_READ_ACCESS_TOKEN;
});

// Simular respuesta de TMDB sin usar internet
function mockTmdb(type = 'movie', status = 200) {
  const item = type === 'movie'
    ? {
        id: 155,
        title: 'Película de prueba',
        overview: 'Sinopsis de prueba',
        poster_path: '/poster.jpg',
        genre_ids: [35],
        vote_average: 8.5,
        popularity: 100,
        release_date: '2008-07-16'
      }
    : {
        id: 1399,
        name: 'Serie de prueba',
        overview: 'Sinopsis de serie',
        poster_path: '/serie.jpg',
        genre_ids: [35],
        vote_average: 8.2,
        popularity: 95,
        first_air_date: '2011-04-17'
      };

  const fetchMock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => ({
      page: 1,
      total_pages: 10,
      results: [item]
    })
  });

  vi.stubGlobal('fetch', fetchMock);

  return fetchMock;
}

describe('Motor de recomendaciones - Butaca', () => {

  it('Recomienda películas para la emoción happy', async () => {
    const fetchMock = mockTmdb('movie');

    const res = await request(app)
      .get('/api/recommendations?emotion=happy&type=movie');

    expect(res.status).toBe(200);
    expect(res.body.emotion).toBe('happy');
    expect(res.body.type).toBe('movie');
    expect(res.body.results[0].mediaType).toBe('movie');
    expect(res.body.results[0].title).toBe('Película de prueba');

    const [url] = fetchMock.mock.calls[0];

    expect(url.pathname).toBe('/3/discover/movie');
  });

  it('Utiliza los géneros correctos para sad', async () => {
    const fetchMock = mockTmdb('movie');

    const res = await request(app)
      .get('/api/recommendations?emotion=sad&type=movie');

    expect(res.status).toBe(200);

    expect(res.body.genres).toEqual(
      EMOTION_GENRES.sad.movie
    );

    const [url] = fetchMock.mock.calls[0];

    expect(url.searchParams.get('with_genres'))
      .toBe(EMOTION_GENRES.sad.movie.join('|'));
  });

  it('Recomienda series para surprised', async () => {
    const fetchMock = mockTmdb('tv');

    const res = await request(app)
      .get('/api/recommendations?emotion=surprised&type=tv');

    expect(res.status).toBe(200);
    expect(res.body.type).toBe('tv');
    expect(res.body.results[0].mediaType).toBe('tv');
    expect(res.body.results[0].title).toBe('Serie de prueba');

    const [url] = fetchMock.mock.calls[0];

    expect(url.pathname).toBe('/3/discover/tv');
  });

  it('Permite solicitar la segunda página', async () => {
    const fetchMock = mockTmdb('movie');

    const res = await request(app)
      .get('/api/recommendations?emotion=neutral&page=2');

    expect(res.status).toBe(200);

    const [url] = fetchMock.mock.calls[0];

    expect(url.searchParams.get('page')).toBe('2');
  });

  it('Utiliza movie por defecto', async () => {
    const fetchMock = mockTmdb('movie');

    const res = await request(app)
      .get('/api/recommendations?emotion=happy');

    expect(res.status).toBe(200);
    expect(res.body.type).toBe('movie');

    const [url] = fetchMock.mock.calls[0];

    expect(url.pathname).toBe('/3/discover/movie');
  });

  it('Rechaza una emoción inválida con HTTP 400', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const res = await request(app)
      .get('/api/recommendations?emotion=confused');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(
      'Parámetros de recomendación inválidos'
    );

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('Rechaza un tipo de contenido inválido', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const res = await request(app)
      .get('/api/recommendations?emotion=happy&type=music');

    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('Rechaza una página negativa', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const res = await request(app)
      .get('/api/recommendations?emotion=happy&page=-1');

    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('Maneja el límite de solicitudes de TMDB', async () => {
    mockTmdb('movie', 429);

    const res = await request(app)
      .get('/api/recommendations?emotion=happy');

    expect(res.status).toBe(503);
    expect(res.body.error).toBe(
      'TMDB está temporalmente ocupado'
    );
  });

  it('Rechaza solicitudes a TMDB si falta el token', async () => {
    delete process.env.TMDB_READ_ACCESS_TOKEN;

    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const res = await request(app)
      .get('/api/recommendations?emotion=happy');

    expect(res.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('Aplica los filtros de calidad y contenido a TMDB', async () => {
  const fetchMock = mockTmdb('movie');

  const res = await request(app)
    .get('/api/recommendations?emotion=happy&type=movie');

  expect(res.status).toBe(200);

  const [url] = fetchMock.mock.calls[0];

  expect(url.searchParams.get('sort_by'))
    .toBe('popularity.desc');

  expect(url.searchParams.get('vote_count.gte'))
    .toBe('50');

  expect(url.searchParams.get('include_adult'))
    .toBe('false');

  expect(url.searchParams.get('with_genres'))
    .toBe(EMOTION_GENRES.happy.movie.join('|'));
});

});
