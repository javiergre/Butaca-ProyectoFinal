import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, signOut } = useAuth();
  const name = user?.user_metadata?.name ?? user?.email ?? '';
  return (
    <div className="app">
      <header className="topbar">
        <span className="wordmark sm">Butaca<span className="dot">.</span></span>
        <div className="who">
          <span className="who-name">{name}</span>
          <button className="ghost" onClick={signOut}>Salir</button>
        </div>
      </header>
      <div className="stripes" aria-hidden="true" />

      <nav className="tabs" aria-label="Principal">
        <NavLink to="/" end>Recomendar</NavLink>
        <NavLink to="/dashboard">Mi tablero</NavLink>
        <NavLink to="/favorites">Favoritos</NavLink>
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  );
}