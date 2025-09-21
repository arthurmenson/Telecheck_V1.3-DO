import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { server, start } from '../../src/app';

describe('Messaging Admin Service', () => {
  beforeAll(async () => { if (!server.listening) await start(); });
  afterAll(async () => { if (server.listening) await server.close(); });

  it('GET /config returns success and config', async () => {
    const res = await server.inject({ method: 'GET', url: '/config' });
    expect(res.statusCode).toBe(200);
    const body = res.json() as any;
    expect(body.success).toBe(true);
    expect(body).toHaveProperty('config');
  });

  it('GET /analytics returns success and analytics', async () => {
    const res = await server.inject({ method: 'GET', url: '/analytics?period=24h' });
    expect(res.statusCode).toBe(200);
    const body = res.json() as any;
    expect(body.success).toBe(true);
    expect(body).toHaveProperty('analytics');
  });
});
