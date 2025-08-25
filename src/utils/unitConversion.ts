/**
 * Unit conversion utilities
 */

export function convertWeight(value: number, fromUnit: 'kg' | 'lbs' | 'st', toUnit: 'kg' | 'lbs' | 'st'): number {
    if (fromUnit === toUnit) return value;
    
    // Conversion factors: 1 kg = 2.20462262185 lbs = 0.157473044 st
    // 1 st = 14 lbs = 6.35029318 kg
    let result: number;
    
    // Convert to kg first as base unit
    let kgValue: number;
    if (fromUnit === 'kg') {
        kgValue = value;
    } else if (fromUnit === 'lbs') {
        kgValue = value / 2.20462262185;
    } else if (fromUnit === 'st') {
        kgValue = value * 6.35029318;
    } else {
        kgValue = value;
    }
    
    // Convert from kg to target unit
    if (toUnit === 'kg') {
        result = kgValue;
    } else if (toUnit === 'lbs') {
        result = kgValue * 2.20462262185;
    } else if (toUnit === 'st') {
        result = kgValue / 6.35029318;
    } else {
        result = kgValue;
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