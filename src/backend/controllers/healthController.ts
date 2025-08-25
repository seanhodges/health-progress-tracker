import { Request, Response } from 'express';
import { HealthService } from '../services/healthService';
import { ChartService } from '../services/chartService';

export class HealthController {
  private healthService: HealthService;
  private chartService: ChartService;

  constructor(healthService: HealthService, chartService: ChartService) {
    this.healthService = healthService;
    this.chartService = chartService;
  }

  // POST /api/entries - Save a new health entry
  async saveEntry(req: Request, res: Response): Promise<void> {
    try {
      const { date, weight, weightUnit, waistSize, waistUnit } = req.body;

      const entry = {
        date,
        weight: parseFloat(weight),
        weightUnit,
        waistSize: parseFloat(waistSize),
        waistUnit
      };

      const id = await this.healthService.saveEntry(entry);
      
      res.status(201).json({
        success: true,
        message: 'Entry saved successfully',
        id
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(400).json({
        success: false,
        message: errorMessage
      });
    }
  }

  // GET /api/entries - Get health entries with optional date filtering
  async getEntries(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate, weightUnit = 'kg', waistUnit = 'cm' } = req.query;

      const entries = await this.healthService.getHistoryEntries(
        startDate as string,
        endDate as string,
        weightUnit as 'kg' | 'lbs',
        waistUnit as 'cm' | 'inches'
      );

      res.json({
        success: true,
        data: entries
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  }

  // GET /api/chart - Get chart HTML with optional filtering
  async getChart(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate, measurementFilter = 'all' } = req.query;

      // Get data in standard units for charting
      const data = await this.healthService.getChartData(
        startDate as string,
        endDate as string
      );

      const chartHtml = await this.chartService.generateChart(
        data,
        measurementFilter as 'weight' | 'waist' | 'all'
      );

      res.json({
        success: true,
        chartHtml,
        dataPoints: data.length
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  }

  // GET /api/health - Health check endpoint
  async healthCheck(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      message: 'Health Progress Tracker API is running',
      timestamp: new Date().toISOString()
    });
  }
}