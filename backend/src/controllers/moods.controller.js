import { z } from 'zod';

import { prisma } from '../lib/prisma.js';

// Etiquetas de ánimo acordadas en el contrato de la API (README)
const EMOTIONS = [
  'happy',
  'sad',
  'angry',
  'fearful',
  'surprised',
  'disgusted',
  'neutral'
];

export const moodSchema = z.object({
  emotion: z.enum(EMOTIONS),
  confidence: z.number().min(0).max(1).nullish()
});

export async function createMood(req, res, next) {
  try {
    const mood = await prisma.moodEntry.create({
      data: {
        userId: req.user.id,
        emotion: req.body.emotion,
        confidence: req.body.confidence ?? null
      },
      select: { emotion: true, createdAt: true }
    });

    return res.status(201).json(mood);
  } catch (error) {
    next(error);
  }
}
