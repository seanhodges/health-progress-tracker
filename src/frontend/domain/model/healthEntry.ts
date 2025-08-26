/**
 * Frontend domain model for Health Entry
 */
export interface HealthEntry {
    id?: number;
    date: string;
    weight: number;
    weightUnit: 'kg' | 'lbs' | 'st';
    waistSize: number;
    waistUnit: 'cm' | 'inches';
    createdAt?: string;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    id?: number;
    chartHtml?: string;
    dataPoints?: number;
}