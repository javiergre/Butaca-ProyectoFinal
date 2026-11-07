import { supabase } from './supabase';

const BASE = import.meta.env.VITE_API_URL ?? '';

async function request(path, { method = 'GET', body } = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;

  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = new Error(`La API respondió ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
    getCatalogMovies: (page = 1) =>
    request(`/catalog/movies?page=${page}`),

  getCatalogTv: (page = 1) =>
    request(`/catalog/tv?page=${page}`),


  getCatalogDetails: (item) =>
    request(
      `/catalog/${item.mediaType === 'tv' ? 'tv' : 'movie'}/${encodeURIComponent(item.id)}`
    ),

  getRecommendations: (emotion) =>
    request(`/recommendations?emotion=${encodeURIComponent(emotion)}`).then((r) => r.results ?? []),

  saveMood: ({ emotion, confidence }) => request('/moods', { method: 'POST', body: { emotion, confidence } }),

  getFavorites: () =>
    request('/favorites').then((r) => (r.favorites ?? []).map((f) => ({ ...f, id: f.tmdbId }))),

  addFavorite: (item) =>
    request('/favorites', {
      method: 'POST',
      body: { tmdbId: item.id, mediaType: item.mediaType, title: item.title, posterPath: item.posterPath },
    }),

  removeFavorite: (item) => request(`/favorites/${item.mediaType}/${item.id}`, { method: 'DELETE' }),

  getDashboard: () => request('/dashboard'),
};