import { ChartService } from '../backend/services/chartService';
import { StoredHealthEntry } from '../backend/database/connection';

describe('ChartService', () => {
  let chartService: ChartService;

  beforeEach(() => {
    chartService = new ChartService();
  });

  describe('generateChart', () => {
    const mockData: StoredHealthEntry[] = [
      {
        id: 1,
        date: '2024-01-10',
        weight: 75.0,
        waist: 85.0
      },
      {
        id: 2,
        date: '2024-01-15',
        weight: 74.5,
        waist: 84.5
      },
      {
        id: 3,
        date: '2024-01-20',
        weight: 74.0,
        waist: 84.0
      }
    ];

    it('should generate chart script for all measurements', async () => {
      const result = await chartService.generateChart(mockData, 'all');

      expect(result).toContain('<script>');
      expect(result).toContain('Plotly.newPlot');
      expect(result).toContain('Weight (kg)');
      expect(result).toContain('Waist (cm)');
      expect(result).toContain('#3B82F6'); // Weight color
      expect(result).toContain('#EF4444'); // Waist color
    });

    it('should generate chart script for weight only', async () => {
      const result = await chartService.generateChart(mockData, 'weight');

      expect(result).toContain('<script>');
      expect(result).toContain('Weight (kg)');
      expect(result).not.toContain('Waist (cm)');
    });

    it('should generate chart script for waist only', async () => {
      const result = await chartService.generateChart(mockData, 'waist');

      expect(result).toContain('<script>');
      expect(result).toContain('Waist (cm)');
      expect(result).not.toContain('Weight (kg)');
    });

    it('should generate empty chart for no data', async () => {
      const result = await chartService.generateChart([], 'all');

      expect(result).toContain('<script>');
      expect(result).toContain('No Data Available');
      expect(result).toContain('Start logging your progress to see your chart');
    });

    it('should generate empty chart for null data', async () => {
      const result = await chartService.generateChart(null as any, 'all');

      expect(result).toContain('<script>');
      expect(result).toContain('No Data Available');
    });

    it('should include proper chart configuration', async () => {
      const result = await chartService.generateChart(mockData, 'all');

      expect(result).toContain('responsive: true');
      expect(result).toContain('displayModeBar: true');
      expect(result).toContain('displaylogo: false');
    });

    it('should include dual y-axes for all measurements', async () => {
      const result = await chartService.generateChart(mockData, 'all');

      expect(result).toContain('yaxis2');
      expect(result).toContain('overlaying');
      expect(result).toContain('side');
    });

    it('should not include dual y-axes for single measurement', async () => {
      const resultWeight = await chartService.generateChart(mockData, 'weight');
      const resultWaist = await chartService.generateChart(mockData, 'waist');

      expect(resultWeight).not.toContain('yaxis2');
      expect(resultWaist).not.toContain('yaxis2');
    });

    it('should handle data with all required fields', async () => {
      const result = await chartService.generateChart(mockData, 'all');
      
      // Check that all dates are included
      expect(result).toContain('2024-01-10');
      expect(result).toContain('2024-01-15');
      expect(result).toContain('2024-01-20');
      
      // Check that all weights are included
      expect(result).toContain('75');
      expect(result).toContain('74.5');
      expect(result).toContain('74');
      
      // Check that all waist measurements are included
      expect(result).toContain('85');
      expect(result).toContain('84.5');
      expect(result).toContain('84');
    });

    it('should generate valid JavaScript', async () => {
      const result = await chartService.generateChart(mockData, 'all');
      
      // Extract the JavaScript content
      const scriptContent = result.replace(/<\/?script>/g, '');
      
      // Should not throw when parsing as JavaScript (basic syntax check)
      expect(() => {
        new Function(scriptContent);
      }).not.toThrow();
    });
  });
});