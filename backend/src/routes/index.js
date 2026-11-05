// TODO: aplicar middleware auth y montar /recommendations, /moods, /favorites, /dashboard
import { Router } from 'express';
import catalogRoutes from './catalog.js';

const router = Router();

router.use('/catalog', catalogRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Butaca API funcionando correctamente'
  });
});

export default router;