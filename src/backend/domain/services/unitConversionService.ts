import { WeightUnitType } from '../vo/weightUnit';
import { WaistUnitType } from '../vo/waistUnit';

/**
 * Domain service for unit conversions
 * Handles conversion between different measurement units
 */
export class UnitConversionService {
  // Weight conversion constants
  private static readonly LBS_TO_KG = 1 / 2.20462262185;
  private static readonly ST_TO_KG = 6.35029318;
  
  // Waist conversion constants  
  private static readonly INCHES_TO_CM = 2.54;
  
  /**
   * Convert weight between different units
   */
  convertWeight(value: number, fromUnit: WeightUnitType, toUnit: WeightUnitType): number {
    if (fromUnit === toUnit) return value;
    
    // Convert to kg first as base unit
    let kgValue: number;
    switch (fromUnit) {
      case 'kg':
        kgValue = value;
        break;
      case 'lbs':
        kgValue = value * UnitConversionService.LBS_TO_KG;
        break;
      case 'st':
        kgValue = value * UnitConversionService.ST_TO_KG;
        break;
      default:
        throw new Error(`Unsupported weight unit: ${fromUnit}`);
    }
    
    // Convert from kg to target unit
    let result: number;
    switch (toUnit) {
      case 'kg':
        result = kgValue;
        break;
      case 'lbs':
        result = kgValue / UnitConversionService.LBS_TO_KG;
        break;
      case 'st':
        result = kgValue / UnitConversionService.ST_TO_KG;
        break;
      default:
        throw new Error(`Unsupported weight unit: ${toUnit}`);
    }
    
    // Round to 4 decimal places to maintain precision
    return Math.round(result * 10000) / 10000;
  }
  
  /**
   * Convert waist measurement between different units
   */
  convertWaist(value: number, fromUnit: WaistUnitType, toUnit: WaistUnitType): number {
    if (fromUnit === toUnit) return value;
    
    let result: number;
    if (fromUnit === 'cm' && toUnit === 'inches') {
      result = value / UnitConversionService.INCHES_TO_CM;
    } else if (fromUnit === 'inches' && toUnit === 'cm') {
      result = value * UnitConversionService.INCHES_TO_CM;
    } else {
      throw new Error(`Unsupported conversion from ${fromUnit} to ${toUnit}`);
    }
    
    // Round to 4 decimal places to maintain precision
    return Math.round(result * 10000) / 10000;
  }
  
  /**
   * Convert weight to standard storage unit (kg)
   */
  convertWeightToStandard(value: number, unit: WeightUnitType): number {
    return this.convertWeight(value, unit, 'kg');
  }
  
  /**
   * Convert waist to standard storage unit (cm)
   */
  convertWaistToStandard(value: number, unit: WaistUnitType): number {
    return this.convertWaist(value, unit, 'cm');
  }
}