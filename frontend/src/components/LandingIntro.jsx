
import { Link } from 'react-router-dom';

export default function LandingIntro() {
  return (
    <div className="home-landing">

      {/* Presentación principal */}
      <section className="home-hero">

        <div className="home-hero-content">
          <span className="home-eyebrow">
            TU NOCHE, TU PELÍCULA
          </span>

          <h1>
            Menos tiempo buscando.
            <span> Más tiempo disfrutando.</span>
          </h1>

          <p className="home-description">
            ¿No sabes qué ver esta noche?
            Butaca te ayuda a descubrir películas
            y series según cómo te sientes.
          </p>

          <div className="home-buttons">
            <a href="#como-funciona" className="home-btn-primary">
              Descubre cómo funciona
            </a>

            <Link to="/favorites" className="home-btn-secondary">
              Mis favoritos
            </Link>
          </div>
        </div>

        {/* Elemento visual decorativo */}
        <div className="home-hero-art" aria-hidden="true">
          <div className="home-cinema-card">
            <div className="home-cinema-screen">
              <div className="home-circle-red"></div>
              <div className="home-circle-yellow"></div>
              <div className="home-circle-blue"></div>
            </div>

            <div className="home-cinema-info">
              <span>BUTACA PRESENTA</span>
              <strong>Tu próxima historia</strong>
              <p>Una recomendación para cada emoción.</p>
            </div>
          </div>
        </div>

      </section>

      {/* Explicación del funcionamiento */}
      <section className="home-how" id="como-funciona">

        <div className="home-section-heading">
          <span className="home-eyebrow">
            ASÍ DE SENCILLO
          </span>

          <h2>¿Cómo funciona Butaca?</h2>

          <p>
            Tres pasos para encontrar algo que realmente
            tengas ganas de ver.
          </p>
        </div>

        <div className="home-steps">

          <article className="home-step">
            <span className="home-step-number">01</span>
            <h3>Descubre tu ánimo</h3>
            <p>
              Con tu permiso, Butaca utiliza la cámara
              para ayudarte a identificar tu emoción.
            </p>
          </article>

          <article className="home-step">
            <span className="home-step-number">02</span>
            <h3>Recibe recomendaciones</h3>
            <p>
              Descubre películas y series de acuerdo
              con cómo te sientes en ese momento.
            </p>
          </article>

          <article className="home-step">
            <span className="home-step-number">03</span>
            <h3>Guarda tus favoritas</h3>
            <p>
              Conserva las películas y series que más
              te gustan para encontrarlas después.
            </p>
          </article>

        </div>
      </section>

      {/* Mensaje de privacidad */}
      <section className="home-privacy">
        <div>
          <span className="home-eyebrow">TU PRIVACIDAD IMPORTA</span>
          <h2>Tu cámara, tu decisión.</h2>
          <p>
            Butaca está diseñada para solicitar permiso
            antes de utilizar tu cámara y no almacenar
            fotografías de tu rostro.
          </p>
        </div>
      </section>

    </div>
  );
}
