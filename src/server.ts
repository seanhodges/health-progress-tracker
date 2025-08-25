import express from 'express';
import cors from 'cors';
import path from 'path';
import { Database } from './backend/database/connection';
import { HealthService } from './backend/services/healthService';
import { ChartService } from './backend/services/chartService';
import { HealthController } from './backend/controllers/healthController';
import { createHealthRoutes } from './backend/routes/healthRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database and services
const database = new Database();
const healthService = new HealthService(database);
const chartService = new ChartService();
const healthController = new HealthController(healthService, chartService);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api', createHealthRoutes(healthController));

// Serve the main application
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Initialize database and start server
async function startServer() {
  try {
    await database.initialize();
    console.log('Database initialized successfully');

    app.listen(PORT, () => {
      console.log(`Health Progress Tracker server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await database.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await database.close();
  process.exit(0);
});

startServer();