import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { GithubIcon, GoogleIcon } from '../components/Icons';
import { useAuth } from '../context/AuthContext';

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
      setError('No pudimos iniciar sesión. Intenta de nuevo.');
      setBusy(false);
    } // si no hay error, el navegador redirige al proveedor
  }

  return (
    <main className="login">
      <section className="marquee" aria-labelledby="titulo">
        <div className="bulbs" aria-hidden="true" />
        <div className="marquee-body">
          <p className="eyebrow">Función continua</p>
          <h1 id="titulo" className="neon-logo">Butaca</h1>
          <span className="tube" aria-hidden="true" />

          <div className="letterboard">
            <span>Hoy en cartelera</span>
            <strong>Tu ánimo</strong>
          </div>
          <p className="lead">Encontrá qué ver en un instante, según cómo te sentís.</p>

          <div className="login-actions">
            <div className="ticket-wrap red">
              <button className="ticket red" disabled={busy} onClick={() => handleSignIn('google')}>
                <GoogleIcon /> Entrar con Google
              </button>
            </div>
            <div className="ticket-wrap aqua">
              <button className="ticket aqua" disabled={busy} onClick={() => handleSignIn('github')}>
                <GithubIcon /> Entrar con GitHub
              </button>
            </div>
          </div>

          {error && <p className="error" role="alert">{error}</p>}

          <p className="fineprint">
            Tus datos están seguros.<br />
          </p>
        </div>
        <div className="bulbs" aria-hidden="true" />
      </section>
    </main>
  );
}