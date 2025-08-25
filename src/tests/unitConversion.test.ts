import { convertWeight, convertWaist } from '../utils/unitConversion';

describe('Unit Conversion Tests', () => {

    describe('Weight Conversion', () => {
        test('should convert kg to lbs correctly', () => {
            const result = convertWeight(1, 'kg', 'lbs');
            expect(result).toBeCloseTo(2.20462, 4);
        });

        test('should convert lbs to kg correctly', () => {
            const result = convertWeight(2.20462, 'lbs', 'kg');
            expect(result).toBeCloseTo(1, 4);
        });

        test('should convert 70 kg to lbs correctly', () => {
            const result = convertWeight(70, 'kg', 'lbs');
            expect(result).toBeCloseTo(154.32, 2);
        });

        test('should convert 154.32 lbs to kg correctly', () => {
            const result = convertWeight(154.32, 'lbs', 'kg');
            expect(result).toBeCloseTo(70, 2);
        });

        test('should return same value for same units', () => {
            const result = convertWeight(70, 'kg', 'kg');
            expect(result).toBe(70);
        });
    });

    describe('Waist Conversion', () => {
        test('should convert inches to cm correctly', () => {
            const result = convertWaist(1, 'inches', 'cm');
            expect(result).toBeCloseTo(2.54, 2);
        });

        test('should convert cm to inches correctly', () => {
            const result = convertWaist(2.54, 'cm', 'inches');
            expect(result).toBeCloseTo(1, 2);
        });

        test('should convert 30 inches to cm correctly', () => {
            const result = convertWaist(30, 'inches', 'cm');
            expect(result).toBeCloseTo(76.2, 1);
        });

        test('should convert 76.2 cm to inches correctly', () => {
            const result = convertWaist(76.2, 'cm', 'inches');
            expect(result).toBeCloseTo(30, 1);
        });

        test('should return same value for same units', () => {
            const result = convertWaist(30, 'inches', 'inches');
            expect(result).toBe(30);
        });
    });

    describe('Round-trip Conversions', () => {
        test('should maintain accuracy in kg->lbs->kg conversion', () => {
            const original = 70;
            const toLbs = convertWeight(original, 'kg', 'lbs');
            const backToKg = convertWeight(toLbs, 'lbs', 'kg');
            expect(backToKg).toBeCloseTo(original, 2);
        });

        test('should maintain accuracy in inches->cm->inches conversion', () => {
            const original = 30;
            const toCm = convertWaist(original, 'inches', 'cm');
            const backToInches = convertWaist(toCm, 'cm', 'inches');
            expect(backToInches).toBeCloseTo(original, 2);
        });
    });

    describe('Specific Test Cases', () => {
        test('1 kg should equal 2.20462262185 lbs', () => {
            const result = convertWeight(1, 'kg', 'lbs');
            expect(result).toBe(2.2046);  // Rounded to 4 decimal places
        });

        test('1 inch should equal 2.54 cm', () => {
            const result = convertWaist(1, 'inches', 'cm');
            expect(result).toBe(2.54);
        });

        test('Should handle decimal inputs correctly', () => {
            const result = convertWeight(70.5, 'kg', 'lbs');
            expect(result).toBeCloseTo(155.43, 2);
        });
    });
});