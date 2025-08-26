/**
 * @jest-environment jsdom
 */

import { LocalStorageService } from '../../../../frontend/infrastructure/storage/localStorage';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('LocalStorageService', () => {
  let localStorageService: LocalStorageService;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    localStorageService = new LocalStorageService();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe('saveWeightUnit', () => {
    it('should save weight unit to localStorage', () => {
      localStorageService.saveWeightUnit('kg');
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('healthTracker_weightUnit', 'kg');
    });

    it('should save different weight units', () => {
      localStorageService.saveWeightUnit('lbs');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('healthTracker_weightUnit', 'lbs');

      localStorageService.saveWeightUnit('st');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('healthTracker_weightUnit', 'st');
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      localStorageService.saveWeightUnit('kg');

      expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to save weight unit to localStorage:', expect.any(Error));
    });
  });

  describe('saveWaistUnit', () => {
    it('should save waist unit to localStorage', () => {
      localStorageService.saveWaistUnit('cm');
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('healthTracker_waistUnit', 'cm');
    });

    it('should save different waist units', () => {
      localStorageService.saveWaistUnit('inches');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('healthTracker_waistUnit', 'inches');
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      localStorageService.saveWaistUnit('cm');

      expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to save waist unit to localStorage:', expect.any(Error));
    });
  });

  describe('loadWeightUnit', () => {
    it('should load valid weight unit from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('kg');
      
      const result = localStorageService.loadWeightUnit();
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('healthTracker_weightUnit');
      expect(result).toBe('kg');
    });

    it('should load different valid weight units', () => {
      localStorageMock.getItem.mockReturnValue('lbs');
      expect(localStorageService.loadWeightUnit()).toBe('lbs');

      localStorageMock.getItem.mockReturnValue('st');
      expect(localStorageService.loadWeightUnit()).toBe('st');
    });

    it('should return null for invalid weight units', () => {
      localStorageMock.getItem.mockReturnValue('invalid');
      
      const result = localStorageService.loadWeightUnit();
      
      expect(result).toBeNull();
    });

    it('should return null when no value stored', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = localStorageService.loadWeightUnit();
      
      expect(result).toBeNull();
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const result = localStorageService.loadWeightUnit();

      expect(result).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to load weight unit from localStorage:', expect.any(Error));
    });
  });

  describe('loadWaistUnit', () => {
    it('should load valid waist unit from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('cm');
      
      const result = localStorageService.loadWaistUnit();
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('healthTracker_waistUnit');
      expect(result).toBe('cm');
    });

    it('should load different valid waist units', () => {
      localStorageMock.getItem.mockReturnValue('inches');
      expect(localStorageService.loadWaistUnit()).toBe('inches');
    });

    it('should return null for invalid waist units', () => {
      localStorageMock.getItem.mockReturnValue('invalid');
      
      const result = localStorageService.loadWaistUnit();
      
      expect(result).toBeNull();
    });

    it('should return null when no value stored', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = localStorageService.loadWaistUnit();
      
      expect(result).toBeNull();
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const result = localStorageService.loadWaistUnit();

      expect(result).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to load waist unit from localStorage:', expect.any(Error));
    });
  });

  describe('saveUnits', () => {
    it('should save both weight and waist units', () => {
      localStorageService.saveUnits('kg', 'cm');

      expect(localStorageMock.setItem).toHaveBeenCalledWith('healthTracker_weightUnit', 'kg');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('healthTracker_waistUnit', 'cm');
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);
    });

    it('should save different unit combinations', () => {
      localStorageService.saveUnits('lbs', 'inches');

      expect(localStorageMock.setItem).toHaveBeenCalledWith('healthTracker_weightUnit', 'lbs');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('healthTracker_waistUnit', 'inches');
    });

    it('should handle errors in both save operations', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      localStorageService.saveUnits('kg', 'cm');

      expect(consoleWarnSpy).toHaveBeenCalledTimes(2);
      expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to save weight unit to localStorage:', expect.any(Error));
      expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to save waist unit to localStorage:', expect.any(Error));
    });
  });
});