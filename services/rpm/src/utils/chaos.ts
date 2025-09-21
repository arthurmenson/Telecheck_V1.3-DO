/**
 * Chaos engineering utilities for RPM service testing
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
 * Simulate RPM device connection issues
 */
export function simulateDeviceChaos(): boolean {
  return process.env.CHAOS_MODE === 'true' && Math.random() < 0.1;
}

/**
 * Simulate alert notification failures
 */
export function simulateNotificationChaos(): boolean {
  return process.env.CHAOS_MODE === 'true' && Math.random() < 0.05;
}

/**
 * Simulate threshold calculation errors
 */
export function simulateThresholdChaos(): boolean {
  return process.env.CHAOS_MODE === 'true' && Math.random() < 0.02;
}
