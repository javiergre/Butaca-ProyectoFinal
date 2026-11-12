
import { test, expect } from '@playwright/test';

test.use({
  storageState: 'playwright/.auth/user.json'
});

test('Butaca recomienda películas según la emoción', async ({ page }) => {

  // Abrir Butaca con la sesión autenticada
  await page.goto('https://butaca-frontend.onrender.com/');

  // Entrar a la detección de emociones
  await page.getByRole('link', {
    name: 'Detectar mi ánimo'
  }).click();

  // Seleccionar alegre manualmente
  await page.getByRole('button', {
    name: 'Alegre'
  }).click();

  // Verificar que aparezcan recomendaciones
  await expect(
    page.getByRole('link', {
      name: 'Ver detalles completos'
    }).first()
  ).toBeVisible();

});



test('Butaca guarda favoritos y muestra el tablero', async ({ page }) => {
  // Entrar directamente a detectar
  await page.goto('https://butaca-frontend.onrender.com/detectar');

  // Seleccionar una emoción
  await page.getByRole('button', { name: 'Alegre' }).click();

  // Buscar una película que todavía no sea favorita
  const agregar = page.getByRole('button', {
    name: '♡ Agregar a favoritos'
  }).first();

  await expect(agregar).toBeVisible();

  // Guardar el título para comprobarlo después
  const titulo = await agregar
    .locator('xpath=ancestor::article')
    .locator('h3')
    .innerText();

  // Agregar a favoritos
  await agregar.click();

  const tarjeta = page.locator('.catalog-card').filter({
    has: page.getByRole('heading', {
      name: titulo,
      exact: true
    })
  }).first();

  await expect(
    tarjeta.getByRole('button', { name: '♥ En favoritos' })
  ).toBeVisible();

  // Ir a favoritos
  await page.getByRole('link', {
    name: 'Favoritos',
    exact: true
  }).click();

  await expect(
    page.getByRole('heading', { name: 'Tus favoritos' })
  ).toBeVisible();

  // Actualizar la página para comprobar persistencia
  await page.reload();

  const favorito = page.locator('.catalog-card').filter({
    has: page.getByRole('heading', {
      name: titulo,
      exact: true
    })
  }).first();

  await expect(favorito).toBeVisible();

  // Eliminar el favorito utilizado en la prueba
  await favorito.getByRole('button', {
    name: '♥ En favoritos'
  }).click();

  await expect(favorito).toHaveCount(0);

  // Entrar al tablero
  await page.getByRole('link', {
    name: 'Mi tablero',
    exact: true
  }).click();

  await expect(
    page.getByRole('heading', { name: 'Mi tablero' })
  ).toBeVisible();
});
