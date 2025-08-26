import { WeightUnit } from '../../../../backend/domain/vo/weightUnit';
import { DomainError } from '../../../../backend/domain/errors/domainError';

describe('WeightUnit', () => {
  describe('Valid units', () => {
    it('should create weight unit with kg', () => {
      const unit = new WeightUnit('kg');
      expect(unit.getValue()).toBe('kg');
    });

    it('should create weight unit with lbs', () => {
      const unit = new WeightUnit('lbs');
      expect(unit.getValue()).toBe('lbs');
    });

    it('should create weight unit with st', () => {
      const unit = new WeightUnit('st');
      expect(unit.getValue()).toBe('st');
    });
  });

  describe('Invalid units', () => {
    it('should throw domain error for invalid unit', () => {
      expect(() => new WeightUnit('invalid' as any)).toThrow(DomainError);
      expect(() => new WeightUnit('invalid' as any)).toThrow('Invalid weight unit: invalid. Must be one of: kg, lbs, st');
    });
  });

  describe('Equality', () => {
    it('should return true for equal units', () => {
      const unit1 = new WeightUnit('kg');
      const unit2 = new WeightUnit('kg');
      
      expect(unit1.equals(unit2)).toBe(true);
    });

    it('should return false for different units', () => {
      const unit1 = new WeightUnit('kg');
      const unit2 = new WeightUnit('lbs');
      
      expect(unit1.equals(unit2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      const unit = new WeightUnit('kg');
      expect(unit.toString()).toBe('kg');
    });
  });

  describe('Static methods', () => {
    it('should create unit using create method', () => {
      const unit = WeightUnit.create('lbs');
      expect(unit.getValue()).toBe('lbs');
    });

    it('should validate valid units', () => {
      expect(WeightUnit.isValid('kg')).toBe(true);
      expect(WeightUnit.isValid('lbs')).toBe(true);
      expect(WeightUnit.isValid('st')).toBe(true);
    });

    it('should reject invalid units', () => {
      expect(WeightUnit.isValid('invalid')).toBe(false);
      expect(WeightUnit.isValid('')).toBe(false);
    });
  });
});