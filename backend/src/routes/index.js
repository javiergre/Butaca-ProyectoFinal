// TODO: montar /recommendations (feature/tmdb-api / recommendation-engine)
import { Router } from 'express';

import { requireAuth } from '../middleware/auth.js';
import catalogRoutes from './catalog.js';
import dashboardRoutes from './dashboard.js';
import favoritesRoutes from './favorites.js';
import moodsRoutes from './moods.js';

const router = Router();

router.use('/catalog', catalogRoutes);

// Datos del usuario autenticado
router.use('/moods', requireAuth, moodsRoutes);
router.use('/favorites', requireAuth, favoritesRoutes);
router.use('/dashboard', requireAuth, dashboardRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Butaca API funcionando correctamente'
  });
});

export default router;