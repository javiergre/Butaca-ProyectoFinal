import './catalog.css';
import { useEffect, useRef, useState } from 'react';
import CameraCapture from '../components/CameraCapture';
import MoodFace from '../components/MoodFace';
import MoodPicker from '../components/MoodPicker';
import MovieCard from '../components/MovieCard';
import { useFavorites } from '../context/useFavorites';
import { api } from '../lib/api';
import { MOODS } from '../lib/emotion';

const normalize = (x) => ({
  ...x,
  id: x.id ?? x.tmdbId,
  mediaType: x.mediaType ?? x.media_type ?? (x.title ? 'movie' : 'tv'),
  title: x.title ?? x.name,
  posterPath: x.posterPath ?? x.poster_path ?? null,
  releaseDate: x.releaseDate ?? x.release_date ?? x.first_air_date,
  rating: x.rating ?? x.vote_average,
});

export default function Mood() {
  const [mood, setMood] = useState(null);
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('idle'); 
  const [saveError, setSaveError] = useState(false);
  const { isFavorite, toggle, error: favError } = useFavorites();

  const lastRequest = useRef(0);
  const resultsRef = useRef(null);

  async function handleMood(detected) {
    const id = ++lastRequest.current;
    setMood(detected);
    setSaveError(false);
    setStatus('loading');

    const [saved, recs] = await Promise.allSettled([
      api.saveMood(detected),
      api.getRecommendations(detected.emotion),
    ]);
    if (id !== lastRequest.current) return; 

    if (saved.status === 'rejected') setSaveError(true);
    if (recs.status === 'fulfilled') {
      setItems(recs.value.map(normalize));
      setStatus('done');
    } else {
      setStatus('error');
    }
  }

  useEffect(() => {
    if (status !== 'idle') {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [status]);

  return (
    <section className="mood-page">
      <h1 className="mood-title">¿Cómo te sentís hoy?</h1>
      <CameraCapture onDetected={handleMood} />

      <h2 className="mood-or">O elegí tu butaca</h2>
      <MoodPicker onPick={handleMood} selected={mood?.emotion} />

      {mood && (
        <p className="mood-detected" role="status">
          <MoodFace
            emotion={mood.emotion}
            className="face face-inline"
            style={{ color: MOODS[mood.emotion].color }}
          />
          Ánimo detectado:{' '}
          <strong style={{ color: MOODS[mood.emotion].color }}>{MOODS[mood.emotion].label}</strong>
        </p>
      )}

      <div className="recs" ref={resultsRef} aria-live="polite">
        {status === 'loading' && <p className="status" role="status">Buscando qué ver…</p>}

        {status === 'error' && (
          <p className="error" role="alert">
            No pudimos traer recomendaciones. Revisá tu conexión e intentá de nuevo.
          </p>
        )}

        {status === 'done' && (
          <>
            <h2 className="recs-title">Para tu ánimo {MOODS[mood.emotion].label.toLowerCase()}</h2>
            {items.length === 0 ? (
              <p className="status">No encontramos títulos para este ánimo. Probá con otro.</p>
            ) : (
              <div className="catalog-grid">
                {items.map((it) => (
                  <MovieCard
                    key={`${it.mediaType}-${it.id}`}
                    item={it}
                    isFavorite={isFavorite(it)}
                    onToggle={toggle}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {saveError && status !== 'loading' && (
          <p className="error" role="alert">Detectamos tu ánimo, pero no pudimos guardarlo en tu historial.</p>
        )}
        {favError && <p className="error" role="alert">{favError}</p>}
      </div>
    </section>
  );
}