import { WaistUnit } from '../../../../backend/domain/vo/waistUnit';
import { DomainError } from '../../../../backend/domain/errors/domainError';

describe('WaistUnit', () => {
  describe('Valid units', () => {
    it('should create waist unit with cm', () => {
      const unit = new WaistUnit('cm');
      expect(unit.getValue()).toBe('cm');
    });

    it('should create waist unit with inches', () => {
      const unit = new WaistUnit('inches');
      expect(unit.getValue()).toBe('inches');
    });
  });

  describe('Invalid units', () => {
    it('should throw domain error for invalid unit', () => {
      expect(() => new WaistUnit('invalid' as any)).toThrow(DomainError);
      expect(() => new WaistUnit('invalid' as any)).toThrow('Invalid waist unit: invalid. Must be one of: cm, inches');
    });
  });

  describe('Equality', () => {
    it('should return true for equal units', () => {
      const unit1 = new WaistUnit('cm');
      const unit2 = new WaistUnit('cm');
      
      expect(unit1.equals(unit2)).toBe(true);
    });

    it('should return false for different units', () => {
      const unit1 = new WaistUnit('cm');
      const unit2 = new WaistUnit('inches');
      
      expect(unit1.equals(unit2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      const unit = new WaistUnit('cm');
      expect(unit.toString()).toBe('cm');
    });
  });

  describe('Static methods', () => {
    it('should create unit using create method', () => {
      const unit = WaistUnit.create('inches');
      expect(unit.getValue()).toBe('inches');
    });

    it('should validate valid units', () => {
      expect(WaistUnit.isValid('cm')).toBe(true);
      expect(WaistUnit.isValid('inches')).toBe(true);
    });

    it('should reject invalid units', () => {
      expect(WaistUnit.isValid('invalid')).toBe(false);
      expect(WaistUnit.isValid('')).toBe(false);
    });
  });
});