import { HealthEntry, ApiResponse } from '../../domain/model/healthEntry';
import { WeightUnitType, WaistUnitType, MeasurementFilterType } from '../../domain/vo/units';

/**
 * Application service for API communication
 */
export class ApiService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  async saveEntry(entry: HealthEntry): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(entry)
    });

    return await response.json();
  }

  async getEntries(params: {
    startDate?: string;
    endDate?: string;
    weightUnit?: WeightUnitType;
    waistUnit?: WaistUnitType;
  } = {}): Promise<ApiResponse<HealthEntry[]>> {
    const searchParams = new URLSearchParams();
    
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);
    if (params.weightUnit) searchParams.append('weightUnit', params.weightUnit);
    if (params.waistUnit) searchParams.append('waistUnit', params.waistUnit);

    const response = await fetch(`${this.baseUrl}/entries?${searchParams}`);
    return await response.json();
  }

  async getChart(params: {
    startDate?: string;
    endDate?: string;
    measurementFilter?: MeasurementFilterType;
    weightUnit?: WeightUnitType;
    waistUnit?: WaistUnitType;
  } = {}): Promise<ApiResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);
    if (params.measurementFilter) searchParams.append('measurementFilter', params.measurementFilter);
    if (params.weightUnit) searchParams.append('weightUnit', params.weightUnit);
    if (params.waistUnit) searchParams.append('waistUnit', params.waistUnit);

    const response = await fetch(`${this.baseUrl}/chart?${searchParams}`);
    return await response.json();
  }
}