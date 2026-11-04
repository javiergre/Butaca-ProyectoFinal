// TODO: hook que carga favoritas y expone { favorites, loading, error, isFavorite, toggle }
export function useFavorites() {
  return { favorites: [], loading: false, error: '', isFavorite: () => false, toggle() {} };
}
