import { Router } from 'express';
import { HealthController } from '../controllers/healthController';

export function createHealthRoutes(healthController: HealthController): Router {
  const router = Router();

  // Health check endpoint
  router.get('/health', (req, res) => healthController.healthCheck(req, res));

  // Save new health entry
  router.post('/entries', (req, res) => healthController.saveEntry(req, res));

  // Get health entries with optional filtering
  router.get('/entries', (req, res) => healthController.getEntries(req, res));

  // Get chart data
  router.get('/chart', (req, res) => healthController.getChart(req, res));

  return router;
}