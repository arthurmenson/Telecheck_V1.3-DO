import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { server, start } from '../../src/app';

describe('Auth Service', () => {
  beforeAll(async () => { if (!server.listening) await start(); });
  afterAll(async () => { if (server.listening) await server.close(); });

  it('POST /auth/login returns user and token', async () => {
    const res = await server.inject({ method: 'POST', url: '/auth/login', payload: { email: 'a@b.com', password: 'x' } });
    expect(res.statusCode).toBe(200);
    const body = res.json() as any;
    expect(body).toHaveProperty('user');
    expect(body).toHaveProperty('token');
  });

  it('GET /auth/me returns user', async () => {
    const res = await server.inject({ method: 'GET', url: '/auth/me' });
    expect(res.statusCode).toBe(200);
    const body = res.json() as any;
    expect(body).toHaveProperty('id');
  });
});
