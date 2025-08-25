import { StoredHealthEntry } from '../database/connection';
import { convertWeight, convertWaist } from '../../utils/unitConversion';

export interface ChartData {
  chartHtml: string;
  data: StoredHealthEntry[];
}

export class ChartService {
  
  async generateChart(
    data: StoredHealthEntry[], 
    measurementFilter: 'weight' | 'waist' | 'all' = 'all',
    weightUnit: 'kg' | 'lbs' | 'st' = 'kg',
    waistUnit: 'cm' | 'inches' = 'cm'
  ): Promise<string> {
    
    if (!data || data.length === 0) {
      return this.generateEmptyChart();
    }

    // Filter to show only one entry per day (latest entry if multiple exist)
    const dateMap: { [date: string]: StoredHealthEntry } = {};
    data.forEach(entry => {
      if (!dateMap[entry.date] || (entry.id && dateMap[entry.date].id && entry.id > dateMap[entry.date].id!)) {
        dateMap[entry.date] = entry;
      }
    });
    
    const filteredData = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
    
    // Prepare data for plotting with unit conversion
    const dates = filteredData.map(entry => entry.date);
    const weights = filteredData.map(entry => convertWeight(entry.weight, 'kg', weightUnit));
    const waists = filteredData.map(entry => convertWaist(entry.waist, 'cm', waistUnit));

    const traces: any[] = [];

    // Add weight trace if requested
    if (measurementFilter === 'weight' || measurementFilter === 'all') {
      traces.push({
        x: dates,
        y: weights,
        type: 'scatter',
        mode: 'lines+markers',
        name: `Weight (${weightUnit})`,
        line: { color: '#3B82F6', width: 2 },
        marker: { size: 6, color: '#3B82F6' }
      });
    }

    // Add waist trace if requested
    if (measurementFilter === 'waist' || measurementFilter === 'all') {
      traces.push({
        x: dates,
        y: waists,
        type: 'scatter',
        mode: 'lines+markers',
        name: `Waist (${waistUnit})`,
        line: { color: '#EF4444', width: 2 },
        marker: { size: 6, color: '#EF4444' },
        yaxis: measurementFilter === 'all' ? 'y2' : 'y'
      });
    }

    // Configure layout
    const layout: any = {
      title: {
        text: 'Health Progress',
        font: { size: 20, color: '#1F2937' }
      },
      xaxis: {
        title: 'Date',
        type: 'date',
        tickformat: '%d/%m/%Y',
        nticks: 20,
        showgrid: true,
        gridcolor: '#E5E7EB'
      },
      yaxis: {
        title: measurementFilter === 'weight' ? `Weight (${weightUnit})` : 
               measurementFilter === 'waist' ? `Waist (${waistUnit})` : `Weight (${weightUnit})`,
        showgrid: true,
        gridcolor: '#E5E7EB',
        side: 'left'
      },
      plot_bgcolor: '#FFFFFF',
      paper_bgcolor: '#FFFFFF',
      font: { color: '#374151' },
      legend: {
        orientation: 'h',
        x: 0.5,
        xanchor: 'center',
        y: 1.1
      },
      margin: { l: 60, r: 60, t: 80, b: 60 },
      hovermode: 'x unified'
    };

    // Add second y-axis if showing both measurements
    if (measurementFilter === 'all' && traces.length === 2) {
      layout.yaxis2 = {
        title: `Waist (${waistUnit})`,
        overlaying: 'y',
        side: 'right',
        showgrid: false
      };
    }

    const config = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['pan2d', 'select2d', 'lasso2d', 'autoScale2d']
    };

    // Generate the chart data as JSON that will be used by the frontend Plotly.js
    const chartScript = `
      <script>
        (function() {
          const traces = ${JSON.stringify(traces)};
          const layout = ${JSON.stringify(layout)};
          const config = ${JSON.stringify(config)};
          
          if (typeof Plotly !== 'undefined') {
            Plotly.newPlot('chart', traces, layout, config);
          } else {
            console.error('Plotly.js is not loaded');
          }
        })();
      </script>
    `;

    return chartScript;
  }

  private generateEmptyChart(): string {
    const layout = {
      title: {
        text: 'No Data Available',
        font: { size: 20, color: '#6B7280' }
      },
      xaxis: {
        title: 'Date',
        showgrid: true,
        gridcolor: '#E5E7EB'
      },
      yaxis: {
        title: 'Measurement',
        showgrid: true,
        gridcolor: '#E5E7EB'
      },
      plot_bgcolor: '#F9FAFB',
      paper_bgcolor: '#F9FAFB',
      font: { color: '#6B7280' },
      annotations: [{
        x: 0.5,
        y: 0.5,
        xref: 'paper',
        yref: 'paper',
        text: 'Start logging your progress to see your chart',
        showarrow: false,
        font: { size: 16, color: '#9CA3AF' }
      }]
    };

    const config = {
      responsive: true,
      displayModeBar: false
    };

    return `
      <script>
        (function() {
          const layout = ${JSON.stringify(layout)};
          const config = ${JSON.stringify(config)};
          
          if (typeof Plotly !== 'undefined') {
            Plotly.newPlot('chart', [], layout, config);
          } else {
            console.error('Plotly.js is not loaded');
          }
        })();
      </script>
    `;
  }
}