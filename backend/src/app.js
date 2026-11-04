// TODO: crear la app de Express
//  - helmet(), cors({ origin: env.FRONTEND_URL }), express.json()
//  - rate limit (express-rate-limit)
//  - app.use('/api', routes)
//  - errorHandler al final

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler.js';

import { env } from './config/env.js';
import routes from './routes/index.js';

const app = express();

// Seguridad
app.use(helmet());

app.use(cors({
  origin: env.FRONTEND_URL
}));

// Leer solicitudes JSON
app.use(express.json({ limit: '100kb' }));

// Limitar solicitudes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false
});

app.use('/api', limiter);

// Rutas
app.use('/api', routes);

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada'
  });
});

app.use(errorHandler);

export default app;