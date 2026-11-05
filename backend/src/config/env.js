import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().default(3000),
  FRONTEND_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(20),
  DATABASE_URL: z.string().min(1),
  TMDB_READ_ACCESS_TOKEN: z.string().min(1),
});

const result = schema.safeParse(process.env);

if (!result.success) {
  const faltan = result.error.issues
    .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
    .join('\n');
  console.error(`Variables de entorno inválidas o faltantes:\n${faltan}`);
  process.exit(1);
}

export const env = result.data;