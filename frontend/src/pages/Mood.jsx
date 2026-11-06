import { useState } from 'react';
import CameraCapture from '../components/CameraCapture';
import MoodFace from '../components/MoodFace';
import MoodPicker from '../components/MoodPicker';
import { api } from '../lib/api';
import { MOODS } from '../lib/emotion';

export default function Mood() {
  const [mood, setMood] = useState(null);
  const [error, setError] = useState('');

  async function handleMood(detected) {
    setMood(detected);
    setError('');
    try {
      await api.saveMood(detected); // alimenta el historial del tablero
    } catch {
      setError('Detectamos tu ánimo, pero no pudimos guardarlo en tu historial.');
    }
  }

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
      {error && <p className="error" role="alert">{error}</p>}
    </section>
  );
}