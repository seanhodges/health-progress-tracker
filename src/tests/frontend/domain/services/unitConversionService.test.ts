import { UnitConversionService } from '../../../../frontend/domain/services/unitConversionService';

describe('Frontend UnitConversionService', () => {
    let unitConversionService: UnitConversionService;

    beforeEach(() => {
        unitConversionService = new UnitConversionService();
    });

    describe('Weight Conversion', () => {
        test('should convert kg to lbs correctly', () => {
            const result = unitConversionService.convertWeight(1, 'kg', 'lbs');
            expect(result).toBeCloseTo(2.2046, 4);
        });

        test('should convert lbs to kg correctly', () => {
            const result = unitConversionService.convertWeight(2.2046, 'lbs', 'kg');
            expect(result).toBeCloseTo(1, 4);
        });

        test('should convert 70 kg to lbs correctly', () => {
            const result = unitConversionService.convertWeight(70, 'kg', 'lbs');
            expect(result).toBeCloseTo(154.3236, 3);
        });

        test('should convert 154.3236 lbs to kg correctly', () => {
            const result = unitConversionService.convertWeight(154.3236, 'lbs', 'kg');
            expect(result).toBeCloseTo(70, 2);
        });

        test('should return same value for same units', () => {
            const result = unitConversionService.convertWeight(70, 'kg', 'kg');
            expect(result).toBe(70);
        });

        test('should convert kg to stone correctly', () => {
            const result = unitConversionService.convertWeight(70, 'kg', 'st');
            expect(result).toBeCloseTo(11.0231, 3);
        });

        test('should convert stone to kg correctly', () => {
            const result = unitConversionService.convertWeight(11, 'st', 'kg');
            expect(result).toBeCloseTo(69.8532, 3);
        });

        test('should convert lbs to stone correctly', () => {
            const result = unitConversionService.convertWeight(154, 'lbs', 'st');
            expect(result).toBeCloseTo(11, 3);
        });

        test('should convert stone to lbs correctly', () => {
            const result = unitConversionService.convertWeight(11, 'st', 'lbs');
            expect(result).toBeCloseTo(154, 3);
        });

        test('should maintain precision with rounding', () => {
            const result = unitConversionService.convertWeight(1, 'kg', 'lbs');
            expect(result).toBe(2.2046); // Rounded to 4 decimal places
        });

        test('should handle decimal inputs correctly', () => {
            const result = unitConversionService.convertWeight(70.5, 'kg', 'lbs');
            expect(result).toBeCloseTo(155.4259, 4);
        });
    });

    describe('Waist Conversion', () => {
        test('should convert inches to cm correctly', () => {
            const result = unitConversionService.convertWaist(1, 'inches', 'cm');
            expect(result).toBe(2.54);
        });

        test('should convert cm to inches correctly', () => {
            const result = unitConversionService.convertWaist(2.54, 'cm', 'inches');
            expect(result).toBe(1);
        });

        test('should convert 30 inches to cm correctly', () => {
            const result = unitConversionService.convertWaist(30, 'inches', 'cm');
            expect(result).toBe(76.2);
        });

        test('should convert 76.2 cm to inches correctly', () => {
            const result = unitConversionService.convertWaist(76.2, 'cm', 'inches');
            expect(result).toBeCloseTo(30, 4);
        });

        test('should return same value for same units', () => {
            const result = unitConversionService.convertWaist(30, 'inches', 'inches');
            expect(result).toBe(30);
        });

        test('should handle decimal inputs correctly', () => {
            const result = unitConversionService.convertWaist(32.5, 'inches', 'cm');
            expect(result).toBe(82.55);
        });

        test('should maintain precision with rounding', () => {
            const result = unitConversionService.convertWaist(30.123456789, 'inches', 'cm');
            expect(result).toBe(76.5136); // Rounded to 4 decimal places
        });
    });

    describe('Round-trip Conversions', () => {
        test('should maintain accuracy in kg->lbs->kg conversion', () => {
            const original = 70;
            const toLbs = unitConversionService.convertWeight(original, 'kg', 'lbs');
            const backToKg = unitConversionService.convertWeight(toLbs, 'lbs', 'kg');
            expect(backToKg).toBeCloseTo(original, 3);
        });

        test('should maintain accuracy in kg->st->kg conversion', () => {
            const original = 70;
            const toStone = unitConversionService.convertWeight(original, 'kg', 'st');
            const backToKg = unitConversionService.convertWeight(toStone, 'st', 'kg');
            expect(backToKg).toBeCloseTo(original, 3);
        });

        test('should maintain accuracy in lbs->st->lbs conversion', () => {
            const original = 154;
            const toStone = unitConversionService.convertWeight(original, 'lbs', 'st');
            const backToLbs = unitConversionService.convertWeight(toStone, 'st', 'lbs');
            expect(backToLbs).toBeCloseTo(original, 3);
        });

        test('should maintain accuracy in inches->cm->inches conversion', () => {
            const original = 30;
            const toCm = unitConversionService.convertWaist(original, 'inches', 'cm');
            const backToInches = unitConversionService.convertWaist(toCm, 'cm', 'inches');
            expect(backToInches).toBeCloseTo(original, 4);
        });
    });
});