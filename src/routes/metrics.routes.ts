/**
 * Metrics Routes
 *
 * GET  /metrics           — Prometheus-compatible text format (for scrapers)
 * GET  /metrics/json      — Full JSON snapshot (for admin dashboards)
 * POST /metrics/persist   — Force-persist snapshot to DB (admin-only)
 */

import { Router, Request, Response, NextFunction } from 'express';
import {
  getMetricsSnapshot,
  getPrometheusMetrics,
  persistMetrics,
} from '../services/metrics.service.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/errors.js';

const router = Router();

/**
 * Restrict Prometheus scrape endpoint to configured IP allowlist
 * or require a Bearer token via the standard auth middleware.
 */
const metricsAuth = (req: Request, res: Response, next: NextFunction): void => {
  const allowedIps = (process.env.METRICS_ALLOWED_IPS || '')
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean);

  // If an allowlist is configured, check the caller's IP
  if (allowedIps.length > 0) {
    const clientIp = req.ip || req.socket.remoteAddress || '';
    if (
      allowedIps.includes(clientIp) ||
      (allowedIps.includes('127.0.0.1') && (clientIp === '::1' || clientIp === '127.0.0.1'))
    ) {
      next();
      return;
    }
  }

  // Fall back to standard Bearer-token auth
  authenticate(req, res, next);
};

// Prometheus-style text output — IP-allowlisted or authenticated
router.get('/', metricsAuth, (_req, res) => {
  res.set('Content-Type', 'text/plain; charset=utf-8');
  res.send(getPrometheusMetrics());
});

// JSON snapshot — admin only
router.get('/json', authenticate, requireRole('admin'), (_req, res) => {
  res.json(getMetricsSnapshot());
});

// Manual persist — admin only
router.post(
  '/persist',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (_req, res) => {
    await persistMetrics();
    res.json({ status: 'persisted' });
  })
);

export default router;
