
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import './catalog-detail.css';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w500';

export default function CatalogDetail() {
  const { type, id } = useParams();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    setLoading(true);
    setItem(null);
    setError('');

    if (
      !['movie', 'tv'].includes(type) ||
      !/^[1-9]\d*$/.test(id)
    ) {
      setError('El contenido solicitado no es válido.');
      setLoading(false);
      return;
    }

    api.getCatalogDetails({
      mediaType: type,
      id
    })
      .then((data) => {
        if (active) setItem(data);
      })
      .catch(() => {
        if (active) {
          setError('No pudimos cargar los detalles.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [type, id]);

  const posterUrl = item?.posterPath
    ? `${POSTER_BASE}${item.posterPath}`
    : null;

  const year = item?.releaseDate
    ? String(item.releaseDate).slice(0, 4)
    : 'Sin fecha';

  return (
    <section className="detail-page">
      <Link to="/catalog" className="detail-back">
        ← Volver al catálogo
      </Link>

      {loading && (
        <p role="status">Cargando detalles...</p>
      )}

      {!loading && error && (
        <p role="alert" className="detail-error">
          {error}
        </p>
      )}

      {!loading && !error && item && (
        <div className="detail-content">
          <div className="detail-poster">
            {posterUrl ? (
              <img
                src={posterUrl}
                alt={`Póster de ${item.title}`}
              />
            ) : (
              <div className="detail-placeholder">
                Sin póster disponible
              </div>
            )}
          </div>

          <div className="detail-info">
            <span className="detail-type">
              {item.mediaType === 'tv'
                ? 'SERIE'
                : 'PELÍCULA'}
            </span>

            <h1>{item.title}</h1>

            <div className="detail-meta">
              <span>{year}</span>

              {item.rating != null && (
                <span>
                  ★ {Number(item.rating).toFixed(1)}
                </span>
              )}
            </div>

            <h2>Sinopsis</h2>

            <p>
              {item.overview ||
                'No hay sinopsis disponible.'}
            </p>

            {item.genres?.length > 0 && (
              <>
                <h2>Géneros</h2>

                <div className="detail-genres">
                  {item.genres.map((genre) => (
                    <span key={genre.id}>
                      {genre.name}
                    </span>
                  ))}
                </div>
              </>
            )}

            {item.mediaType === 'movie' &&
              item.runtime != null && (
                <p>
                  <strong>Duración:</strong>{' '}
                  {item.runtime} minutos
                </p>
              )}

            {item.mediaType === 'tv' && (
              <p>
                <strong>Temporadas:</strong>{' '}
                {item.numberOfSeasons ?? 0}
                {' · '}
                <strong>Episodios:</strong>{' '}
                {item.numberOfEpisodes ?? 0}
              </p>
            )}

            {item.status && (
              <p>
                <strong>Estado:</strong> {item.status}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
