
import { z } from 'zod';

import {
  discoverMovies,
  discoverTv,
  getMovieDetails,
  getTvDetails
} from '../lib/tmdb.js';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).max(500).default(1)
});

const idSchema = z.coerce.number().int().positive().safe();

export async function getMovies(req, res, next) {
  try {
    const result = querySchema.safeParse(req.query);

    if (!result.success) {
      return res.status(400).json({
        error: 'Parámetros de búsqueda inválidos'
      });
    }

    const movies = await discoverMovies(result.data.page);
    return res.status(200).json(movies);

  } catch (error) {
    next(error);
  }
}

export async function getTv(req, res, next) {
  try {
    const result = querySchema.safeParse(req.query);

    if (!result.success) {
      return res.status(400).json({
        error: 'Parámetros de búsqueda inválidos'
      });
    }

    const series = await discoverTv(result.data.page);
    return res.status(200).json(series);

  } catch (error) {
    next(error);
  }
}

export async function getMovie(req, res, next) {
  try {
    const result = idSchema.safeParse(req.params.id);

    if (!result.success) {
      return res.status(400).json({
        error: 'ID de película inválido'
      });
    }

    const movie = await getMovieDetails(result.data);
    return res.status(200).json(movie);

  } catch (error) {
    next(error);
  }
}

export async function getTvById(req, res, next) {
  try {
    const result = idSchema.safeParse(req.params.id);

    if (!result.success) {
      return res.status(400).json({
        error: 'ID de serie inválido'
      });
    }

    const series = await getTvDetails(result.data);
    return res.status(200).json(series);

  } catch (error) {
    next(error);
  }
}
