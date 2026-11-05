
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { errorHandler } from '../src/middleware/errorHandler.js';

let app;

beforeAll(async () => {
  // Variables de prueba, sin utilizar secretos reales
  process.env.PORT = '3000';
  process.env.FRONTEND_URL = 'http://localhost:5173';

  const module = await import('../src/app.js');
  app = module.default;
});

describe('Butaca API', () => {


    it('Helmet agrega encabezados de seguridad', async () => {
  const res = await request(app)
    .get('/api/health');

  expect(res.headers['x-content-type-options']).toBe('nosniff');
    });

    it('CORS permite el origen del frontend', async () => {
    const res = await request(app)
        .get('/api/health')
        .set('Origin', 'http://localhost:5173');

    expect(res.headers['access-control-allow-origin'])
        .toBe('http://localhost:5173');
    });

    it('Un error interno devuelve HTTP 500 sin exponer detalles', async () => {
    // Aplicación aislada exclusivamente para esta prueba
    const testApp = express();

    testApp.get('/error', () => {
        throw new Error('Información interna privada');
    });

    testApp.use(errorHandler);

    const res = await request(testApp).get('/error');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe(
        'Ocurrió un error interno del servidor'
    );
    expect(JSON.stringify(res.body))
        .not.toContain('Información interna privada');
    });

  it('GET /api/health devuelve HTTP 200', async () => {
    const res = await request(app)
      .get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.message).toBe(
      'Butaca API funcionando correctamente'
    );
  });

  it('Una ruta inexistente devuelve HTTP 404', async () => {
    const res = await request(app)
      .get('/api/no-existe');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Ruta no encontrada');
  });

  it('Un JSON inválido devuelve HTTP 400', async () => {
    const res = await request(app)
      .post('/api/health')
      .set('Content-Type', 'application/json')
      .send('{"mood":');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(
      'El formato JSON enviado no es válido'
    );
  });

  it('Una solicitud demasiado grande devuelve HTTP 413', async () => {
    const res = await request(app)
      .post('/api/health')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({
        data: 'a'.repeat(110000)
      }));

    expect(res.status).toBe(413);
    expect(res.body.error).toBe(
      'La solicitud supera el tamaño permitido'
    );
  });

  it('Bloquea solicitudes excesivas con HTTP 429', async () => {
    let bloqueado = false;

    for (let i = 0; i < 105; i++) {
        const res = await request(app).get('/api/health');

        if (res.status === 429) {
        bloqueado = true;
        break;
        }
    }

    expect(bloqueado).toBe(true);
    });

});
