import { Database } from '../database/connection';
import { HealthEntry } from '../../domain/model/healthEntry';
import { WeightMeasurement } from '../../domain/vo/weightMeasurement';
import { WaistMeasurement } from '../../domain/vo/waistMeasurement';
import { WeightUnitType } from '../../domain/vo/weightUnit';
import { WaistUnitType } from '../../domain/vo/waistUnit';
import { UnitConversionService } from '../../domain/services/unitConversionService';

/**
 * Repository interface for health entries
 */
export interface IHealthEntryRepository {
  save(entry: HealthEntry): Promise<number>;
  findByDateRange(startDate?: string, endDate?: string, weightUnit?: WeightUnitType, waistUnit?: WaistUnitType): Promise<HealthEntry[]>;
  findStandardUnits(startDate?: string, endDate?: string): Promise<any[]>;
  deleteByDate(date: string): Promise<number>;
}

/**
 * SQLite implementation of health entry repository
 */
export class HealthEntryRepository implements IHealthEntryRepository {
  private conversionService: UnitConversionService;
  
  constructor(private database: Database) {
    this.conversionService = new UnitConversionService();
  }
  
  async save(entry: HealthEntry): Promise<number> {
    const plainEntry = entry.toPlainObject();
    
    // Use the existing database method with converted values
    return await this.database.insertEntry({
      date: plainEntry.date,
      weight: plainEntry.weight,
      waistSize: plainEntry.waistSize,
      weightUnit: plainEntry.weightUnit,
      waistUnit: plainEntry.waistUnit
    });
  }
  
  async findByDateRange(
    startDate?: string, 
    endDate?: string, 
    weightUnit: WeightUnitType = 'kg', 
    waistUnit: WaistUnitType = 'cm'
  ): Promise<HealthEntry[]> {
    // Get entries from database in requested units
    const dbEntries = await this.database.getEntries(startDate, endDate, weightUnit, waistUnit);
    
    // Convert to domain objects
    return dbEntries.map(dbEntry => {
      const weight = WeightMeasurement.create(dbEntry.weight, dbEntry.weightUnit);
      const waist = WaistMeasurement.create(dbEntry.waistSize, dbEntry.waistUnit);
      
      return HealthEntry.reconstitute(
        dbEntry.id!,
        dbEntry.date,
        weight,
        waist,
        dbEntry.createdAt
      );
    });
  }
  
  async findStandardUnits(startDate?: string, endDate?: string): Promise<any[]> {
    // Return raw data for charting (already in standard units)
    return await this.database.getEntriesStandardUnits(startDate, endDate);
  }
  
  async deleteByDate(date: string): Promise<number> {
    return await this.database.deleteEntriesByDate(date);
  }
}