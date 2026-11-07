
import { useEffect, useState } from 'react';
import MovieCard from '../components/MovieCard';
import { api } from '../lib/api';
import './catalog.css';

export default function Catalog() {
  const [type, setType] = useState('movie');
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadCatalog() {
      setLoading(true);
      setError('');
      setMovies([]);

      try {
        const data = type === 'movie'
          ? await api.getCatalogMovies(page)
          : await api.getCatalogTv(page);

        if (!active) return;

        setMovies(data.results ?? []);
        setTotalPages(
          Math.max(1, Math.min(500, Number(data.totalPages) || 1))
        );
      } catch {
        if (active) {
          setError(
            'No se pudo cargar el catálogo. Intenta nuevamente.'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCatalog();

    return () => {
      active = false;
    };
  }, [type, page]);

  function changeType(nextType) {
    if (nextType === type) return;
    setType(nextType);
    setPage(1);
  }

  return (
    <section className="catalog-page">
      <div className="catalog-header">
        <div>
          <span className="catalog-eyebrow">
            DESCUBRE QUÉ VER
          </span>

          <h1>Explora nuestro catálogo</h1>

          <p>
            Encuentra películas y series para disfrutar
            en tu próxima butaca.
          </p>
        </div>
      </div>

      <div
        className="catalog-filters"
        aria-label="Tipo de contenido"
      >
        <button
          type="button"
          className={type === 'movie' ? 'selected' : ''}
          aria-pressed={type === 'movie'}
          onClick={() => changeType('movie')}
        >
          Películas
        </button>

        <button
          type="button"
          className={type === 'tv' ? 'selected' : ''}
          aria-pressed={type === 'tv'}
          onClick={() => changeType('tv')}
        >
          Series
        </button>
      </div>

      {loading && (
        <p className="catalog-message" role="status">
          Cargando catálogo...
        </p>
      )}

      {!loading && error && (
        <p className="catalog-message catalog-error" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && movies.length === 0 && (
        <p className="catalog-message">
          No encontramos contenido disponible.
        </p>
      )}

      {!loading && !error && movies.length > 0 && (
        <>
          <div className="catalog-grid">
            {movies.map((movie) => (
              <MovieCard
                key={`${movie.mediaType}-${movie.id}`}
                item={movie}
              />
            ))}
          </div>

          <div className="catalog-pagination">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </button>

            <span>
              Página {page} de {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </section>
  );
}
