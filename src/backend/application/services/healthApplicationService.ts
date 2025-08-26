import { HealthEntry } from '../../domain/model/healthEntry';
import { WeightMeasurement } from '../../domain/vo/weightMeasurement';
import { WaistMeasurement } from '../../domain/vo/waistMeasurement';
import { WeightUnitType } from '../../domain/vo/weightUnit';
import { WaistUnitType } from '../../domain/vo/waistUnit';
import { IHealthEntryRepository } from '../../infrastructure/repositories/healthEntryRepository';
import { ValidationError } from '../../domain/errors/domainError';

/**
 * Application service for health entry management
 * Orchestrates domain operations and coordinates with infrastructure
 */
export class HealthApplicationService {
  constructor(private healthEntryRepository: IHealthEntryRepository) {}

  async saveEntry(entryData: {
    date: string;
    weight: number;
    weightUnit: WeightUnitType;
    waistSize: number;
    waistUnit: WaistUnitType;
  }): Promise<number> {
    try {
      // Create domain objects with validation
      const weight = WeightMeasurement.create(entryData.weight, entryData.weightUnit);
      const waist = WaistMeasurement.create(entryData.waistSize, entryData.waistUnit);
      
      // Create health entry aggregate
      const healthEntry = HealthEntry.create(entryData.date, weight, waist);
      
      // Persist through repository
      return await this.healthEntryRepository.save(healthEntry);
    } catch (error) {
      if (error instanceof Error) {
        throw new ValidationError(error.message);
      }
      throw new ValidationError('Unknown error occurred while saving entry');
    }
  }

  async getHistoryEntries(
    startDate?: string, 
    endDate?: string, 
    weightUnit: WeightUnitType = 'kg', 
    waistUnit: WaistUnitType = 'cm'
  ): Promise<any[]> {
    try {
      const entries = await this.healthEntryRepository.findByDateRange(
        startDate, 
        endDate, 
        weightUnit, 
        waistUnit
      );
      
      // Convert domain objects to plain objects for API response
      return entries.map(entry => entry.toPlainObject());
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Unknown error occurred while retrieving entries');
    }
  }

  async getChartData(startDate?: string, endDate?: string): Promise<any[]> {
    try {
      // Get data in standard units for consistent charting
      return await this.healthEntryRepository.findStandardUnits(startDate, endDate);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Unknown error occurred while retrieving chart data');
    }
  }
}