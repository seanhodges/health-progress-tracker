/**
 * @jest-environment jsdom
 */

// Mock fetch for testing
global.fetch = jest.fn();

// Mock Plotly for frontend tests
(global as any).Plotly = {
  newPlot: jest.fn()
};

// Import after setting up mocks
import '../frontend/app';

describe('Frontend HealthProgressTracker', () => {
  let mockFetch: jest.MockedFunction<typeof fetch>;

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

    mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Date handling', () => {
    it('should set default date to today', () => {
      const dateInput = document.getElementById('date') as HTMLInputElement;
      const today = new Date().toISOString().split('T')[0];
      
      // Trigger DOMContentLoaded to initialize the app
      document.dispatchEvent(new Event('DOMContentLoaded'));
      
      expect(dateInput.value).toBe(today);
    });
  });

  describe('Form submission', () => {
    it('should submit form with correct data', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, id: 1 })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, chartHtml: '<script>test</script>' })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: [] })
        } as Response);

      // Set form values
      (document.getElementById('date') as HTMLInputElement).value = '2024-01-15';
      (document.getElementById('weight') as HTMLInputElement).value = '75.5';
      (document.getElementById('weightUnit') as HTMLSelectElement).value = 'kg';
      (document.getElementById('waistSize') as HTMLInputElement).value = '85.0';
      (document.getElementById('waistUnit') as HTMLSelectElement).value = 'cm';

      // Initialize app
      document.dispatchEvent(new Event('DOMContentLoaded'));

      // Submit form
      const form = document.getElementById('healthForm') as HTMLFormElement;
      const submitEvent = new Event('submit');
      form.dispatchEvent(submitEvent);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockFetch).toHaveBeenCalledWith('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0], // Use today's date
          weight: 75.5,
          weightUnit: 'kg',
          waistSize: 85.0,
          waistUnit: 'cm'
        })
      });
    });

    it('should show error message on failed submission', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: false, message: 'Invalid data' })
      } as Response);

      // Initialize app
      document.dispatchEvent(new Event('DOMContentLoaded'));

      // Set form values and submit
      const form = document.getElementById('healthForm') as HTMLFormElement;
      const submitEvent = new Event('submit');
      form.dispatchEvent(submitEvent);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      const messageContainer = document.getElementById('messageContainer');
      expect(messageContainer?.children.length).toBeGreaterThan(0);
    });
  });

  describe('Filter functionality', () => {
    beforeEach(() => {
      mockFetch
        .mockResolvedValue({
          ok: true,
          json: async () => ({ success: true, chartHtml: '<script>test</script>', data: [] })
        } as Response);

      // Initialize app
      document.dispatchEvent(new Event('DOMContentLoaded'));
    });

    it('should handle time filter clicks', async () => {
      const filter1M = document.getElementById('filter-1M') as HTMLButtonElement;
      const filterAll = document.getElementById('filter-all') as HTMLButtonElement;

      // Click 1M filter
      filter1M.click();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(filter1M.classList.contains('active')).toBe(true);
      expect(filterAll.classList.contains('active')).toBe(false);
    });

    it('should handle measurement filter clicks', async () => {
      const measurementWeight = document.getElementById('measurement-weight') as HTMLButtonElement;
      const measurementAll = document.getElementById('measurement-all') as HTMLButtonElement;

      // Click weight filter
      measurementWeight.click();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(measurementWeight.classList.contains('active')).toBe(true);
      expect(measurementAll.classList.contains('active')).toBe(false);
    });
  });

  describe('History table', () => {
    it('should update history when unit selectors change', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: [
            {
              id: 1,
              date: '2024-01-15',
              weight: 75.5,
              weightUnit: 'kg',
              waistSize: 85.0,
              waistUnit: 'cm'
            }
          ]
        })
      } as Response);

      // Initialize app
      document.dispatchEvent(new Event('DOMContentLoaded'));

      // Change history weight unit
      const historyWeightUnit = document.getElementById('historyWeightUnit') as HTMLSelectElement;
      historyWeightUnit.value = 'lbs';
      historyWeightUnit.dispatchEvent(new Event('change'));

      await new Promise(resolve => setTimeout(resolve, 100));

      // Should have made a call to get entries with lbs unit
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('weightUnit=lbs')
      );
    });

    it('should format dates correctly in history table', async () => {
      // Mock fetch for multiple API calls
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            chartHtml: '<script>Plotly.newPlot("chart", [], {});</script>',
            dataPoints: 1
          })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: [
              {
                id: 1,
                date: '2024-01-15',
                weight: 75.5,
                weightUnit: 'kg',
                waistSize: 85.0,
                waistUnit: 'cm'
              }
            ]
          })
        } as Response);

      // Initialize app
      document.dispatchEvent(new Event('DOMContentLoaded'));

      await new Promise(resolve => setTimeout(resolve, 200));

      const historyTableBody = document.getElementById('historyTableBody');
      expect(historyTableBody?.innerHTML).toContain('15/01/2024');
    });
  });

  describe('Pagination', () => {
    it('should show pagination when entries exceed 25', async () => {
      // Create mock data with more than 25 entries
      const mockData = Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        weight: 75.0,
        weightUnit: 'kg' as const,
        waistSize: 85.0,
        waistUnit: 'cm' as const
      }));

      // Mock both chart and entries API calls
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            chartHtml: '<script>Plotly.newPlot("chart", [], {});</script>',
            dataPoints: 30
          })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: mockData })
        } as Response);

      // Initialize app
      document.dispatchEvent(new Event('DOMContentLoaded'));

      await new Promise(resolve => setTimeout(resolve, 200));

      const pagination = document.getElementById('pagination');
      expect(pagination?.classList.contains('hidden')).toBe(false);
    });

    it('should handle pagination navigation', async () => {
      // Create mock data with more than 25 entries
      const mockData = Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        weight: 75.0,
        weightUnit: 'kg' as const,
        waistSize: 85.0,
        waistUnit: 'cm' as const
      }));

      // Mock both chart and entries API calls
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            chartHtml: '<script>Plotly.newPlot("chart", [], {});</script>',
            dataPoints: 30
          })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: mockData })
        } as Response);

      // Initialize app
      document.dispatchEvent(new Event('DOMContentLoaded'));

      await new Promise(resolve => setTimeout(resolve, 200));

      const nextButton = document.getElementById('nextPage') as HTMLButtonElement;
      const prevButton = document.getElementById('prevPage') as HTMLButtonElement;

      expect(prevButton.disabled).toBe(true);
      expect(nextButton.disabled).toBe(false);

      // Click next page
      nextButton.click();

      expect(prevButton.disabled).toBe(false);
    });
  });
});