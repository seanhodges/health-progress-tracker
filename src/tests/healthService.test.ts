import { HealthService } from '../backend/services/healthService';
import { Database, HealthEntry } from '../backend/database/connection';

// Mock the database
jest.mock('../backend/database/connection');

describe('HealthService', () => {
  let healthService: HealthService;
  let mockDatabase: jest.Mocked<Database>;

  beforeEach(() => {
    mockDatabase = new Database() as jest.Mocked<Database>;
    healthService = new HealthService(mockDatabase);
  });

  describe('saveEntry', () => {
    it('should save a valid health entry', async () => {
      const entry: HealthEntry = {
        date: '2024-01-15',
        weight: 75.5,
        weightUnit: 'kg',
        waistSize: 85.0,
        waistUnit: 'cm'
      };

      mockDatabase.insertEntry.mockResolvedValue(1);

      const result = await healthService.saveEntry(entry);
      
      expect(result).toBe(1);
      expect(mockDatabase.insertEntry).toHaveBeenCalledWith(entry);
    });

    it('should throw error for invalid date format', async () => {
      const entry: HealthEntry = {
        date: '15/01/2024', // Invalid format
        weight: 75.5,
        weightUnit: 'kg',
        waistSize: 85.0,
        waistUnit: 'cm'
      };

      await expect(healthService.saveEntry(entry)).rejects.toThrow('Date must be in YYYY-MM-DD format');
    });

    it('should throw error for missing date', async () => {
      const entry: HealthEntry = {
        date: '',
        weight: 75.5,
        weightUnit: 'kg',
        waistSize: 85.0,
        waistUnit: 'cm'
      };

      await expect(healthService.saveEntry(entry)).rejects.toThrow('Date is required');
    });

    it('should throw error for invalid weight', async () => {
      const entry: HealthEntry = {
        date: '2024-01-15',
        weight: 0,
        weightUnit: 'kg',
        waistSize: 85.0,
        waistUnit: 'cm'
      };

      await expect(healthService.saveEntry(entry)).rejects.toThrow('Weight must be a positive number');
    });

    it('should throw error for invalid weight unit', async () => {
      const entry: HealthEntry = {
        date: '2024-01-15',
        weight: 75.5,
        weightUnit: 'grams' as any,
        waistSize: 85.0,
        waistUnit: 'cm'
      };

      await expect(healthService.saveEntry(entry)).rejects.toThrow('Weight unit must be kg, lbs, or st');
    });

    it('should throw error for invalid waist size', async () => {
      const entry: HealthEntry = {
        date: '2024-01-15',
        weight: 75.5,
        weightUnit: 'kg',
        waistSize: -1,
        waistUnit: 'cm'
      };

      await expect(healthService.saveEntry(entry)).rejects.toThrow('Waist size must be a positive number');
    });

    it('should throw error for invalid waist unit', async () => {
      const entry: HealthEntry = {
        date: '2024-01-15',
        weight: 75.5,
        weightUnit: 'kg',
        waistSize: 85.0,
        waistUnit: 'mm' as any
      };

      await expect(healthService.saveEntry(entry)).rejects.toThrow('Waist unit must be cm or inches');
    });

    it('should validate reasonable weight ranges - kg', async () => {
      const entry: HealthEntry = {
        date: '2024-01-15',
        weight: 10, // Too low
        weightUnit: 'kg',
        waistSize: 85.0,
        waistUnit: 'cm'
      };

      await expect(healthService.saveEntry(entry)).rejects.toThrow('Weight must be between 20 and 500 kg');
    });

    it('should validate reasonable weight ranges - lbs', async () => {
      const entry: HealthEntry = {
        date: '2024-01-15',
        weight: 30, // Too low in lbs
        weightUnit: 'lbs',
        waistSize: 85.0,
        waistUnit: 'cm'
      };

      await expect(healthService.saveEntry(entry)).rejects.toThrow('Weight must be between 44 and 1100 lbs');
    });

    it('should validate reasonable waist ranges - cm', async () => {
      const entry: HealthEntry = {
        date: '2024-01-15',
        weight: 75.5,
        weightUnit: 'kg',
        waistSize: 30, // Too low
        waistUnit: 'cm'
      };

      await expect(healthService.saveEntry(entry)).rejects.toThrow('Waist size must be between 40 and 200 cm');
    });

    it('should validate reasonable waist ranges - inches', async () => {
      const entry: HealthEntry = {
        date: '2024-01-15',
        weight: 75.5,
        weightUnit: 'kg',
        waistSize: 10, // Too low
        waistUnit: 'inches'
      };

      await expect(healthService.saveEntry(entry)).rejects.toThrow('Waist size must be between 16 and 79 inches');
    });
  });

  describe('getHistoryEntries', () => {
    it('should retrieve history entries with default units', async () => {
      const mockEntries: HealthEntry[] = [
        {
          id: 1,
          date: '2024-01-15',
          weight: 75.5,
          weightUnit: 'kg',
          waistSize: 85.0,
          waistUnit: 'cm'
        }
      ];

      mockDatabase.getEntries.mockResolvedValue(mockEntries);

      const result = await healthService.getHistoryEntries();

      expect(result).toEqual(mockEntries);
      expect(mockDatabase.getEntries).toHaveBeenCalledWith(undefined, undefined, 'kg', 'cm');
    });

    it('should retrieve history entries with specified units and date range', async () => {
      const mockEntries: HealthEntry[] = [];
      mockDatabase.getEntries.mockResolvedValue(mockEntries);

      await healthService.getHistoryEntries('2024-01-01', '2024-01-31', 'lbs', 'inches');

      expect(mockDatabase.getEntries).toHaveBeenCalledWith('2024-01-01', '2024-01-31', 'lbs', 'inches');
    });
  });

  describe('getChartData', () => {
    it('should retrieve chart data in standard units', async () => {
      const mockEntries = [
        {
          id: 1,
          date: '2024-01-15',
          weight: 75.5,
          waist: 85.0
        }
      ];

      mockDatabase.getEntriesStandardUnits.mockResolvedValue(mockEntries);

      const result = await healthService.getChartData();

      expect(result).toEqual(mockEntries);
      expect(mockDatabase.getEntriesStandardUnits).toHaveBeenCalledWith(undefined, undefined);
    });

    it('should retrieve chart data with date filtering', async () => {
      const mockEntries: any[] = [];
      mockDatabase.getEntriesStandardUnits.mockResolvedValue(mockEntries);

      await healthService.getChartData('2024-01-01', '2024-01-31');

      expect(mockDatabase.getEntriesStandardUnits).toHaveBeenCalledWith('2024-01-01', '2024-01-31');
    });
  });
});