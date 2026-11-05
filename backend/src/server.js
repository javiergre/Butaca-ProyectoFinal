// TODO: importar app y escuchar en env.PORT

import 'dotenv/config';

import app from './app.js';
import { env } from './config/env.js';

app.listen(env.PORT, () => {
  console.log(`Servidor Butaca ejecutándose en puerto ${env.PORT}`);
  console.log(`API disponible en http://localhost:${env.PORT}/api`);
});