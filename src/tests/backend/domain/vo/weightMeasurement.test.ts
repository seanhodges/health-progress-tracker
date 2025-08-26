import { WeightMeasurement } from '../../../../backend/domain/vo/weightMeasurement';
import { WeightUnit } from '../../../../backend/domain/vo/weightUnit';
import { DomainError } from '../../../../backend/domain/errors/domainError';

describe('WeightMeasurement', () => {
  describe('Valid measurements', () => {
    it('should create weight measurement in kg', () => {
      const unit = new WeightUnit('kg');
      const measurement = new WeightMeasurement(75, unit);
      
      expect(measurement.getValue()).toBe(75);
      expect(measurement.getUnit().getValue()).toBe('kg');
    });

    it('should create weight measurement in lbs', () => {
      const unit = new WeightUnit('lbs');
      const measurement = new WeightMeasurement(165, unit);
      
      expect(measurement.getValue()).toBe(165);
      expect(measurement.getUnit().getValue()).toBe('lbs');
    });

    it('should create weight measurement in st', () => {
      const unit = new WeightUnit('st');
      const measurement = new WeightMeasurement(12, unit);
      
      expect(measurement.getValue()).toBe(12);
      expect(measurement.getUnit().getValue()).toBe('st');
    });
  });

  describe('Invalid measurements', () => {
    it('should throw error for negative weight', () => {
      const unit = new WeightUnit('kg');
      expect(() => new WeightMeasurement(-1, unit)).toThrow(DomainError);
      expect(() => new WeightMeasurement(-1, unit)).toThrow('Weight must be a positive number');
    });

    it('should throw error for zero weight', () => {
      const unit = new WeightUnit('kg');
      expect(() => new WeightMeasurement(0, unit)).toThrow(DomainError);
    });

    it('should throw error for weight below minimum in kg', () => {
      const unit = new WeightUnit('kg');
      expect(() => new WeightMeasurement(19, unit)).toThrow(DomainError);
      expect(() => new WeightMeasurement(19, unit)).toThrow('Weight must be between 20 and 500 kg');
    });

    it('should throw error for weight above maximum in kg', () => {
      const unit = new WeightUnit('kg');
      expect(() => new WeightMeasurement(501, unit)).toThrow(DomainError);
    });

    it('should throw error for weight below minimum in lbs', () => {
      const unit = new WeightUnit('lbs');
      expect(() => new WeightMeasurement(43, unit)).toThrow(DomainError);
      expect(() => new WeightMeasurement(43, unit)).toThrow('Weight must be between 44 and 1100 lbs');
    });

    it('should throw error for weight above maximum in lbs', () => {
      const unit = new WeightUnit('lbs');
      expect(() => new WeightMeasurement(1101, unit)).toThrow(DomainError);
    });

    it('should throw error for weight below minimum in st', () => {
      const unit = new WeightUnit('st');
      expect(() => new WeightMeasurement(2, unit)).toThrow(DomainError);
      expect(() => new WeightMeasurement(2, unit)).toThrow('Weight must be between 3 and 79 st');
    });

    it('should throw error for weight above maximum in st', () => {
      const unit = new WeightUnit('st');
      expect(() => new WeightMeasurement(80, unit)).toThrow(DomainError);
    });
  });

  describe('Equality', () => {
    it('should return true for equal measurements', () => {
      const unit1 = new WeightUnit('kg');
      const unit2 = new WeightUnit('kg');
      const measurement1 = new WeightMeasurement(75, unit1);
      const measurement2 = new WeightMeasurement(75, unit2);
      
      expect(measurement1.equals(measurement2)).toBe(true);
    });

    it('should return false for different values', () => {
      const unit1 = new WeightUnit('kg');
      const unit2 = new WeightUnit('kg');
      const measurement1 = new WeightMeasurement(75, unit1);
      const measurement2 = new WeightMeasurement(80, unit2);
      
      expect(measurement1.equals(measurement2)).toBe(false);
    });

    it('should return false for different units', () => {
      const unit1 = new WeightUnit('kg');
      const unit2 = new WeightUnit('lbs');
      const measurement1 = new WeightMeasurement(75, unit1);
      const measurement2 = new WeightMeasurement(75, unit2);
      
      expect(measurement1.equals(measurement2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      const unit = new WeightUnit('kg');
      const measurement = new WeightMeasurement(75, unit);
      
      expect(measurement.toString()).toBe('75 kg');
    });
  });

  describe('Static factory method', () => {
    it('should create measurement using create method', () => {
      const measurement = WeightMeasurement.create(165, 'lbs');
      
      expect(measurement.getValue()).toBe(165);
      expect(measurement.getUnit().getValue()).toBe('lbs');
    });
  });
});