import { describe, it, expect, beforeEach } from 'vitest'
import express from 'express'
import healthRoutes from '../../server/routes/health'
import request from 'supertest'

describe('Health endpoint', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'production'
  })

  it('returns minimal payload in production', async () => {
    const app = express()
    app.use('/api', healthRoutes as any)
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })
})


