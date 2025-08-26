import { HealthEntry } from '../../../../backend/domain/model/healthEntry';
import { WeightMeasurement } from '../../../../backend/domain/vo/weightMeasurement';
import { WaistMeasurement } from '../../../../backend/domain/vo/waistMeasurement';
import { DomainError } from '../../../../backend/domain/errors/domainError';

describe('HealthEntry', () => {
  let validWeight: WeightMeasurement;
  let validWaist: WaistMeasurement;
  let validDate: string;

  beforeEach(() => {
    validWeight = WeightMeasurement.create(75, 'kg');
    validWaist = WaistMeasurement.create(85, 'cm');
    validDate = '2024-01-15';
  });

  describe('Valid entry creation', () => {
    it('should create health entry with valid data', () => {
      const entry = HealthEntry.create(validDate, validWeight, validWaist);
      
      expect(entry.getDate()).toBe(validDate);
      expect(entry.getWeight()).toBe(validWeight);
      expect(entry.getWaist()).toBe(validWaist);
      expect(entry.getId()).toBeUndefined();
    });

    it('should reconstitute health entry with ID', () => {
      const entry = HealthEntry.reconstitute(1, validDate, validWeight, validWaist, '2024-01-15T10:00:00Z');
      
      expect(entry.getId()).toBe(1);
      expect(entry.getDate()).toBe(validDate);
      expect(entry.getCreatedAt()).toBe('2024-01-15T10:00:00Z');
    });
  });

  describe('Date validation', () => {
    it('should throw error for invalid date format', () => {
      expect(() => HealthEntry.create('invalid-date', validWeight, validWaist))
        .toThrow(DomainError);
      expect(() => HealthEntry.create('invalid-date', validWeight, validWaist))
        .toThrow('Date must be in YYYY-MM-DD format');
    });

    it('should throw error for future date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];
      
      expect(() => HealthEntry.create(futureDateString, validWeight, validWaist))
        .toThrow(DomainError);
      expect(() => HealthEntry.create(futureDateString, validWeight, validWaist))
        .toThrow('Entry date cannot be in the future');
    });

    it('should accept today\'s date', () => {
      const today = new Date().toISOString().split('T')[0];
      
      expect(() => HealthEntry.create(today, validWeight, validWaist))
        .not.toThrow();
    });

    it('should accept past dates', () => {
      const pastDate = '2023-01-01';
      
      expect(() => HealthEntry.create(pastDate, validWeight, validWaist))
        .not.toThrow();
    });
  });

  describe('toPlainObject', () => {
    it('should convert to plain object for persistence', () => {
      const entry = HealthEntry.create(validDate, validWeight, validWaist);
      const plainObject = entry.toPlainObject();
      
      expect(plainObject).toEqual({
        id: undefined,
        date: validDate,
        weight: 75,
        weightUnit: 'kg',
        waistSize: 85,
        waistUnit: 'cm',
        createdAt: undefined
      });
    });

    it('should convert reconstituted entry to plain object', () => {
      const entry = HealthEntry.reconstitute(1, validDate, validWeight, validWaist, '2024-01-15T10:00:00Z');
      const plainObject = entry.toPlainObject();
      
      expect(plainObject).toEqual({
        id: 1,
        date: validDate,
        weight: 75,
        weightUnit: 'kg',
        waistSize: 85,
        waistUnit: 'cm',
        createdAt: '2024-01-15T10:00:00Z'
      });
    });
  });
});