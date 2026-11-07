import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';

export const favKey = (item) => `${item.mediaType}-${item.id}`;

export function useFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getFavorites()
      .then(setFavorites)
      .catch(() => setError('No pudimos cargar tus favoritos.'))
      .finally(() => setLoading(false));
  }, []);

  const isFavorite = useCallback((item) => favorites.some((f) => favKey(f) === favKey(item)), [favorites]);

  const toggle = useCallback(
    async (item) => {
      setError('');
      const already = favorites.some((f) => favKey(f) === favKey(item));
      try {
        if (already) {
          await api.removeFavorite(item);
          setFavorites((prev) => prev.filter((f) => favKey(f) !== favKey(item)));
        } else {
          await api.addFavorite(item);
          setFavorites((prev) => [...prev, item]);
        }
      } catch {
        setError('No se pudo actualizar tu favorito. Intentá de nuevo.');
      }
    },
    [favorites],
  );

  return { favorites, loading, error, isFavorite, toggle };
}