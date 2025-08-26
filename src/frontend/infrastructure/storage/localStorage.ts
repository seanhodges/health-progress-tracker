import { WeightUnitType, WaistUnitType } from '../../domain/vo/units';

/**
 * Infrastructure service for local storage management
 */
export class LocalStorageService {
  private static readonly WEIGHT_UNIT_KEY = 'healthTracker_weightUnit';
  private static readonly WAIST_UNIT_KEY = 'healthTracker_waistUnit';

  saveWeightUnit(unit: WeightUnitType): void {
    try {
      localStorage.setItem(LocalStorageService.WEIGHT_UNIT_KEY, unit);
    } catch (error) {
      console.warn('Failed to save weight unit to localStorage:', error);
    }
  }

  saveWaistUnit(unit: WaistUnitType): void {
    try {
      localStorage.setItem(LocalStorageService.WAIST_UNIT_KEY, unit);
    } catch (error) {
      console.warn('Failed to save waist unit to localStorage:', error);
    }
  }

  loadWeightUnit(): WeightUnitType | null {
    try {
      const saved = localStorage.getItem(LocalStorageService.WEIGHT_UNIT_KEY);
      if (saved && ['kg', 'lbs', 'st'].includes(saved)) {
        return saved as WeightUnitType;
      }
    } catch (error) {
      console.warn('Failed to load weight unit from localStorage:', error);
    }
    return null;
  }

  loadWaistUnit(): WaistUnitType | null {
    try {
      const saved = localStorage.getItem(LocalStorageService.WAIST_UNIT_KEY);
      if (saved && ['cm', 'inches'].includes(saved)) {
        return saved as WaistUnitType;
      }
    } catch (error) {
      console.warn('Failed to load waist unit from localStorage:', error);
    }
    return null;
  }

  saveUnits(weightUnit: WeightUnitType, waistUnit: WaistUnitType): void {
    this.saveWeightUnit(weightUnit);
    this.saveWaistUnit(waistUnit);
  }
}