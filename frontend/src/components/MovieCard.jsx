import { Link } from 'react-router-dom';
import './MovieCard.css';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w500';

export default function MovieCard({
  item,
  isFavorite = false,
  onToggle
}) {
  if (!item) return null;

  const {
    title,
    overview,
    posterPath,
    mediaType,
    rating,
    releaseDate
  } = item;

  const posterUrl = posterPath
    ? `${POSTER_BASE}${posterPath.startsWith('/') ? '' : '/'}${posterPath}`
    : null;

  const year = releaseDate
    ? releaseDate.substring(0, 4)
    : 'Sin fecha';

  const typeLabel = mediaType === 'tv'
    ? 'Serie'
    : 'Película';

  const hasRating =
    rating !== null &&
    rating !== undefined &&
    Number.isFinite(Number(rating));

  return (
    <article className="catalog-card">

      <div className="catalog-card-poster">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={`Póster de ${title}`}
            loading="lazy"
          />
        ) : (
          <div className="catalog-card-no-image">
            Sin póster disponible
          </div>
        )}

        <span className="catalog-card-type">
          {typeLabel}
        </span>
      </div>

      <div className="catalog-card-info">

        <h3>{title || 'Sin título'}</h3>

        <div className="catalog-card-meta">
          <span>{year}</span>

          {hasRating && (
            <span className="catalog-card-rating">
              ★ {Number(rating).toFixed(1)}
            </span>
          )}
        </div>

        <details className="catalog-card-description">
          <summary>Ver descripción</summary>
          <p>
            {overview || 'No hay descripción disponible.'}
          </p>
        </details>

<Link
  to={`/catalog/${mediaType}/${item.id}`}
  className="catalog-card-details-link"
>
  Ver detalles completos
</Link>


        {typeof onToggle === 'function' && (
          <button
            type="button"
            className={`catalog-card-favorite ${
              isFavorite ? 'active' : ''
            }`}
            aria-pressed={isFavorite}
            onClick={() => onToggle(item)}
          >
            {isFavorite
              ? '♥ En favoritos'
              : '♡ Agregar a favoritos'}
          </button>
        )}

      </div>
    </article>
  );
}
