import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { GithubIcon, GoogleIcon } from '../components/icons';
import { useAuth } from '../context/AuthContext';
import { LogoMark } from '../components/Logo';

function PosterArt() {
  return (
    <svg className="poster-art" viewBox="0 0 400 240" role="img" aria-label="Composición geométrica abstracta en rojo, ámbar y aqua">
      <rect width="400" height="240" fill="#1A1A24" />
      <circle cx="150" cy="118" r="88" fill="#E60026" />
      <circle cx="150" cy="118" r="62" fill="none" stroke="#0D0D11" strokeWidth="4" />
      <circle cx="150" cy="118" r="34" fill="none" stroke="#0D0D11" strokeWidth="4" />
      <path d="M215 214 A85 85 0 0 1 385 214 Z" fill="#FFB300" />
      <circle cx="318" cy="56" r="26" fill="none" stroke="#00E5FF" strokeWidth="5" />
      <rect y="214" width="400" height="8" fill="#00E5FF" />
    </svg>
  );
}

export default function Login() {
  const { user, loading, signIn } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!loading && user) return <Navigate to="/" replace />;

  async function handleSignIn(provider) {
    setError('');
    setBusy(true);
    const { error: err } = await signIn(provider);
    if (err) {
      setError('No pudimos iniciar sesión. Intentá de nuevo.');
      setBusy(false);
    } // si no hay error, el navegador redirige al proveedor
  }

  return (
    <main className="login">
      <section className="login-card">
        <PosterArt />
        <div className="login-body">
          <LogoMark className="login-mark" />
          <h1 className="wordmark">Butaca<span className="dot">.</span></h1>
          <p className="lead">Encontrá qué ver en un instante, según cómo te sentís.</p>

          <div className="login-actions">
            <button className="provider" disabled={busy} onClick={() => handleSignIn('google')}>
              <GoogleIcon /> Iniciar con Google
            </button>
            <button className="provider" disabled={busy} onClick={() => handleSignIn('github')}>
              <GithubIcon /> Iniciar con GitHub
            </button>
          </div>

          {error && <p className="error" role="alert">{error}</p>}

          <p className="fineprint">
            Tus datos están seguros.<br />
            No almacenamos tu imagen.
          </p>
        </div>
      </section>
    </main>
  );
}