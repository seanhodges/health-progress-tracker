import { DomainError } from '../errors/domainError';

/**
 * Waist unit value object
 */
export type WaistUnitType = 'cm' | 'inches';

export class WaistUnit {
  private static readonly VALID_UNITS: WaistUnitType[] = ['cm', 'inches'];
  
  constructor(private readonly value: WaistUnitType) {
    this.validate();
  }
  
  private validate(): void {
    if (!WaistUnit.VALID_UNITS.includes(this.value)) {
      throw new DomainError(`Invalid waist unit: ${this.value}. Must be one of: ${WaistUnit.VALID_UNITS.join(', ')}`);
    }
  }
  
  getValue(): WaistUnitType {
    return this.value;
  }
  
  equals(other: WaistUnit): boolean {
    return this.value === other.value;
  }
  
  toString(): string {
    return this.value;
  }
  
  static create(value: string): WaistUnit {
    return new WaistUnit(value as WaistUnitType);
  }
  
  static isValid(value: string): boolean {
    return WaistUnit.VALID_UNITS.includes(value as WaistUnitType);
  }
}