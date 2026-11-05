
import { TmdbError } from '../lib/tmdb.js';

export function errorHandler(err, req, res, next) {

  // JSON inválido
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'El formato JSON enviado no es válido'
    });
  }

  // Solicitud demasiado grande
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'La solicitud supera el tamaño permitido'
    });
  }

  // Errores de TMDB
  if (err instanceof TmdbError) {
    return res.status(err.status).json({
      error: err.message
    });
  }

  // Registrar errores internos inesperados
  console.error('Error interno en Butaca API:', err.message);

  return res.status(500).json({
    error: 'Ocurrió un error interno del servidor'
  });
}
