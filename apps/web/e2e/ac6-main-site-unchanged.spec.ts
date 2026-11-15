import { test, expect } from '@playwright/test';
import { base } from './preview-fixture';

test('AC6: apex, www and Vercel hosts retain normal public pages and admin protection', async ({ request }) => {
  for (const host of ['localhost', 'www.localhost', 'deployment.vercel.app']) {
    for (const path of ['/', '/login', '/admin']) {
      const response = await request.get(`${base()}${path}`, { headers: { host }, maxRedirects: 0 });
      if (path === '/admin') {
        expect(response.status()).toBe(307);
        expect(response.headers().location).toContain('/login');
      } else {
        expect(response.status()).toBe(200);
        expect(await response.text()).toContain('Weblix');
      }
    }
  }
});
