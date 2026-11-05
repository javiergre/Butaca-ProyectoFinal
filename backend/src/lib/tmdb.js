
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export class TmdbError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.name = 'TmdbError';
    this.status = status;
  }
}

export async function tmdbRequest(path, params = {}) {
  const token = process.env.TMDB_READ_ACCESS_TOKEN;

  if (!token) {
    throw new TmdbError('TMDB no está configurado', 503);
  }

  const url = new URL(`${TMDB_BASE_URL}${path}`);

  url.searchParams.set('language', 'es-MX');

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }

  let response;

  try {
    response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      },
      signal: AbortSignal.timeout(10000)
    });
  } catch {
    throw new TmdbError(
      'No fue posible conectar con TMDB',
      502
    );
  }

  if (!response.ok) {

  // Película o serie inexistente
  if (response.status === 404) {
    throw new TmdbError(
      'El contenido solicitado no existe',
      404
    );
  }

  // Credenciales rechazadas por TMDB
  if (response.status === 401 || response.status === 403) {
    throw new TmdbError(
      'No fue posible autenticar con TMDB',
      502
    );
  }

  // TMDB limitó las solicitudes
  if (response.status === 429) {
    throw new TmdbError(
      'TMDB está temporalmente ocupado',
      503
    );
  }

  // Otros errores del servicio externo
  throw new TmdbError(
    'TMDB no pudo procesar la solicitud',
    502
  );
}

  try {
    return await response.json();
  } catch {
    throw new TmdbError(
      'TMDB devolvió una respuesta inválida',
      502
    );
  }
}

export function normalizeMovie(movie) {
  return {
    id: movie.id,
    mediaType: 'movie',
    title: movie.title,
    overview: movie.overview ?? '',
    posterPath: movie.poster_path ?? null,
    genreIds: movie.genre_ids ?? [],
    rating: movie.vote_average ?? 0,
    popularity: movie.popularity ?? 0,
    releaseDate: movie.release_date ?? null
  };
}

export async function discoverMovies(page = 1) {
  const data = await tmdbRequest('/discover/movie', {
    page,
    sort_by: 'popularity.desc',
    include_adult: false
  });

  return {
    page: data.page,
    totalPages: data.total_pages,
    results: data.results.map(normalizeMovie)
  };
}


export function normalizeTv(series) {
  return {
    id: series.id,
    mediaType: 'tv',
    title: series.name,
    overview: series.overview ?? '',
    posterPath: series.poster_path ?? null,
    genreIds: series.genre_ids ?? [],
    rating: series.vote_average ?? 0,
    popularity: series.popularity ?? 0,
    releaseDate: series.first_air_date ?? null
  };
}

export async function discoverTv(page = 1) {
  const data = await tmdbRequest('/discover/tv', {
    page,
    sort_by: 'popularity.desc',
    include_adult: false
  });

  return {
    page: data.page,
    totalPages: data.total_pages,
    results: data.results.map(normalizeTv)
  };
}

export async function getMovieDetails(id) {
  const movie = await tmdbRequest(`/movie/${id}`);

  return {
    ...normalizeMovie(movie),
    genreIds: (movie.genres ?? []).map(genre => genre.id),
    genres: movie.genres ?? [],
    runtime: movie.runtime ?? null,
    status: movie.status ?? null,
    backdropPath: movie.backdrop_path ?? null
  };
}

export async function getTvDetails(id) {
  const series = await tmdbRequest(`/tv/${id}`);

  return {
    ...normalizeTv(series),
    genreIds: (series.genres ?? []).map(genre => genre.id),
    genres: series.genres ?? [],
    numberOfSeasons: series.number_of_seasons ?? 0,
    numberOfEpisodes: series.number_of_episodes ?? 0,
    status: series.status ?? null,
    backdropPath: series.backdrop_path ?? null
  };
}



export async function discoverRecommendations(
  type,
  genres,
  page = 1
) {
  const path = type === 'movie'
    ? '/discover/movie'
    : '/discover/tv';

  const data = await tmdbRequest(path, {
    page,
    with_genres: genres.join('|'),
    sort_by: 'popularity.desc',
    'vote_count.gte': 50,
    include_adult: false
  });

  const normalize = type === 'movie'
    ? normalizeMovie
    : normalizeTv;

  return {
    page: data.page,
    totalPages: data.total_pages,
    results: data.results.map(normalize)
  };
}
