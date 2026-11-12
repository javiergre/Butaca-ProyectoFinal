
import { test, expect } from '@playwright/test';

const FRONTEND = 'https://butaca-frontend.onrender.com';
const BACKEND = 'https://butaca-backend.onrender.com';

// Cada prueba comienza sin una sesión autenticada.
test.use({
  storageState: { cookies: [], origins: [] }
});

test('Butaca muestra sus opciones de inicio de sesión', async ({ page }) => {
  await page.goto(`${FRONTEND}/login`);

  await expect(
    page.getByRole('button', { name: 'Iniciar con Google' })
  ).toBeVisible();

  await expect(
    page.getByRole('button', { name: 'Iniciar con GitHub' })
  ).toBeVisible();
});

for (const route of ['/api/favorites', '/api/dashboard', '/api/moods']) {
  test(`Protege ${route} sin autenticación`, async ({ request }) => {
    const response = await request.get(`${BACKEND}${route}`);

    expect(response.status()).toBe(401);
    expect((await response.json()).error).toBe('No autorizado');
  });
}
