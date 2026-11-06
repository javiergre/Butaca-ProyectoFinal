import './mood.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { detectEmotion } from '../lib/emotion';

function cameraMessage(e) {
  if (e?.name === 'NotAllowedError') return 'No diste permiso a la cámara. Podés elegir tu ánimo a mano.';
  if (e?.name === 'NotFoundError') return 'No encontramos una cámara. Podés elegir tu ánimo a mano.';
  return 'No pudimos usar la cámara. Podés elegir tu ánimo a mano.';
}

export default function CameraCapture({ onDetected }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState('idle'); 
  const [error, setError] = useState('');

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => stop, [stop]); // apaga la cámara al salir de la pantalla

  async function start() {
    setError('');
    setStatus('starting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setStatus('scanning');
      const result = await detectEmotion(videoRef.current);
      stop();
      if (!result) {
        setStatus('error');
        setError('No pudimos ver tu cara. Probá con más luz o elegí tu ánimo a mano.');
        return;
      }
      setStatus('idle');
      onDetected(result);
    } catch (e) {
      stop();
      setStatus('error');
      setError(cameraMessage(e));
    }
  }

  const scanning = status === 'scanning';

  return (
    <section className="camera" aria-label="Leer mi ánimo con la cámara">
      <div className={scanning ? 'viewfinder on' : 'viewfinder'}>
        <video ref={videoRef} muted playsInline />
        <span className="corner tl" aria-hidden="true" />
        <span className="corner tr" aria-hidden="true" />
        <span className="corner bl" aria-hidden="true" />
        <span className="corner br" aria-hidden="true" />
        {scanning ? (
          <p className="vf-text" role="status">Poné tu expresión y mantenela…</p>
        ) : (
          <p className="vf-text">Cámara apagada</p>
        )}
        {(scanning || status === 'starting') && <span className="spinner" aria-hidden="true" />}
      </div>

      <p className="privacy">
        Solo tomamos la expresión del momento para recomendarte contenido.
        <br />
        No guardamos fotos ni videos.
      </p>

      <label className="consent">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} disabled={scanning} />
        Entiendo y doy permiso para usar mi cámara
      </label>

      <button className="primary" disabled={!consent || status === 'starting' || scanning} onClick={start}>
        {status === 'starting' ? 'Abriendo cámara…' : scanning ? 'Leyendo tu ánimo…' : 'Detectar mi ánimo'}
      </button>

      {error && <p className="error" role="alert">{error}</p>}
    </section>
  );
}