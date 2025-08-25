import { Database, HealthEntry, StoredHealthEntry } from '../database/connection';

export class HealthService {
  private database: Database;

  constructor(database: Database) {
    this.database = database;
  }

  async saveEntry(entry: HealthEntry): Promise<number> {
    // Validate input data
    this.validateHealthEntry(entry);
    
    return await this.database.insertEntry(entry);
  }

  async getHistoryEntries(startDate?: string, endDate?: string, weightUnit: 'kg' | 'lbs' = 'kg', waistUnit: 'cm' | 'inches' = 'cm'): Promise<HealthEntry[]> {
    return await this.database.getEntries(startDate, endDate, weightUnit, waistUnit);
  }

  async getChartData(startDate?: string, endDate?: string): Promise<StoredHealthEntry[]> {
    // Always return data in standard units (kg and cm) for consistent charting
    return await this.database.getEntriesStandardUnits(startDate, endDate);
  }

  private validateHealthEntry(entry: HealthEntry): void {
    if (!entry.date) {
      throw new Error('Date is required');
    }

    if (!entry.weight || entry.weight <= 0) {
      throw new Error('Weight must be a positive number');
    }

    if (!['kg', 'lbs'].includes(entry.weightUnit)) {
      throw new Error('Weight unit must be kg or lbs');
    }

    if (!entry.waistSize || entry.waistSize <= 0) {
      throw new Error('Waist size must be a positive number');
    }

    if (!['cm', 'inches'].includes(entry.waistUnit)) {
      throw new Error('Waist unit must be cm or inches');
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(entry.date)) {
      throw new Error('Date must be in YYYY-MM-DD format');
    }

    // Validate reasonable ranges
    const maxWeight = entry.weightUnit === 'kg' ? 500 : 1100; // 500kg or 1100lbs
    const minWeight = entry.weightUnit === 'kg' ? 20 : 44; // 20kg or 44lbs
    
    if (entry.weight > maxWeight || entry.weight < minWeight) {
      throw new Error(`Weight must be between ${minWeight} and ${maxWeight} ${entry.weightUnit}`);
    }

    const maxWaist = entry.waistUnit === 'cm' ? 200 : 79; // 200cm or 79 inches
    const minWaist = entry.waistUnit === 'cm' ? 40 : 16; // 40cm or 16 inches
    
    if (entry.waistSize > maxWaist || entry.waistSize < minWaist) {
      throw new Error(`Waist size must be between ${minWaist} and ${maxWaist} ${entry.waistUnit}`);
    }
  }
}