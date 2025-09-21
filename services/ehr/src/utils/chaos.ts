/**
 * Chaos engineering utilities for testing error scenarios
 */

import { FastifyReply } from 'fastify';

/**
 * Check if chaos mode is enabled
 */
export function isChaosMode(query: any): boolean {
  return query?.chaos === '1';
}

/**
 * Simulate chaos error with random status codes
 */
export function simulateChaosError(reply: FastifyReply): void {
  const shouldError = Math.random() < 0.5;
  const statusCode = shouldError ? 500 : 401;
  
  reply.status(statusCode).send({
    success: false,
    message: 'chaos',
    error: 'Chaos mode error simulation'
  });
}

/**
 * Simulate random delays for chaos testing
 */
export async function simulateRandomDelay(): Promise<void> {
  if (process.env.NODE_ENV === 'test' || process.env.CHAOS_MODE === 'true') {
    const delay = Math.random() * 1000; // 0-1000ms delay
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

/**
 * Simulate database connection issues
 */
export function simulateDatabaseChaos(): Error | null {
  if (process.env.CHAOS_MODE === 'true' && Math.random() < 0.1) {
    return new Error('Database connection timeout');
  }
  return null;
}

/**
 * Simulate memory pressure
 */
export function simulateMemoryPressure(): void {
  if (process.env.CHAOS_MODE === 'true' && Math.random() < 0.05) {
    // Simulate high memory usage briefly
    const largeArray = new Array(1000000).fill('chaos');
    setTimeout(() => {
      largeArray.length = 0;
    }, 100);
  }
}
