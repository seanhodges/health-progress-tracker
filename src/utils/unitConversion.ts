/**
 * Unit conversion utilities
 */

export function convertWeight(value: number, fromUnit: 'kg' | 'lbs', toUnit: 'kg' | 'lbs'): number {
    if (fromUnit === toUnit) return value;
    
    let result: number;
    if (fromUnit === 'kg' && toUnit === 'lbs') {
        result = value * 2.20462262185;
    } else if (fromUnit === 'lbs' && toUnit === 'kg') {
        result = value / 2.20462262185;
    } else {
        result = value;
    }
    
    // Round to 4 decimal places to maintain precision
    return Math.round(result * 10000) / 10000;
}

export function convertWaist(value: number, fromUnit: 'cm' | 'inches', toUnit: 'cm' | 'inches'): number {
    if (fromUnit === toUnit) return value;
    
    let result: number;
    if (fromUnit === 'cm' && toUnit === 'inches') {
        result = value / 2.54;
    } else if (fromUnit === 'inches' && toUnit === 'cm') {
        result = value * 2.54;
    } else {
        result = value;
    }
    
    // Round to 4 decimal places to maintain precision
    return Math.round(result * 10000) / 10000;
}