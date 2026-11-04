// TODO: request() base: fetch a `${VITE_API_URL}/api${path}` con Authorization: Bearer <token de Supabase>
export const api = {
  getRecommendations: async (emotion) => { /* TODO: GET /recommendations?emotion= */ },
  saveMood: async ({ emotion, confidence }) => { /* TODO: POST /moods */ },
  getFavorites: async () => { /* TODO: GET /favorites */ },
  addFavorite: async (item) => { /* TODO: POST /favorites */ },
  removeFavorite: async (item) => { /* TODO: DELETE /favorites/:mediaType/:id */ },
  getDashboard: async () => { /* TODO: GET /dashboard */ },
};
