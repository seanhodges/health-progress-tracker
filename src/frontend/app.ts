import { HealthProgressController } from './presentation/controllers/healthProgressController';
import { ApiService } from './infrastructure/http/apiService';
import { UnitConversionService } from './domain/services/unitConversionService';
import { LocalStorageService } from './infrastructure/storage/localStorage';

/**
 * Main application class following DDD layered architecture
 */
export class HealthProgressTracker {
    private controller: HealthProgressController;

    constructor() {
        // Initialize dependencies following DDD principles
        const apiService = new ApiService();
        const unitConversionService = new UnitConversionService();
        const localStorageService = new LocalStorageService();
        
        // Initialize the main controller with dependencies
        this.controller = new HealthProgressController(
            apiService,
            unitConversionService,
            localStorageService
        );
    }
}

// Initialize the application when DOM is loaded
if (typeof window !== 'undefined' && window.document) {
    document.addEventListener('DOMContentLoaded', (e: Event) => {
        if (e.isTrusted) {
            // If a browser-initiated (trusted) event then prevent it from reaching the app-initiated listener.
            // This avoids a double initialisation of the app.
            e.stopImmediatePropagation();
        }
        new HealthProgressTracker();
    });
}