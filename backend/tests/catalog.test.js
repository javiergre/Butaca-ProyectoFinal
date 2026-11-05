
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

let app;

const TEST_TOKEN = 'token-ficticio-para-pruebas';

beforeAll(async () => {
  process.env.PORT = '3000';
  process.env.FRONTEND_URL = 'http://localhost:5173';

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

// Simular una respuesta de TMDB
function mockTmdb(data, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data
  });

  vi.stubGlobal('fetch', fetchMock);

  return fetchMock;
}

describe('Catálogo TMDB - Butaca', () => {

  it('GET /api/catalog/movies devuelve películas', async () => {
    const fetchMock = mockTmdb({
      page: 1,
      total_pages: 10,
      results: [
        {
          id: 155,
          title: 'Película de prueba',
          overview: 'Sinopsis de prueba',
          poster_path: '/poster.jpg',
          genre_ids: [28, 80],
          vote_average: 8.5,
          popularity: 100,
          release_date: '2008-07-16'
        }
      ]
    });

    const res = await request(app)
      .get('/api/catalog/movies');

    expect(res.status).toBe(200);
    expect(res.body.page).toBe(1);
    expect(res.body.results[0].id).toBe(155);
    expect(res.body.results[0].mediaType).toBe('movie');
    expect(res.body.results[0].title).toBe('Película de prueba');

    expect(fetchMock).toHaveBeenCalledOnce();

    const [url, options] = fetchMock.mock.calls[0];

    expect(url.pathname).toBe('/3/discover/movie');
    expect(options.headers.Authorization)
      .toBe(`Bearer ${TEST_TOKEN}`);
  });

  it('GET /api/catalog/tv devuelve series', async () => {
    mockTmdb({
      page: 1,
      total_pages: 5,
      results: [
        {
          id: 1399,
          name: 'Serie de prueba',
          overview: 'Descripción',
          poster_path: '/serie.jpg',
          genre_ids: [18],
          vote_average: 8.2,
          popularity: 90,
          first_air_date: '2011-04-17'
        }
      ]
    });

    const res = await request(app)
      .get('/api/catalog/tv');

    expect(res.status).toBe(200);
    expect(res.body.results[0].id).toBe(1399);
    expect(res.body.results[0].mediaType).toBe('tv');
    expect(res.body.results[0].title).toBe('Serie de prueba');
  });

  it('GET /api/catalog/movie/155 devuelve detalle', async () => {
    mockTmdb({
      id: 155,
      title: 'Película de prueba',
      overview: 'Descripción',
      genres: [
        { id: 28, name: 'Acción' }
      ],
      runtime: 152,
      vote_average: 8.5
    });

    const res = await request(app)
      .get('/api/catalog/movie/155');

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(155);
    expect(res.body.runtime).toBe(152);
    expect(res.body.genreIds).toEqual([28]);
  });

  it('GET /api/catalog/tv/1399 devuelve detalle', async () => {
    mockTmdb({
      id: 1399,
      name: 'Serie de prueba',
      genres: [
        { id: 18, name: 'Drama' }
      ],
      number_of_seasons: 8,
      number_of_episodes: 73
    });

    const res = await request(app)
      .get('/api/catalog/tv/1399');

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1399);
    expect(res.body.numberOfSeasons).toBe(8);
    expect(res.body.numberOfEpisodes).toBe(73);
  });

  it('Rechaza una página negativa con HTTP 400', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const res = await request(app)
      .get('/api/catalog/movies?page=-1');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(
      'Parámetros de búsqueda inválidos'
    );

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('Sin token devuelve HTTP 503', async () => {
    delete process.env.TMDB_READ_ACCESS_TOKEN;

    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const res = await request(app)
      .get('/api/catalog/movies');

    expect(res.status).toBe(503);
    expect(res.body.error).toBe(
      'TMDB no está configurado'
    );

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('Si TMDB falla devuelve HTTP 502', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(
        new Error('Servicio no disponible')
      )
    );

    const res = await request(app)
      .get('/api/catalog/movies');

    expect(res.status).toBe(502);
    expect(res.body.error).toBe(
      'No fue posible conectar con TMDB'
    );
  });

  it('Contenido inexistente devuelve HTTP 404', async () => {
  mockTmdb({}, 404);

  const res = await request(app)
    .get('/api/catalog/movie/999999999');

  expect(res.status).toBe(404);
  expect(res.body.error).toBe(
    'El contenido solicitado no existe'
  );
});

it('Credenciales rechazadas por TMDB devuelven HTTP 502', async () => {
  mockTmdb({}, 401);

  const res = await request(app)
    .get('/api/catalog/movies');

  expect(res.status).toBe(502);
  expect(res.body.error).toBe(
    'No fue posible autenticar con TMDB'
  );
});

it('Límite de solicitudes de TMDB devuelve HTTP 503', async () => {
  mockTmdb({}, 429);

  const res = await request(app)
    .get('/api/catalog/movies');

  expect(res.status).toBe(503);
  expect(res.body.error).toBe(
    'TMDB está temporalmente ocupado'
  );
});

});
