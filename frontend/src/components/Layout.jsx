import { Link, NavLink, Outlet } from 'react-router-dom';
import { LogoMark } from './Logo';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, signOut } = useAuth();

  const name =
    user?.user_metadata?.name ??
    user?.email ??
    'Mi cuenta';

  return (
    <div className="app butaca-shell">
      <a className="butaca-skip" href="#contenido">
        Ir al contenido
      </a>

      <header className="topbar butaca-header">
        <Link to="/" className="butaca-brand">
          <LogoMark className="brand-mark" />
          <span className="wordmark sm">
            Butaca<span className="dot">.</span>
          </span>
        </Link>

        <nav className="tabs butaca-navigation" aria-label="Navegación principal">
          <NavLink to="/" end>
            Inicio
          </NavLink>

          <NavLink to="/detectar">
            Detectar
          </NavLink>

          <NavLink to="/dashboard">
            Mi tablero
          </NavLink>

          <NavLink to="/favorites">
            Favoritos
          </NavLink>
        </nav>

        <div className="who butaca-user">
          <span className="who-name" title={name}>
            {name}
          </span>

          <button
            type="button"
            className="ghost butaca-logout"
            onClick={signOut}
          >
            Salir
          </button>
        </div>
      </header>

      <div className="stripes butaca-stripes" aria-hidden="true" />

      <main id="contenido" className="butaca-content">
        <Outlet />
      </main>

      <footer className="butaca-footer">
        <span>
          Butaca © 2026
        </span>

        <span>
          Que nadie pierda veinte minutos decidiendo.
        </span>
      </footer>
    </div>
  );
}