import { DomainError } from '../errors/domainError';

/**
 * Weight unit value object
 */
export type WeightUnitType = 'kg' | 'lbs' | 'st';

export class WeightUnit {
  private static readonly VALID_UNITS: WeightUnitType[] = ['kg', 'lbs', 'st'];
  
  constructor(private readonly value: WeightUnitType) {
    this.validate();
  }
  
  private validate(): void {
    if (!WeightUnit.VALID_UNITS.includes(this.value)) {
      throw new DomainError(`Invalid weight unit: ${this.value}. Must be one of: ${WeightUnit.VALID_UNITS.join(', ')}`);
    }
  }
  
  getValue(): WeightUnitType {
    return this.value;
  }
  
  equals(other: WeightUnit): boolean {
    return this.value === other.value;
  }
  
  toString(): string {
    return this.value;
  }
  
  static create(value: string): WeightUnit {
    return new WeightUnit(value as WeightUnitType);
  }
  
  static isValid(value: string): boolean {
    return WeightUnit.VALID_UNITS.includes(value as WeightUnitType);
  }
}