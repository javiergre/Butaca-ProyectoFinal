
import { Router } from 'express';

import catalogRoutes from './catalog.js';
import recommendationRoutes from './recommendations.js';

const router = Router();

router.use('/catalog', catalogRoutes);
router.use('/recommendations', recommendationRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Butaca API funcionando correctamente'
  });
});

export default router;
