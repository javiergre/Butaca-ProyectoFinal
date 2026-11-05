export function errorHandler(err, req, res, next) {
  console.error(err);

  const status = err.status >= 400 && err.status < 500 ? err.status : 500;
  const message = status < 500 ? err.message : 'Error interno del servidor';

  res.status(status).json({ error: message });
}