
import { Router } from 'express';

import { requireAuth } from '../middleware/auth.js';

import catalogRoutes from './catalog.js';
import recommendationRoutes from './recommendations.js';
import dashboardRoutes from './dashboard.js';
import favoritesRoutes from './favorites.js';
import moodsRoutes from './moods.js';

const router = Router();

// Catálogo y recomendaciones públicas
router.use('/catalog', catalogRoutes);
router.use('/recommendations', recommendationRoutes);

// Funcionalidades que requieren autenticación
router.use('/moods', requireAuth, moodsRoutes);
router.use('/favorites', requireAuth, favoritesRoutes);
router.use('/dashboard', requireAuth, dashboardRoutes);

// Verificar funcionamiento del servidor
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Butaca API funcionando correctamente'
  });
});

export default router;
