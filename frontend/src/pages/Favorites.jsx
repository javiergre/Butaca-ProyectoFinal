import './catalog.css';
import MovieCard from '../components/MovieCard';
import { useFavorites } from '../context/useFavorites';

export default function Favorites() {
  const { favorites, loading, error, isFavorite, toggle } = useFavorites();

  return (
    <section className="catalog-page">
      <div className="catalog-header">
        <div>
          <span className="catalog-eyebrow">TU LISTA</span>
          <h1>Tus favoritos</h1>
          <p>Las películas y series que guardaste para ver después.</p>
        </div>
      </div>

      {loading && <p className="catalog-message" role="status">Cargando…</p>}

      {!loading && error && (
        <p className="catalog-message catalog-error" role="alert">{error}</p>
      )}

      {!loading && !error && favorites.length === 0 && (
        <p className="catalog-message">
          Todavía no guardaste ninguno. Detectá tu ánimo y marcá los que te gusten.
        </p>
      )}

      {favorites.length > 0 && (
        <div className="catalog-grid">
          {favorites.map((f) => (
            <MovieCard
              key={`${f.mediaType}-${f.id}`}
              item={f}
              isFavorite={isFavorite(f)}
              onToggle={toggle}
            />
          ))}
        </div>
      )}
    </section>
  );
}