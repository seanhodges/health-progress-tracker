/**
 * @jest-environment jsdom
 */

import { HealthProgressController } from '../../../../frontend/presentation/controllers/healthProgressController';
import { ApiService } from '../../../../frontend/infrastructure/http/apiService';
import { UnitConversionService } from '../../../../frontend/domain/services/unitConversionService';
import { LocalStorageService } from '../../../../frontend/infrastructure/storage/localStorage';

// Mock Plotly
(global as any).Plotly = {
  newPlot: jest.fn()
};

// Mock the services
jest.mock('../../../../frontend/infrastructure/http/apiService');
jest.mock('../../../../frontend/domain/services/unitConversionService');
jest.mock('../../../../frontend/infrastructure/storage/localStorage');

describe('HealthProgressController', () => {
  let controller: HealthProgressController;
  let mockApiService: jest.Mocked<ApiService>;
  let mockUnitConversionService: jest.Mocked<UnitConversionService>;
  let mockLocalStorageService: jest.Mocked<LocalStorageService>;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <form id="healthForm">
        <input id="date" type="date" name="date" />
        <input id="weight" type="number" name="weight" />
        <select id="weightUnit" name="weightUnit">
          <option value="kg">kg</option>
          <option value="lbs">lbs</option>
          <option value="st">st</option>
        </select>
        <input id="waistSize" type="number" name="waistSize" />
        <select id="waistUnit" name="waistUnit">
          <option value="cm">cm</option>
          <option value="inches">inches</option>
        </select>
        <button id="saveButton" type="submit">Save Progress</button>
      </form>
      
      <button id="filter-1M" class="time-filter">1M</button>
      <button id="filter-3M" class="time-filter">3M</button>
      <button id="filter-6M" class="time-filter">6M</button>
      <button id="filter-all" class="time-filter active">All Time</button>
      
      <button id="measurement-weight" class="measurement-filter">Weight</button>
      <button id="measurement-waist" class="measurement-filter">Waist Size</button>
      <button id="measurement-all" class="measurement-filter active">All</button>
      
      <select id="historyWeightUnit">
        <option value="kg">kg</option>
        <option value="lbs">lbs</option>
        <option value="st">st</option>
      </select>
      <select id="historyWaistUnit">
        <option value="cm">cm</option>
        <option value="inches">inches</option>
      </select>
      
      <div id="chartToolbar"></div>
      <div id="chartContainer">
        <div id="chart"></div>
      </div>
      <div id="noDataContainer" style="display: none;"></div>
      <div id="chartPlaceholder" style="display: none;"></div>
      
      <table>
        <tbody id="historyTableBody"></tbody>
      </table>
      <div id="pagination" class="hidden">
        <span id="entriesStart">1</span>
        <span id="entriesEnd">25</span>
        <span id="entriesTotal">0</span>
        <button id="prevPage">Previous</button>
        <button id="nextPage">Next</button>
      </div>
      
      <div id="messageContainer"></div>
    `;

    // Create mock instances
    mockApiService = new ApiService() as jest.Mocked<ApiService>;
    mockUnitConversionService = new UnitConversionService() as jest.Mocked<UnitConversionService>;
    mockLocalStorageService = new LocalStorageService() as jest.Mocked<LocalStorageService>;

    // Setup default mock returns
    mockLocalStorageService.loadWeightUnit.mockReturnValue('kg');
    mockLocalStorageService.loadWaistUnit.mockReturnValue('cm');
    mockApiService.getChart.mockResolvedValue({ success: true, chartHtml: '<script>test</script>' });
    mockApiService.getEntries.mockResolvedValue({ success: true, data: [] });

    jest.clearAllMocks();

    // Initialize controller
    controller = new HealthProgressController(
      mockApiService,
      mockUnitConversionService,
      mockLocalStorageService
    );
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      expect(controller).toBeDefined();
      expect(mockLocalStorageService.loadWeightUnit).toHaveBeenCalled();
      expect(mockLocalStorageService.loadWaistUnit).toHaveBeenCalled();
    });

    it('should set today\'s date as default', () => {
      const dateInput = document.getElementById('date') as HTMLInputElement;
      const today = new Date().toISOString().split('T')[0];
      
      expect(dateInput.value).toBe(today);
    });

    it('should load initial chart and history data', () => {
      expect(mockApiService.getChart).toHaveBeenCalled();
      expect(mockApiService.getEntries).toHaveBeenCalled();
    });

    it('should sync units across form and history sections', () => {
      mockLocalStorageService.loadWeightUnit.mockReturnValue('lbs');
      mockLocalStorageService.loadWaistUnit.mockReturnValue('inches');

      new HealthProgressController(
        mockApiService,
        mockUnitConversionService,
        mockLocalStorageService
      );

      const formWeightUnit = document.getElementById('weightUnit') as HTMLSelectElement;
      const formWaistUnit = document.getElementById('waistUnit') as HTMLSelectElement;
      const historyWeightUnit = document.getElementById('historyWeightUnit') as HTMLSelectElement;
      const historyWaistUnit = document.getElementById('historyWaistUnit') as HTMLSelectElement;

      expect(formWeightUnit.value).toBe('lbs');
      expect(formWaistUnit.value).toBe('inches');
      expect(historyWeightUnit.value).toBe('lbs');
      expect(historyWaistUnit.value).toBe('inches');
    });
  });

  describe('Form submission', () => {
    it('should handle successful form submission', async () => {
      mockApiService.saveEntry.mockResolvedValue({ success: true, id: 1 });

      // Set form values
      (document.getElementById('date') as HTMLInputElement).value = '2024-01-15';
      (document.getElementById('weight') as HTMLInputElement).value = '75.5';
      (document.getElementById('weightUnit') as HTMLSelectElement).value = 'kg';
      (document.getElementById('waistSize') as HTMLInputElement).value = '85.0';
      (document.getElementById('waistUnit') as HTMLSelectElement).value = 'cm';

      // Submit form
      const form = document.getElementById('healthForm') as HTMLFormElement;
      const submitEvent = new Event('submit');
      form.dispatchEvent(submitEvent);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockApiService.saveEntry).toHaveBeenCalledWith({
        date: '2024-01-15',
        weight: 75.5,
        weightUnit: 'kg',
        waistSize: 85.0,
        waistUnit: 'cm'
      });
    });

    it('should handle form submission errors', async () => {
      mockApiService.saveEntry.mockResolvedValue({ success: false, message: 'Invalid data' });

      const form = document.getElementById('healthForm') as HTMLFormElement;
      const submitEvent = new Event('submit');
      form.dispatchEvent(submitEvent);

      await new Promise(resolve => setTimeout(resolve, 100));

      const messageContainer = document.getElementById('messageContainer');
      expect(messageContainer?.children.length).toBeGreaterThan(0);
    });

    it('should handle invalid form inputs by sending NaN values to API', async () => {
      mockApiService.saveEntry.mockResolvedValue({ success: false, message: 'Invalid data' });

      // Set invalid form values
      (document.getElementById('weight') as HTMLInputElement).value = '';
      (document.getElementById('waistSize') as HTMLInputElement).value = '';

      const form = document.getElementById('healthForm') as HTMLFormElement;
      const submitEvent = new Event('submit');
      form.dispatchEvent(submitEvent);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should call API with NaN values (backend will handle validation)
      expect(mockApiService.saveEntry).toHaveBeenCalledWith({
        date: expect.any(String),
        weight: NaN,
        weightUnit: 'kg',
        waistSize: NaN,
        waistUnit: 'cm'
      });
    });
  });

  describe('Filter functionality', () => {
    it('should handle time filter changes', async () => {
      const filter1M = document.getElementById('filter-1M') as HTMLButtonElement;
      const filterAll = document.getElementById('filter-all') as HTMLButtonElement;

      filter1M.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(filter1M.classList.contains('active')).toBe(true);
      expect(filterAll.classList.contains('active')).toBe(false);
      expect(mockApiService.getChart).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: expect.any(String)
        })
      );
    });

    it('should handle measurement filter changes', async () => {
      const measurementWeight = document.getElementById('measurement-weight') as HTMLButtonElement;
      const measurementAll = document.getElementById('measurement-all') as HTMLButtonElement;

      measurementWeight.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(measurementWeight.classList.contains('active')).toBe(true);
      expect(measurementAll.classList.contains('active')).toBe(false);
      expect(mockApiService.getChart).toHaveBeenCalledWith(
        expect.objectContaining({
          measurementFilter: 'weight'
        })
      );
    });

    it('should handle "All Time" filter', async () => {
      // First click another filter
      const filter1M = document.getElementById('filter-1M') as HTMLButtonElement;
      filter1M.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      // Then click "All Time"
      const filterAll = document.getElementById('filter-all') as HTMLButtonElement;
      filterAll.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(filterAll.classList.contains('active')).toBe(true);
      expect(filter1M.classList.contains('active')).toBe(false);
    });
  });

  describe('Unit synchronization', () => {
    it('should sync form unit changes to history section', () => {
      const formWeightUnit = document.getElementById('weightUnit') as HTMLSelectElement;
      const historyWeightUnit = document.getElementById('historyWeightUnit') as HTMLSelectElement;

      formWeightUnit.value = 'lbs';
      formWeightUnit.dispatchEvent(new Event('change'));

      expect(historyWeightUnit.value).toBe('lbs');
    });

    it('should sync history unit changes to form section', () => {
      const formWaistUnit = document.getElementById('waistUnit') as HTMLSelectElement;
      const historyWaistUnit = document.getElementById('historyWaistUnit') as HTMLSelectElement;

      historyWaistUnit.value = 'inches';
      historyWaistUnit.dispatchEvent(new Event('change'));

      expect(formWaistUnit.value).toBe('inches');
    });

    it('should refresh chart and history when units change', async () => {
      const historyWeightUnit = document.getElementById('historyWeightUnit') as HTMLSelectElement;

      historyWeightUnit.value = 'lbs';
      historyWeightUnit.dispatchEvent(new Event('change'));

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(mockApiService.getChart).toHaveBeenCalledWith(
        expect.objectContaining({
          weightUnit: 'lbs'
        })
      );
      expect(mockApiService.getEntries).toHaveBeenCalledWith(
        expect.objectContaining({
          weightUnit: 'lbs'
        })
      );
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      // Mock data with more than 25 entries
      const mockData = Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        weight: 75.0,
        weightUnit: 'kg' as const,
        waistSize: 85.0,
        waistUnit: 'cm' as const
      }));

      mockApiService.getEntries.mockResolvedValue({ success: true, data: mockData });
    });

    it('should show pagination when entries exceed 25', async () => {
      // Trigger data load
      controller = new HealthProgressController(
        mockApiService,
        mockUnitConversionService,
        mockLocalStorageService
      );

      await new Promise(resolve => setTimeout(resolve, 100));

      const pagination = document.getElementById('pagination');
      expect(pagination?.classList.contains('hidden')).toBe(false);
    });

    it('should handle next page navigation', async () => {
      controller = new HealthProgressController(
        mockApiService,
        mockUnitConversionService,
        mockLocalStorageService
      );

      await new Promise(resolve => setTimeout(resolve, 100));

      const nextButton = document.getElementById('nextPage') as HTMLButtonElement;
      const prevButton = document.getElementById('prevPage') as HTMLButtonElement;

      expect(prevButton.disabled).toBe(true);
      expect(nextButton.disabled).toBe(false);

      nextButton.click();

      expect(prevButton.disabled).toBe(false);
    });

    it('should update pagination display correctly', async () => {
      controller = new HealthProgressController(
        mockApiService,
        mockUnitConversionService,
        mockLocalStorageService
      );

      await new Promise(resolve => setTimeout(resolve, 100));

      const entriesStart = document.getElementById('entriesStart') as HTMLElement;
      const entriesEnd = document.getElementById('entriesEnd') as HTMLElement;
      const entriesTotal = document.getElementById('entriesTotal') as HTMLElement;

      expect(entriesStart.textContent).toBe('1');
      expect(entriesEnd.textContent).toBe('25');
      expect(entriesTotal.textContent).toBe('30');
    });
  });

  describe('Chart handling', () => {
    it('should display chart when data is available', async () => {
      mockApiService.getChart.mockResolvedValue({ 
        success: true, 
        chartHtml: '<script>Plotly.newPlot("chart", [], {});</script>',
        dataPoints: 5
      });

      controller = new HealthProgressController(
        mockApiService,
        mockUnitConversionService,
        mockLocalStorageService
      );

      await new Promise(resolve => setTimeout(resolve, 100));

      const chartContainer = document.getElementById('chartContainer');
      const noDataContainer = document.getElementById('noDataContainer');

      expect(chartContainer?.style.display).not.toBe('none');
      expect(noDataContainer?.style.display).toBe('none');
    });

    it('should display no data message when chart has no data', async () => {
      mockApiService.getChart.mockResolvedValue({ 
        success: true, 
        chartHtml: '<script>test</script>',
        dataPoints: 0
      });

      controller = new HealthProgressController(
        mockApiService,
        mockUnitConversionService,
        mockLocalStorageService
      );

      await new Promise(resolve => setTimeout(resolve, 100));

      const chartContainer = document.getElementById('chartContainer');
      const noDataContainer = document.getElementById('noDataContainer');

      expect(chartContainer?.style.display).toBe('none');
      expect(noDataContainer?.style.display).not.toBe('none');
    });

    it('should handle chart API errors gracefully', async () => {
      mockApiService.getChart.mockResolvedValue({ success: false, message: 'Chart error' });

      controller = new HealthProgressController(
        mockApiService,
        mockUnitConversionService,
        mockLocalStorageService
      );

      await new Promise(resolve => setTimeout(resolve, 100));

      // Should not throw and should handle error gracefully
      expect(controller).toBeDefined();
    });
  });
});