
import { z } from 'zod';

import { EMOTION_GENRES } from '../lib/emotionGenres.js';
import { discoverRecommendations } from '../lib/tmdb.js';

const recommendationSchema = z.object({
  emotion: z.enum([
    'happy',
    'sad',
    'angry',
    'fearful',
    'surprised',
    'disgusted',
    'neutral'
  ]),

  type: z.enum(['movie', 'tv']).default('movie'),

  page: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(1)
});

export async function getRecommendations(req, res, next) {
  try {
    const validation = recommendationSchema.safeParse(req.query);

    if (!validation.success) {
      return res.status(400).json({
        error: 'Parámetros de recomendación inválidos'
      });
    }

    const { emotion, type, page } = validation.data;

    const genres = EMOTION_GENRES[emotion][type];

    const recommendations = await discoverRecommendations(
      type,
      genres,
      page
    );

    return res.status(200).json({
      emotion,
      type,
      genres,
      page: recommendations.page,
      totalPages: recommendations.totalPages,
      results: recommendations.results
    });

  } catch (error) {
    next(error);
  }
}
