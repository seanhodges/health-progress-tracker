/**
 * @jest-environment jsdom
 */

import { ApiService } from '../../../../frontend/infrastructure/http/apiService';
import { HealthEntry } from '../../../../frontend/domain/model/healthEntry';

// Mock fetch globally
global.fetch = jest.fn();

describe('ApiService', () => {
  let apiService: ApiService;
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    apiService = new ApiService();
    mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockClear();
  });

  describe('Constructor', () => {
    it('should initialize with default base URL', () => {
      const service = new ApiService();
      expect(service).toBeInstanceOf(ApiService);
    });

    it('should initialize with custom base URL', () => {
      const customUrl = 'http://localhost:3000/api';
      const service = new ApiService(customUrl);
      expect(service).toBeInstanceOf(ApiService);
    });
  });

  describe('saveEntry', () => {
    it('should make POST request to save entry', async () => {
      const mockEntry: HealthEntry = {
        date: '2024-01-15',
        weight: 75.5,
        weightUnit: 'kg',
        waistSize: 85.0,
        waistUnit: 'cm'
      };

      const mockResponse = { success: true, id: 1 };
      mockFetch.mockResolvedValue({
        json: async () => mockResponse
      } as Response);

      const result = await apiService.saveEntry(mockEntry);

      expect(mockFetch).toHaveBeenCalledWith('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mockEntry)
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors gracefully', async () => {
      const mockEntry: HealthEntry = {
        date: '2024-01-15',
        weight: 75.5,
        weightUnit: 'kg',
        waistSize: 85.0,
        waistUnit: 'cm'
      };

      const errorResponse = { success: false, message: 'Invalid data' };
      mockFetch.mockResolvedValue({
        json: async () => errorResponse
      } as Response);

      const result = await apiService.saveEntry(mockEntry);
      expect(result).toEqual(errorResponse);
    });
  });

  describe('getEntries', () => {
    it('should make GET request without parameters', async () => {
      const mockResponse = { success: true, data: [] };
      mockFetch.mockResolvedValue({
        json: async () => mockResponse
      } as Response);

      const result = await apiService.getEntries();

      expect(mockFetch).toHaveBeenCalledWith('/api/entries?');
      expect(result).toEqual(mockResponse);
    });

    it('should make GET request with date range parameters', async () => {
      const mockResponse = { success: true, data: [] };
      mockFetch.mockResolvedValue({
        json: async () => mockResponse
      } as Response);

      await apiService.getEntries({
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/entries?startDate=2024-01-01&endDate=2024-01-31');
    });

    it('should make GET request with unit parameters', async () => {
      const mockResponse = { success: true, data: [] };
      mockFetch.mockResolvedValue({
        json: async () => mockResponse
      } as Response);

      await apiService.getEntries({
        weightUnit: 'lbs',
        waistUnit: 'inches'
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/entries?weightUnit=lbs&waistUnit=inches');
    });

    it('should make GET request with all parameters', async () => {
      const mockResponse = { success: true, data: [] };
      mockFetch.mockResolvedValue({
        json: async () => mockResponse
      } as Response);

      await apiService.getEntries({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        weightUnit: 'lbs',
        waistUnit: 'inches'
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/entries?startDate=2024-01-01&endDate=2024-01-31&weightUnit=lbs&waistUnit=inches');
    });
  });

  describe('getChart', () => {
    it('should make GET request to chart endpoint without parameters', async () => {
      const mockResponse = { success: true, chartHtml: '<script>test</script>' };
      mockFetch.mockResolvedValue({
        json: async () => mockResponse
      } as Response);

      const result = await apiService.getChart();

      expect(mockFetch).toHaveBeenCalledWith('/api/chart?');
      expect(result).toEqual(mockResponse);
    });

    it('should make GET request with measurement filter', async () => {
      const mockResponse = { success: true, chartHtml: '<script>test</script>' };
      mockFetch.mockResolvedValue({
        json: async () => mockResponse
      } as Response);

      await apiService.getChart({
        measurementFilter: 'weight'
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/chart?measurementFilter=weight');
    });

    it('should make GET request with date range and units', async () => {
      const mockResponse = { success: true, chartHtml: '<script>test</script>' };
      mockFetch.mockResolvedValue({
        json: async () => mockResponse
      } as Response);

      await apiService.getChart({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        weightUnit: 'lbs',
        waistUnit: 'inches'
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/chart?startDate=2024-01-01&endDate=2024-01-31&weightUnit=lbs&waistUnit=inches');
    });

    it('should make GET request with all parameters', async () => {
      const mockResponse = { success: true, chartHtml: '<script>test</script>' };
      mockFetch.mockResolvedValue({
        json: async () => mockResponse
      } as Response);

      await apiService.getChart({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        measurementFilter: 'waist',
        weightUnit: 'kg',
        waistUnit: 'cm'
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/chart?startDate=2024-01-01&endDate=2024-01-31&measurementFilter=waist&weightUnit=kg&waistUnit=cm');
    });
  });
});