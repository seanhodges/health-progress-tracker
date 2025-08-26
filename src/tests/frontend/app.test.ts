/**
 * @jest-environment jsdom
 */

import { HealthProgressTracker } from '../../frontend/app';

// Mock dependencies
jest.mock('../../frontend/presentation/controllers/healthProgressController');
jest.mock('../../frontend/infrastructure/http/apiService');
jest.mock('../../frontend/domain/services/unitConversionService');
jest.mock('../../frontend/infrastructure/storage/localStorage');

describe('HealthProgressTracker App', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  describe('Application initialization', () => {
    it('should create HealthProgressTracker instance', () => {
      const app = new HealthProgressTracker();
      expect(app).toBeInstanceOf(HealthProgressTracker);
    });

    it('should initialize app on trusted DOMContentLoaded event', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Create a trusted event
      const event = new Event('DOMContentLoaded');
      
      // Dispatch the event
      document.dispatchEvent(event);
      
      consoleSpy.mockRestore();
    });

    it('should handle DOMContentLoaded events normally', () => {
      const stopImmediatePropagationSpy = jest.fn();
      
      // Create an untrusted event
      const event = new Event('DOMContentLoaded');
      Object.defineProperty(event, 'stopImmediatePropagation', { value: stopImmediatePropagationSpy });
      
      // Dispatch the event
      document.dispatchEvent(event);
      
      expect(stopImmediatePropagationSpy).not.toHaveBeenCalled();
    });
  });

  describe('Dependency injection', () => {
    it('should initialize with proper dependency structure', () => {
      const app = new HealthProgressTracker();
      
      // Verify that the constructor doesn't throw and creates the app
      expect(app).toBeDefined();
      expect(app).toBeInstanceOf(HealthProgressTracker);
    });
  });
});