// TODO: validar con Zod las variables: PORT, FRONTEND_URL, SUPABASE_URL, SUPABASE_ANON_KEY, DATABASE_URL, TMDB_API_KEY
// Si falta alguna, fallar al arrancar con un mensaje claro.

import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535),
  FRONTEND_URL: z.url()
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('Variables de entorno inválidas');
  console.error(z.treeifyError(result.error));
  process.exit(1);
}

export const env = result.data;