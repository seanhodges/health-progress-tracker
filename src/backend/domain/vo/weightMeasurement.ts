import { DomainError } from '../errors/domainError';
import { WeightUnit, WeightUnitType } from './weightUnit';

/**
 * Weight measurement value object
 */
export class WeightMeasurement {
  private static readonly MIN_WEIGHT_KG = 20;
  private static readonly MAX_WEIGHT_KG = 500;
  private static readonly MIN_WEIGHT_LBS = 44;
  private static readonly MAX_WEIGHT_LBS = 1100;
  private static readonly MIN_WEIGHT_ST = 3;
  private static readonly MAX_WEIGHT_ST = 79;
  
  constructor(
    private readonly value: number,
    private readonly unit: WeightUnit
  ) {
    this.validate();
  }
  
  private validate(): void {
    if (this.value <= 0) {
      throw new DomainError('Weight must be a positive number');
    }
    
    const unitValue = this.unit.getValue();
    let min: number, max: number;
    
    switch (unitValue) {
      case 'kg':
        min = WeightMeasurement.MIN_WEIGHT_KG;
        max = WeightMeasurement.MAX_WEIGHT_KG;
        break;
      case 'lbs':
        min = WeightMeasurement.MIN_WEIGHT_LBS;
        max = WeightMeasurement.MAX_WEIGHT_LBS;
        break;
      case 'st':
        min = WeightMeasurement.MIN_WEIGHT_ST;
        max = WeightMeasurement.MAX_WEIGHT_ST;
        break;
      default:
        throw new DomainError(`Unsupported weight unit: ${unitValue}`);
    }
    
    if (this.value < min || this.value > max) {
      throw new DomainError(`Weight must be between ${min} and ${max} ${unitValue}`);
    }
  }
  
  getValue(): number {
    return this.value;
  }
  
  getUnit(): WeightUnit {
    return this.unit;
  }
  
  equals(other: WeightMeasurement): boolean {
    return this.value === other.value && this.unit.equals(other.unit);
  }
  
  toString(): string {
    return `${this.value} ${this.unit.toString()}`;
  }
  
  static create(value: number, unit: WeightUnitType): WeightMeasurement {
    return new WeightMeasurement(value, new WeightUnit(unit));
  }
}