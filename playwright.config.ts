import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    headless: false,
    viewport: { width: 1366, height: 768 },
    actionTimeout: 30000,
    navigationTimeout: 30000
  }
});