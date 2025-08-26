import { DomainError } from '../errors/domainError';
import { WaistUnit, WaistUnitType } from './waistUnit';

/**
 * Waist measurement value object
 */
export class WaistMeasurement {
  private static readonly MIN_WAIST_CM = 40;
  private static readonly MAX_WAIST_CM = 200;
  private static readonly MIN_WAIST_INCHES = 16;
  private static readonly MAX_WAIST_INCHES = 79;
  
  constructor(
    private readonly value: number,
    private readonly unit: WaistUnit
  ) {
    this.validate();
  }
  
  private validate(): void {
    if (this.value <= 0) {
      throw new DomainError('Waist size must be a positive number');
    }
    
    const unitValue = this.unit.getValue();
    let min: number, max: number;
    
    switch (unitValue) {
      case 'cm':
        min = WaistMeasurement.MIN_WAIST_CM;
        max = WaistMeasurement.MAX_WAIST_CM;
        break;
      case 'inches':
        min = WaistMeasurement.MIN_WAIST_INCHES;
        max = WaistMeasurement.MAX_WAIST_INCHES;
        break;
      default:
        throw new DomainError(`Unsupported waist unit: ${unitValue}`);
    }
    
    if (this.value < min || this.value > max) {
      throw new DomainError(`Waist size must be between ${min} and ${max} ${unitValue}`);
    }
  }
  
  getValue(): number {
    return this.value;
  }
  
  getUnit(): WaistUnit {
    return this.unit;
  }
  
  equals(other: WaistMeasurement): boolean {
    return this.value === other.value && this.unit.equals(other.unit);
  }
  
  toString(): string {
    return `${this.value} ${this.unit.toString()}`;
  }
  
  static create(value: number, unit: WaistUnitType): WaistMeasurement {
    return new WaistMeasurement(value, new WaistUnit(unit));
  }
}