// Emociones que devuelve face-api 
export const MOODS = {
  happy: { label: 'Alegre', color: '#FFB300' },
  sad: { label: 'Triste', color: '#5B8CFF' },
  angry: { label: 'Molesto', color: '#E60026' },
  fearful: { label: 'Asustado', color: '#B26BFF' },
  surprised: { label: 'Sorprendido', color: '#00E5FF' },
  disgusted: { label: 'Asqueado', color: '#7ED957' },
  neutral: { label: 'Tranquilo', color: '#A3A3B5' },
};

const WEIGHTS = { neutral: 0.55 };

/* Promedia varias lecturas. */
export function averageExpressions(samples) {
  const totals = {};
  for (const s of samples) {
    for (const [k, v] of Object.entries(s)) {
      if (typeof v === 'number') totals[k] = (totals[k] ?? 0) + v;
    }
  }
  const out = {};
  for (const k of Object.keys(totals)) out[k] = totals[k] / samples.length;
  return out;
}

/* Por cada emoción, promedia solo el tercio de lecturas más fuerte (el "pico" de la expresión). */
export function peakExpressions(samples) {
  const keys = new Set(samples.flatMap((s) => Object.keys(s)));
  const out = {};
  for (const k of keys) {
    const values = samples.map((s) => s[k]).filter((v) => typeof v === 'number').sort((a, b) => b - a);
    const top = values.slice(0, Math.max(1, Math.ceil(values.length / 3)));
    out[k] = top.reduce((a, b) => a + b, 0) / top.length;
  }
  return out;
}

/* Devuelve la emoción ganadora: { emotion, confidence }. */
export function pickDominantEmotion(expressions) {
  const scored = Object.entries(expressions)
    .filter(([k, v]) => k in MOODS && typeof v === 'number')
    .map(([k, v]) => [k, v * (WEIGHTS[k] ?? 1)]);
  if (scored.length === 0) return null;
  const [emotion] = scored.sort((a, b) => b[1] - a[1])[0];
  return { emotion, confidence: Number(expressions[emotion].toFixed(3)) };
}

let modelsReady = null;

async function loadFaceApi() {
  const faceapi = await import('@vladmandic/face-api'); 
  if (!modelsReady) {
    const url = `${import.meta.env.BASE_URL}models`;
    modelsReady = Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(url),
      faceapi.nets.faceExpressionNet.loadFromUri(url),
    ]).catch((e) => {
      modelsReady = null;
      throw e;
    });
  }
  await modelsReady;
  return faceapi;
}

/*
 * Lee varios fotogramas del video y devuelve la emoción dominante.
 * La imagen nunca sale del equipo: solo se usa el resultado (etiqueta + confianza).
 */
export async function detectEmotion(video, { samples = 12, intervalMs = 250, warmupMs = 1200 } = {}) {
  const faceapi = await loadFaceApi();
  const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.4 });

  // Tiempo para que la persona ponga y sostenga la expresión
  await new Promise((res) => setTimeout(res, warmupMs));

  const readings = [];
  for (let i = 0; i < samples; i++) {
    const r = await faceapi.detectSingleFace(video, options).withFaceExpressions();
    if (r) readings.push({ ...r.expressions });
    await new Promise((res) => setTimeout(res, intervalMs));
  }
  if (readings.length === 0) return null;

  const expressions = peakExpressions(readings);
  return pickDominantEmotion(expressions);
}