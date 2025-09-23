import { describe, it, expect } from 'vitest';
import { server } from '../../src/app';

describe('eRx service endpoints', () => {
  it('creates a prescription', async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/erx/prescriptions',
      payload: { patientId: 'p1', medication: { text: 'Amoxicillin 500mg' } }
    });
    expect(res.statusCode).toBe(201);
    const body = res.json() as any;
    expect(body.success).toBe(true);
    expect(body.data?.id).toBeTruthy();
  });

  it('gets a prescription by id', async () => {
    const created = await server.inject({
      method: 'POST',
      url: '/erx/prescriptions',
      payload: { patientId: 'p2', medication: { text: 'Lipitor' } }
    });
    const id = (created.json() as any).data.id;

    const res = await server.inject({ method: 'GET', url: `/erx/prescriptions/${id}` });
    expect(res.statusCode).toBe(200);
    const body = res.json() as any;
    expect(body.success).toBe(true);
    expect(body.data?.id).toBe(id);
  });

  it('cancels a prescription', async () => {
    const created = await server.inject({
      method: 'POST',
      url: '/erx/prescriptions',
      payload: { patientId: 'p3', medication: { text: 'Warfarin' } }
    });
    const id = (created.json() as any).data.id;

    const res = await server.inject({ method: 'POST', url: `/erx/prescriptions/${id}/cancel` });
    const body = res.json() as any;
    expect(res.statusCode).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data?.status).toBe('stopped');
  });

  it('requests a refill', async () => {
    const created = await server.inject({
      method: 'POST',
      url: '/erx/prescriptions',
      payload: { patientId: 'p4', medication: { text: 'Metformin' } }
    });
    const id = (created.json() as any).data.id;

    const res = await server.inject({ method: 'POST', url: `/erx/prescriptions/${id}/refill` });
    const body = res.json() as any;
    expect(res.statusCode).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data?.refillRequested).toBe(true);
  });

  it('verifies EPCS otp', async () => {
    const res = await server.inject({ method: 'POST', url: '/erx/epcs/verify', payload: { otp: '123456' } });
    const body = res.json() as any;
    expect(res.statusCode).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data?.verified).toBe(true);
  });

  it('returns medication history', async () => {
    const res = await server.inject({ method: 'GET', url: '/erx/history/p5' });
    const body = res.json() as any;
    expect(res.statusCode).toBe(200);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });
});

import { describe, it, expect } from 'vitest';

describe('eRx service', () => {
  it('creates a prescription payload shape', () => {
    const payload = {
      patientId: 'p1',
      medication: { code: 'rxnorm:123', text: 'Drug' },
      dosageInstruction: { doseAndRate: [{ doseQuantity: { value: 1, unit: 'tab' } }] }
    };
    expect(payload.patientId).toBe('p1');
    expect(payload.medication).toBeDefined();
  });
});


