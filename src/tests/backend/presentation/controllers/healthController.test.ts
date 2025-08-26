import request from 'supertest';
import express from 'express';
import { HealthController } from '../../../../backend/presentation/controllers/healthController';
import { HealthApplicationService } from '../../../../backend/application/services/healthApplicationService';
import { ChartService } from '../../../../backend/application/services/chartService';
import { createHealthRoutes } from '../../../../backend/presentation/routes/healthRoutes';
import { DomainError, ValidationError } from '../../../../backend/domain/errors/domainError';

// Mock the services
jest.mock('../../../../backend/application/services/healthApplicationService');
jest.mock('../../../../backend/application/services/chartService');

describe('HealthController', () => {
  let app: express.Application;
  let mockHealthApplicationService: jest.Mocked<HealthApplicationService>;
  let mockChartService: jest.Mocked<ChartService>;

  beforeEach(() => {
    mockHealthApplicationService = new HealthApplicationService({} as any) as jest.Mocked<HealthApplicationService>;
    mockChartService = new ChartService() as jest.Mocked<ChartService>;
    
    const healthController = new HealthController(mockHealthApplicationService, mockChartService);
    
    app = express();
    app.use(express.json());
    app.use('/api', createHealthRoutes(healthController));
  });

  describe('POST /api/entries', () => {
    it('should save a valid health entry', async () => {
      const entry = {
        date: '2024-01-15',
        weight: 75.5,
        weightUnit: 'kg',
        waistSize: 85.0,
        waistUnit: 'cm'
      };

      mockHealthApplicationService.saveEntry.mockResolvedValue(1);

      const response = await request(app)
        .post('/api/entries')
        .send(entry);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        message: 'Entry saved successfully',
        id: 1
      });
      expect(mockHealthApplicationService.saveEntry).toHaveBeenCalledWith({
        ...entry,
        weight: 75.5,
        waistSize: 85.0
      });
    });

    it('should return error for invalid entry', async () => {
      const entry = {
        date: '2024-01-15',
        weight: -1, // Invalid weight
        weightUnit: 'kg',
        waistSize: 85.0,
        waistUnit: 'cm'
      };

      mockHealthApplicationService.saveEntry.mockRejectedValue(new ValidationError('Weight must be a positive number'));

      const response = await request(app)
        .post('/api/entries')
        .send(entry);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: 'Weight must be a positive number'
      });
    });

    it('should handle service errors', async () => {
      const entry = {
        date: '2024-01-15',
        weight: 75.5,
        weightUnit: 'kg',
        waistSize: 85.0,
        waistUnit: 'cm'
      };

      mockHealthApplicationService.saveEntry.mockRejectedValue(new ValidationError('Database error'));

      const response = await request(app)
        .post('/api/entries')
        .send(entry);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('GET /api/entries', () => {
    it('should retrieve entries with default parameters', async () => {
      const mockEntries = [
        {
          id: 1,
          date: '2024-01-15',
          weight: 75.5,
          weightUnit: 'kg' as 'kg' | 'lbs' | 'st',
          waistSize: 85.0,
          waistUnit: 'cm' as 'cm' | 'inches'
        }
      ];

      mockHealthApplicationService.getHistoryEntries.mockResolvedValue(mockEntries);

      const response = await request(app)
        .get('/api/entries');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockEntries
      });
      expect(mockHealthApplicationService.getHistoryEntries).toHaveBeenCalledWith(
        undefined,
        undefined,
        'kg',
        'cm'
      );
    });

    it('should retrieve entries with query parameters', async () => {
      const mockEntries: any[] = [];
      mockHealthApplicationService.getHistoryEntries.mockResolvedValue(mockEntries);

      const response = await request(app)
        .get('/api/entries')
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          weightUnit: 'lbs',
          waistUnit: 'inches'
        });

      expect(response.status).toBe(200);
      expect(mockHealthApplicationService.getHistoryEntries).toHaveBeenCalledWith(
        '2024-01-01',
        '2024-01-31',
        'lbs',
        'inches'
      );
    });

    it('should handle service errors', async () => {
      mockHealthApplicationService.getHistoryEntries.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/api/entries');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Database connection failed'
      });
    });
  });

  describe('GET /api/chart', () => {
    it('should generate chart with default parameters', async () => {
      const mockData = [
        {
          id: 1,
          date: '2024-01-15',
          weight: 75.5,
          waist: 85.0
        }
      ];
      const mockChartHtml = '<script>Plotly.newPlot("chart", ...);</script>';

      mockHealthApplicationService.getChartData.mockResolvedValue(mockData);
      mockChartService.generateChart.mockResolvedValue(mockChartHtml);

      const response = await request(app)
        .get('/api/chart');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        chartHtml: mockChartHtml,
        dataPoints: 1
      });
      expect(mockHealthApplicationService.getChartData).toHaveBeenCalledWith(undefined, undefined);
      expect(mockChartService.generateChart).toHaveBeenCalledWith(mockData, 'all', 'kg', 'cm');
    });

    it('should generate chart with query parameters', async () => {
      const mockData: any[] = [];
      const mockChartHtml = '<script>empty chart</script>';

      mockHealthApplicationService.getChartData.mockResolvedValue(mockData);
      mockChartService.generateChart.mockResolvedValue(mockChartHtml);

      const response = await request(app)
        .get('/api/chart')
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          measurementFilter: 'weight'
        });

      expect(response.status).toBe(200);
      expect(mockHealthApplicationService.getChartData).toHaveBeenCalledWith('2024-01-01', '2024-01-31');
      expect(mockChartService.generateChart).toHaveBeenCalledWith(mockData, 'weight', 'kg', 'cm');
    });

    it('should handle chart service errors', async () => {
      mockHealthApplicationService.getChartData.mockRejectedValue(new Error('Chart generation failed'));

      const response = await request(app)
        .get('/api/chart');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Chart generation failed'
      });
    });
  });

  describe('GET /api/health', () => {
    it('should return health check', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        message: 'Health Progress Tracker API is running'
      });
      expect(response.body.timestamp).toBeDefined();
    });
  });
});