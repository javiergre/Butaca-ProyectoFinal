import './dashboard.css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DonutChart from '../components/DonutChart';
import MoodFace from '../components/MoodFace';
import { api } from '../lib/api';
import { MOODS } from '../lib/emotion';

const FALLBACK = '#A3A3B5';
const dayKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const fmtDate = (d) => d.toLocaleDateString('es-GT', { day: 'numeric', month: 'short' });
const fmtTime = (d) => d.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });
const plural = (w) => (w.endsWith('o') ? `${w}s` : w); // sábado -> sábados, lunes -> lunes
const colorOf = (e) => MOODS[e]?.color ?? FALLBACK;
const labelOf = (e) => MOODS[e]?.label ?? e;

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAll, setShowAll] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    api
      .getDashboard()
      .then(setData)
      .catch(() => setError('No pudimos cargar tu tablero. Intentá de nuevo.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const stats = useMemo(() => {
    const moods = (data?.moods ?? [])
      .filter((m) => m.createdAt)
      .map((m) => ({ ...m, date: new Date(m.createdAt) }))
      .filter((m) => !Number.isNaN(m.date.getTime()))
      .sort((a, b) => b.date - a.date);

    const total = moods.length;

    const counts = {};
    for (const m of moods) counts[m.emotion] = (counts[m.emotion] ?? 0) + 1;
    const slices = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([emotion, count]) => ({
        emotion,
        count,
        pct: Math.round((count / total) * 100),
        color: colorOf(emotion),
        label: labelOf(emotion),
      }));

    // Últimos 7 días 
    const week = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (6 - i));
      return { date: d, key: dayKey(d), items: [] };
    });
    for (const m of moods) {
      const slot = week.find((w) => w.key === dayKey(m.date));
      if (slot) slot.items.push(m);
    }

    // Día de la semana con más lecturas
    const weekdays = {};
    for (const m of moods) {
      const wd = m.date.toLocaleDateString('es-GT', { weekday: 'long' });
      weekdays[wd] = (weekdays[wd] ?? 0) + 1;
    }
    const topDay = Object.entries(weekdays).sort((a, b) => b[1] - a[1])[0]?.[0];

    return { moods, total, slices, week, topDay };
  }, [data]);

  const genres = useMemo(
    () => [...(data?.genres ?? [])].sort((a, b) => b.count - a.count).slice(0, 6),
    [data],
  );
  const maxGenre = Math.max(...genres.map((g) => g.count), 1);

  if (loading) return <p className="status" role="status">Cargando tu tablero…</p>;

  if (error) {
    return (
      <section className="dash">
        <h1 className="dash-title">Mi tablero</h1>
        <p className="error" role="alert">{error}</p>
        <button type="button" className="ghost dash-retry" onClick={load}>Reintentar</button>
      </section>
    );
  }

  if (stats.total === 0) {
    return (
      <section className="dash">
        <h1 className="dash-title">Mi tablero</h1>
        <p className="lead">Todavía no hay datos. Detectá tu ánimo y acá vas a ver cómo va cambiando.</p>
        <Link to="/detectar" className="primary dash-cta">Detectar mi ánimo</Link>
      </section>
    );
  }

  const top = stats.slices[0];
  const last = stats.moods[0];
  const weekHasData = stats.week.some((w) => w.items.length > 0);
  const history = showAll ? stats.moods : stats.moods.slice(0, 8);
  const topGenre = genres[0];

  return (
    <section className="dash">
      <header>
        <h1 className="dash-title">Mi tablero</h1>
        <p className="lead">Cómo fue cambiando tu ánimo y qué tipo de contenido te recomendamos.</p>
      </header>

      {/* Estadísticas */}
      <div className="dash-stats">
        <article className="dash-card stat">
          <span className="stat-label">Lecturas</span>
          <strong className="stat-value">{stats.total}</strong>
        </article>

        <article className="dash-card stat">
          <span className="stat-label">Ánimo más frecuente</span>
          <strong className="stat-value stat-mood" style={{ color: top.color }}>
            <MoodFace emotion={top.emotion} className="dash-face" />
            {top.label}
          </strong>
        </article>

        <article className="dash-card stat">
          <span className="stat-label">Última lectura</span>
          <strong className="stat-value">{fmtDate(last.date)}</strong>
          <small className="stat-note">{fmtTime(last.date)}</small>
        </article>
      </div>

      <div className="dash-grid">
        {/* Dona */}
        <article className="dash-card">
          <h2>Historial de tu ánimo</h2>
          <div className="donut-wrap">
            <DonutChart slices={stats.slices} total={stats.total} />
            <ul className="legend">
              {stats.slices.map((s) => (
                <li key={s.emotion}>
                  <span className="swatch" style={{ background: s.color }} aria-hidden="true" />
                  <span>{s.label}</span>
                  <strong>{s.pct}%</strong>
                </li>
              ))}
            </ul>
          </div>
        </article>

        {/* Semana */}
        <article className="dash-card">
          <h2>Tu semana</h2>
          <div className="week">
            {stats.week.map((w, i) => (
              <div key={w.key} className={i === 6 ? 'week-col today' : 'week-col'}>
                <div className="week-stack">
                  {w.items.slice(0, 6).map((m, j) => (
                    <span key={j} className="pip" style={{ background: colorOf(m.emotion) }} title={labelOf(m.emotion)} />
                  ))}
                </div>
                {w.items.length > 6 && <small className="week-more">+{w.items.length - 6}</small>}
                <span className="week-day">{w.date.toLocaleDateString('es-GT', { weekday: 'short' })}</span>
              </div>
            ))}
          </div>
          {!weekHasData && <p className="status">Esta semana todavía no tenés lecturas.</p>}
        </article>
      </div>

      {/* Géneros */}
      {genres.length > 0 && (
        <article className="dash-card">
          <h2>Qué te recomendamos</h2>
          <ul className="gbars">
            {genres.map((g) => (
              <li key={g.name}>
                <span>{g.name}</span>
                <span className="gbar" style={{ width: `${(g.count / maxGenre) * 100}%` }} />
                <strong>{g.count}</strong>
              </li>
            ))}
          </ul>
        </article>
      )}

      {/* Patrones */}
      <article className="dash-card">
        <h2>Tus patrones</h2>
        {stats.total < 3 ? (
          <p className="status">Necesitamos al menos 3 lecturas para encontrar patrones. ¡Seguí usando Butaca!</p>
        ) : (
          <ul className="patterns">
            <li>
              Tu ánimo más frecuente es <strong style={{ color: top.color }}>{top.label.toLowerCase()}</strong> (
              {top.pct}% de tus lecturas).
            </li>
            {topGenre && (
              <li>
                El género que más te recomendamos es <strong>{topGenre.name}</strong>.
              </li>
            )}
            {stats.topDay && (
              <li>
                Solés usar Butaca más los <strong>{plural(stats.topDay)}</strong>.
              </li>
            )}
          </ul>
        )}
      </article>

      {/* Historial */}
      <article className="dash-card">
        <h2>Historial reciente</h2>
        <ul className="history">
          {history.map((m, i) => (
            <li key={`${m.createdAt}-${i}`}>
              <MoodFace emotion={m.emotion} className="dash-face" style={{ color: colorOf(m.emotion) }} />
              <strong>{labelOf(m.emotion)}</strong>
              <span className="history-date">
                {fmtDate(m.date)} · {fmtTime(m.date)}
              </span>
            </li>
          ))}
        </ul>
        {stats.moods.length > 8 && (
          <button type="button" className="ghost dash-more" onClick={() => setShowAll((v) => !v)}>
            {showAll ? 'Ver menos' : `Ver todo (${stats.moods.length})`}
          </button>
        )}
      </article>
    </section>
  );
}