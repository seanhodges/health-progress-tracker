import { Request, Response } from 'express';
import { HealthApplicationService } from '../../application/services/healthApplicationService';
import { ChartService } from '../../application/services/chartService';
import { DomainError, ValidationError } from '../../domain/errors/domainError';
import { WeightUnitType } from '../../domain/vo/weightUnit';
import { WaistUnitType } from '../../domain/vo/waistUnit';

/**
 * Presentation layer controller for health-related HTTP endpoints
 */
export class HealthController {
  constructor(
    private healthApplicationService: HealthApplicationService,
    private chartService: ChartService
  ) {}

  // POST /api/entries - Save a new health entry
  async saveEntry(req: Request, res: Response): Promise<void> {
    try {
      const { date, weight, weightUnit, waistSize, waistUnit } = req.body;

      // Input validation at presentation layer
      if (!date || !weight || !weightUnit || !waistSize || !waistUnit) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: date, weight, weightUnit, waistSize, waistUnit'
        });
        return;
      }

      const entry = {
        date,
        weight: parseFloat(weight),
        weightUnit: weightUnit as WeightUnitType,
        waistSize: parseFloat(waistSize),
        waistUnit: waistUnit as WaistUnitType
      };

      const id = await this.healthApplicationService.saveEntry(entry);
      
      res.status(201).json({
        success: true,
        message: 'Entry saved successfully',
        id
      });
    } catch (error) {
      if (error instanceof DomainError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({
          success: false,
          message: errorMessage
        });
      }
    }
  }

  // GET /api/entries - Get health entries with optional date filtering
  async getEntries(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate, weightUnit = 'kg', waistUnit = 'cm' } = req.query;

      const entries = await this.healthApplicationService.getHistoryEntries(
        startDate as string,
        endDate as string,
        weightUnit as WeightUnitType,
        waistUnit as WaistUnitType
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
      const { startDate, endDate, measurementFilter = 'all', weightUnit = 'kg', waistUnit = 'cm' } = req.query;

      // Get data in standard units for charting
      const data = await this.healthApplicationService.getChartData(
        startDate as string,
        endDate as string
      );

      const chartHtml = await this.chartService.generateChart(
        data,
        measurementFilter as 'weight' | 'waist' | 'all',
        weightUnit as WeightUnitType,
        waistUnit as WaistUnitType
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