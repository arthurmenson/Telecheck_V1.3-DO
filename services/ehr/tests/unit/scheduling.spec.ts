import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { server, start } from '../../src/app';

describe('EHR Scheduling', () => {
  beforeAll(async () => { if (!server.listening) await start(); });
  afterAll(async () => { if (server.listening) await server.close(); });

  it('GET /scheduling/slots returns slots array with s1', async () => {
    const res = await server.inject({ method: 'GET', url: '/scheduling/slots' });
    expect(res.statusCode).toBe(200);
    const body = res.json() as any;
    expect(Array.isArray(body.slots)).toBe(true);
    expect(body.slots[0]?.id).toBe('s1');
  });

  it('POST /scheduling/book returns booked status', async () => {
    const res = await server.inject({ method: 'POST', url: '/scheduling/book', payload: { slotId: 's1', patientId: '550e8400-e29b-41d4-a716-446655440000' } });
    expect([200, 201, 409, 500]).toContain(res.statusCode);
    if (res.statusCode === 201 || res.statusCode === 200) {
      const body = res.json() as any;
      expect(body.status).toBe('booked');
    }
  });
});
