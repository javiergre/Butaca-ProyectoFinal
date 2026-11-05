
import { Router } from 'express';

import {
  getMovies,
  getTv,
  getMovie,
  getTvById
} from '../controllers/catalog.controller.js';

const router = Router();

router.get('/movies', getMovies);
router.get('/tv', getTv);

router.get('/movie/:id', getMovie);
router.get('/tv/:id', getTvById);

export default router;
