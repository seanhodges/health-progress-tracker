import { DomainError } from '../errors/domainError';
import { WeightMeasurement } from '../vo/weightMeasurement';
import { WaistMeasurement } from '../vo/waistMeasurement';

/**
 * Health Entry aggregate root
 */
export class HealthEntry {
  private constructor(
    private readonly id: number | undefined,
    private readonly date: string,
    private readonly weight: WeightMeasurement,
    private readonly waist: WaistMeasurement,
    private readonly createdAt?: string
  ) {
    this.validateDate();
  }
  
  private validateDate(): void {
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(this.date)) {
      throw new DomainError('Date must be in YYYY-MM-DD format');
    }
    
    // Domain rule: Date cannot be in the future
    const entryDate = new Date(this.date + 'T00:00:00');
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    if (entryDate > today) {
      throw new DomainError('Entry date cannot be in the future');
    }
  }
  
  // Getters
  getId(): number | undefined {
    return this.id;
  }
  
  getDate(): string {
    return this.date;
  }
  
  getWeight(): WeightMeasurement {
    return this.weight;
  }
  
  getWaist(): WaistMeasurement {
    return this.waist;
  }
  
  getCreatedAt(): string | undefined {
    return this.createdAt;
  }
  
  // Factory methods
  static create(
    date: string,
    weight: WeightMeasurement,
    waist: WaistMeasurement
  ): HealthEntry {
    return new HealthEntry(undefined, date, weight, waist);
  }
  
  static reconstitute(
    id: number,
    date: string,
    weight: WeightMeasurement,
    waist: WaistMeasurement,
    createdAt?: string
  ): HealthEntry {
    return new HealthEntry(id, date, weight, waist, createdAt);
  }
  
  // For database persistence (simplified interface)
  toPlainObject() {
    return {
      id: this.id,
      date: this.date,
      weight: this.weight.getValue(),
      weightUnit: this.weight.getUnit().getValue(),
      waistSize: this.waist.getValue(),
      waistUnit: this.waist.getUnit().getValue(),
      createdAt: this.createdAt
    };
  }
}