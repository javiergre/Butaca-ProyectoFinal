// Copia los modelos de face-api (detector + expresiones) a public/models.
// Se ejecuta en postinstall; así el repo no guarda archivos binarios.
import { cpSync, existsSync, mkdirSync } from 'node:fs';

const src = 'node_modules/@vladmandic/face-api/model';
const dest = 'public/models';
const files = [
  'tiny_face_detector_model.bin',
  'tiny_face_detector_model-weights_manifest.json',
  'face_expression_model.bin',
  'face_expression_model-weights_manifest.json',
];

if (!existsSync(src)) {
  console.warn('[copy-models] face-api no está instalado todavía; se omite.');
  process.exit(0);
}
mkdirSync(dest, { recursive: true });
for (const f of files) cpSync(`${src}/${f}`, `${dest}/${f}`);
console.log('[copy-models] modelos copiados a', dest);
