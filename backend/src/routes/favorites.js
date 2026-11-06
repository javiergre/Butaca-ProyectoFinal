import { Router } from 'express';

import {
  addFavorite,
  createFavoriteSchema,
  listFavorites,
  removeFavorite,
  removeFavoriteSchema
} from '../controllers/favorites.controller.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', listFavorites);
router.post('/', validate(createFavoriteSchema), addFavorite);
router.delete('/:mediaType/:tmdbId', validate(removeFavoriteSchema, 'params'), removeFavorite);

export default router;
