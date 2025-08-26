import { WaistMeasurement } from '../../../../backend/domain/vo/waistMeasurement';
import { WaistUnit } from '../../../../backend/domain/vo/waistUnit';
import { DomainError } from '../../../../backend/domain/errors/domainError';

describe('WaistMeasurement', () => {
  describe('Valid measurements', () => {
    it('should create waist measurement in cm', () => {
      const unit = new WaistUnit('cm');
      const measurement = new WaistMeasurement(85, unit);
      
      expect(measurement.getValue()).toBe(85);
      expect(measurement.getUnit().getValue()).toBe('cm');
    });

    it('should create waist measurement in inches', () => {
      const unit = new WaistUnit('inches');
      const measurement = new WaistMeasurement(32, unit);
      
      expect(measurement.getValue()).toBe(32);
      expect(measurement.getUnit().getValue()).toBe('inches');
    });
  });

  describe('Invalid measurements', () => {
    it('should throw error for negative waist size', () => {
      const unit = new WaistUnit('cm');
      expect(() => new WaistMeasurement(-1, unit)).toThrow(DomainError);
      expect(() => new WaistMeasurement(-1, unit)).toThrow('Waist size must be a positive number');
    });

    it('should throw error for zero waist size', () => {
      const unit = new WaistUnit('cm');
      expect(() => new WaistMeasurement(0, unit)).toThrow(DomainError);
    });

    it('should throw error for waist size below minimum in cm', () => {
      const unit = new WaistUnit('cm');
      expect(() => new WaistMeasurement(39, unit)).toThrow(DomainError);
      expect(() => new WaistMeasurement(39, unit)).toThrow('Waist size must be between 40 and 200 cm');
    });

    it('should throw error for waist size above maximum in cm', () => {
      const unit = new WaistUnit('cm');
      expect(() => new WaistMeasurement(201, unit)).toThrow(DomainError);
    });

    it('should throw error for waist size below minimum in inches', () => {
      const unit = new WaistUnit('inches');
      expect(() => new WaistMeasurement(15, unit)).toThrow(DomainError);
      expect(() => new WaistMeasurement(15, unit)).toThrow('Waist size must be between 16 and 79 inches');
    });

    it('should throw error for waist size above maximum in inches', () => {
      const unit = new WaistUnit('inches');
      expect(() => new WaistMeasurement(80, unit)).toThrow(DomainError);
    });
  });

  describe('Equality', () => {
    it('should return true for equal measurements', () => {
      const unit1 = new WaistUnit('cm');
      const unit2 = new WaistUnit('cm');
      const measurement1 = new WaistMeasurement(85, unit1);
      const measurement2 = new WaistMeasurement(85, unit2);
      
      expect(measurement1.equals(measurement2)).toBe(true);
    });

    it('should return false for different values', () => {
      const unit1 = new WaistUnit('cm');
      const unit2 = new WaistUnit('cm');
      const measurement1 = new WaistMeasurement(85, unit1);
      const measurement2 = new WaistMeasurement(90, unit2);
      
      expect(measurement1.equals(measurement2)).toBe(false);
    });

    it('should return false for different units', () => {
      const unit1 = new WaistUnit('cm');
      const unit2 = new WaistUnit('inches');
      const measurement1 = new WaistMeasurement(85, unit1);
      const measurement2 = new WaistMeasurement(32, unit2); // Valid inches value
      
      expect(measurement1.equals(measurement2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      const unit = new WaistUnit('cm');
      const measurement = new WaistMeasurement(85, unit);
      
      expect(measurement.toString()).toBe('85 cm');
    });
  });

  describe('Static factory method', () => {
    it('should create measurement using create method', () => {
      const measurement = WaistMeasurement.create(32, 'inches');
      
      expect(measurement.getValue()).toBe(32);
      expect(measurement.getUnit().getValue()).toBe('inches');
    });
  });
});