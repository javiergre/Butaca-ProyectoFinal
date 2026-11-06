import { z } from 'zod';

import { prisma } from '../lib/prisma.js';

const mediaType = z.enum(['movie', 'tv']);

const favoriteFields = {
  tmdbId: z.coerce.number().int().positive(),
  mediaType,
  title: z.string().trim().min(1).max(300),
  posterPath: z.string().trim().max(300).nullish()
};

export const createFavoriteSchema = z.object(favoriteFields);

export const removeFavoriteSchema = z.object({
  mediaType,
  tmdbId: z.coerce.number().int().positive()
});

export async function listFavorites(req, res, next) {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      select: { tmdbId: true, mediaType: true, title: true, posterPath: true }
    });

    return res.status(200).json({ favorites });
  } catch (error) {
    next(error);
  }
}

export async function addFavorite(req, res, next) {
  try {
    const favorite = await prisma.favorite.create({
      data: { ...req.body, userId: req.user.id },
      select: { tmdbId: true, mediaType: true, title: true, posterPath: true }
    });

    return res.status(201).json(favorite);
  } catch (error) {
    // El índice único [userId, mediaType, tmdbId] rechaza el duplicado
    if (error?.code === 'P2002') {
      return res.status(409).json({
        error: 'Ese contenido ya está en tus favoritas'
      });
    }

    next(error);
  }
}

export async function removeFavorite(req, res, next) {
  try {
    const { count } = await prisma.favorite.deleteMany({
      where: {
        userId: req.user.id,
        mediaType: req.params.mediaType,
        tmdbId: req.params.tmdbId
      }
    });

    if (count === 0) {
      return res.status(404).json({
        error: 'Ese contenido no está en tus favoritas'
      });
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}
