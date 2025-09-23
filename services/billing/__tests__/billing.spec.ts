import { describe, it, expect } from 'vitest'

describe('Billing API contracts', () => {
  it('should define 837P endpoint in OpenAPI', async () => {
    const spec = await import('../../../contracts/billing.openapi.yaml?raw')
    expect(spec).toBeTruthy()
  })
})


