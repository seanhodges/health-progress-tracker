import { HealthApplicationService } from '../../../../backend/application/services/healthApplicationService';
import { IHealthEntryRepository } from '../../../../backend/infrastructure/repositories/healthEntryRepository';
import { HealthEntry as DomainHealthEntry } from '../../../../backend/domain/model/healthEntry';
import { WeightMeasurement } from '../../../../backend/domain/vo/weightMeasurement';
import { WaistMeasurement } from '../../../../backend/domain/vo/waistMeasurement';
import { HealthEntry as DatabaseHealthEntry, StoredHealthEntry } from '../../../../backend/infrastructure/database/connection';

// Mock the repository
const mockRepository: jest.Mocked<IHealthEntryRepository> = {
  save: jest.fn(),
  findByDateRange: jest.fn(),
  findStandardUnits: jest.fn(),
  deleteByDate: jest.fn(),
};

describe('HealthApplicationService', () => {
  let healthService: HealthApplicationService;

  beforeEach(() => {
    jest.clearAllMocks();
    healthService = new HealthApplicationService(mockRepository);
  });

  describe('saveEntry', () => {
    it('should save a valid health entry', async () => {
      const entry: DatabaseHealthEntry = {
        date: '2024-01-15',
        weight: 75.5,
        weightUnit: 'kg',
        waistSize: 85.0,
        waistUnit: 'cm'
      };

      mockRepository.save.mockResolvedValue(1);

      const result = await healthService.saveEntry(entry);
      
      expect(result).toBe(1);
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.any(DomainHealthEntry)
      );
    });

    it('should throw error for invalid date format', async () => {
      const entry: DatabaseHealthEntry = {
        date: '15/01/2024', // Invalid format
        weight: 75.5,
        weightUnit: 'kg',
        waistSize: 85.0,
        waistUnit: 'cm'
      };

      await expect(healthService.saveEntry(entry)).rejects.toThrow('Date must be in YYYY-MM-DD format');
    });

    it('should throw error for missing date', async () => {
      const entry: DatabaseHealthEntry = {
        date: '',
        weight: 75.5,
        weightUnit: 'kg',
        waistSize: 85.0,
        waistUnit: 'cm'
      };

      await expect(healthService.saveEntry(entry)).rejects.toThrow('Date must be in YYYY-MM-DD format');
    });

    it('should throw error for invalid weight', async () => {
      const entry: DatabaseHealthEntry = {
        date: '2024-01-15',
        weight: 0,
        weightUnit: 'kg',
        waistSize: 85.0,
        waistUnit: 'cm'
      };

      await expect(healthService.saveEntry(entry)).rejects.toThrow('Weight must be a positive number');
    });

    it('should throw error for invalid weight unit', async () => {
      const entry: DatabaseHealthEntry = {
        date: '2024-01-15',
        weight: 75.5,
        weightUnit: 'grams' as any,
        waistSize: 85.0,
        waistUnit: 'cm'
      };

      await expect(healthService.saveEntry(entry)).rejects.toThrow('Invalid weight unit: grams. Must be one of: kg, lbs, st');
    });

    it('should throw error for invalid waist size', async () => {
      const entry: DatabaseHealthEntry = {
        date: '2024-01-15',
        weight: 75.5,
        weightUnit: 'kg',
        waistSize: -1,
        waistUnit: 'cm'
      };

      await expect(healthService.saveEntry(entry)).rejects.toThrow('Waist size must be a positive number');
    });

    it('should throw error for invalid waist unit', async () => {
      const entry: DatabaseHealthEntry = {
        date: '2024-01-15',
        weight: 75.5,
        weightUnit: 'kg',
        waistSize: 85.0,
        waistUnit: 'mm' as any
      };

      await expect(healthService.saveEntry(entry)).rejects.toThrow('Invalid waist unit: mm. Must be one of: cm, inches');
    });

    it('should validate reasonable weight ranges - kg', async () => {
      const entry: DatabaseHealthEntry = {
        date: '2024-01-15',
        weight: 10, // Too low
        weightUnit: 'kg',
        waistSize: 85.0,
        waistUnit: 'cm'
      };

      await expect(healthService.saveEntry(entry)).rejects.toThrow('Weight must be between 20 and 500 kg');
    });

    it('should validate reasonable weight ranges - lbs', async () => {
      const entry: DatabaseHealthEntry = {
        date: '2024-01-15',
        weight: 30, // Too low in lbs
        weightUnit: 'lbs',
        waistSize: 85.0,
        waistUnit: 'cm'
      };

      await expect(healthService.saveEntry(entry)).rejects.toThrow('Weight must be between 44 and 1100 lbs');
    });

    it('should validate reasonable waist ranges - cm', async () => {
      const entry: DatabaseHealthEntry = {
        date: '2024-01-15',
        weight: 75.5,
        weightUnit: 'kg',
        waistSize: 30, // Too low
        waistUnit: 'cm'
      };

      await expect(healthService.saveEntry(entry)).rejects.toThrow('Waist size must be between 40 and 200 cm');
    });

    it('should validate reasonable waist ranges - inches', async () => {
      const entry: DatabaseHealthEntry = {
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
      const weight = WeightMeasurement.create(75.5, 'kg');
      const waist = WaistMeasurement.create(85.0, 'cm');
      const domainEntry = DomainHealthEntry.reconstitute(1, '2024-01-15', weight, waist);
      const mockEntries: DomainHealthEntry[] = [domainEntry];

      mockRepository.findByDateRange.mockResolvedValue(mockEntries);

      const result = await healthService.getHistoryEntries();

      expect(result).toEqual([{
        id: 1,
        date: '2024-01-15',
        weight: 75.5,
        weightUnit: 'kg',
        waistSize: 85.0,
        waistUnit: 'cm',
        createdAt: undefined
      }]);
      expect(mockRepository.findByDateRange).toHaveBeenCalledWith(undefined, undefined, 'kg', 'cm');
    });

    it('should retrieve history entries with specified units and date range', async () => {
      const mockEntries: DomainHealthEntry[] = [];
      mockRepository.findByDateRange.mockResolvedValue(mockEntries);

      await healthService.getHistoryEntries('2024-01-01', '2024-01-31', 'lbs', 'inches');

      expect(mockRepository.findByDateRange).toHaveBeenCalledWith('2024-01-01', '2024-01-31', 'lbs', 'inches');
    });
  });

  describe('getChartData', () => {
    it('should retrieve chart data in standard units', async () => {
      const mockEntries: StoredHealthEntry[] = [
        {
          id: 1,
          date: '2024-01-15',
          weight: 75.5,
          waist: 85.0
        }
      ];

      mockRepository.findStandardUnits.mockResolvedValue(mockEntries);

      const result = await healthService.getChartData();

      expect(result).toEqual(mockEntries);
      expect(mockRepository.findStandardUnits).toHaveBeenCalledWith(undefined, undefined);
    });

    it('should retrieve chart data with date filtering', async () => {
      const mockEntries: StoredHealthEntry[] = [];
      mockRepository.findStandardUnits.mockResolvedValue(mockEntries);

      await healthService.getChartData('2024-01-01', '2024-01-31');

      expect(mockRepository.findStandardUnits).toHaveBeenCalledWith('2024-01-01', '2024-01-31');
    });
  });
});