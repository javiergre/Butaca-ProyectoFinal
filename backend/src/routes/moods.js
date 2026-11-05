import { Router } from 'express';

import { createMood, moodSchema } from '../controllers/moods.controller.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.post('/', validate(moodSchema), createMood);

export default router;
