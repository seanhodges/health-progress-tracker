import { convertWeight, convertWaist } from '../utils/unitConversion';

interface HealthEntry {
    id?: number;
    date: string;
    weight: number;
    weightUnit: 'kg' | 'lbs';
    waistSize: number;
    waistUnit: 'cm' | 'inches';
    createdAt?: string;
}

interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    chartHtml?: string;
    dataPoints?: number;
}

export class HealthProgressTracker {
    private currentTimeFilter: string = 'all';
    private currentMeasurementFilter: string = 'all';
    private currentPage: number = 1;
    private entriesPerPage: number = 25;
    private allEntries: HealthEntry[] = [];
    private currentWeightUnit: 'kg' | 'lbs' = 'kg';
    private currentWaistUnit: 'cm' | 'inches' = 'cm';
    private isUpdatingUnits: boolean = false;

    constructor() {
        this.init();
    }

    private init(): void {
        console.log("Initialised");
        this.loadSavedUnits();
        this.setupEventListeners();
        this.setDefaultDate();
        this.syncUnitsAcrossSections();
        this.loadInitialData();
    }

    private loadSavedUnits(): void {
        try {
            const savedWeightUnit = localStorage.getItem('healthTracker_weightUnit') as 'kg' | 'lbs';
            const savedWaistUnit = localStorage.getItem('healthTracker_waistUnit') as 'cm' | 'inches';
            
            if (savedWeightUnit && (savedWeightUnit === 'kg' || savedWeightUnit === 'lbs')) {
                this.currentWeightUnit = savedWeightUnit;
            }
            
            if (savedWaistUnit && (savedWaistUnit === 'cm' || savedWaistUnit === 'inches')) {
                this.currentWaistUnit = savedWaistUnit;
            }
        } catch (error) {
            console.warn('Failed to load saved units from localStorage:', error);
        }
    }

    private saveUnits(): void {
        try {
            localStorage.setItem('healthTracker_weightUnit', this.currentWeightUnit);
            localStorage.setItem('healthTracker_waistUnit', this.currentWaistUnit);
        } catch (error) {
            console.warn('Failed to save units to localStorage:', error);
        }
    }

    private syncUnitsAcrossSections(): void {
        // Sync all unit selectors to current values during initialization
        this.isUpdatingUnits = true;
        
        // Form unit selectors
        const formWeightUnit = document.getElementById('weightUnit') as HTMLSelectElement;
        const formWaistUnit = document.getElementById('waistUnit') as HTMLSelectElement;
        
        // History unit selectors
        const historyWeightUnit = document.getElementById('historyWeightUnit') as HTMLSelectElement;
        const historyWaistUnit = document.getElementById('historyWaistUnit') as HTMLSelectElement;
        
        if (formWeightUnit) formWeightUnit.value = this.currentWeightUnit;
        if (formWaistUnit) formWaistUnit.value = this.currentWaistUnit;
        if (historyWeightUnit) historyWeightUnit.value = this.currentWeightUnit;
        if (historyWaistUnit) historyWaistUnit.value = this.currentWaistUnit;
        
        this.isUpdatingUnits = false;
        
        // Save current units to localStorage if they weren't previously saved
        this.saveUnits();
    }


    private setupEventListeners(): void {
        // Form submission
        const form = document.getElementById('healthForm') as HTMLFormElement;
        form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Filter buttons
        document.querySelectorAll('.time-filter').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleTimeFilter(e));
        });

        document.querySelectorAll('.measurement-filter').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleMeasurementFilter(e));
        });

        // Unit change listeners - separate handlers for form vs history
        const formWeightUnit = document.getElementById('weightUnit') as HTMLSelectElement;
        const formWaistUnit = document.getElementById('waistUnit') as HTMLSelectElement;
        const historyWeightUnit = document.getElementById('historyWeightUnit') as HTMLSelectElement;
        const historyWaistUnit = document.getElementById('historyWaistUnit') as HTMLSelectElement;
        
        // Form unit selectors - these convert input values
        if (formWeightUnit) {
            formWeightUnit.addEventListener('change', (e) => this.handleFormWeightUnitChange(e));
        }
        
        if (formWaistUnit) {
            formWaistUnit.addEventListener('change', (e) => this.handleFormWaistUnitChange(e));
        }
        
        // History unit selectors - these only sync and update display
        if (historyWeightUnit) {
            historyWeightUnit.addEventListener('change', (e) => this.handleHistoryUnitChange(e));
        }
        
        if (historyWaistUnit) {
            historyWaistUnit.addEventListener('change', (e) => this.handleHistoryUnitChange(e));
        }

        // Pagination
        document.getElementById('prevPage')?.addEventListener('click', () => this.changePage(-1));
        document.getElementById('nextPage')?.addEventListener('click', () => this.changePage(1));
    }

    private setDefaultDate(): void {
        const dateInput = document.getElementById('date') as HTMLInputElement;
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        dateInput.value = formattedDate;
    }

    private async loadInitialData(): Promise<void> {
        await Promise.all([
            this.updateChart(),
            this.loadHistoryData()
        ]);
    }

    private async handleFormSubmit(e: Event): Promise<void> {
        e.preventDefault();
        
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const saveButton = document.getElementById('saveButton') as HTMLButtonElement;
        
        // Show loading state
        saveButton.classList.add('loading');
        saveButton.disabled = true;
        saveButton.textContent = 'Saving...';

        try {
            const entry: HealthEntry = {
                date: formData.get('date') as string,
                weight: parseFloat(formData.get('weight') as string),
                weightUnit: formData.get('weightUnit') as 'kg' | 'lbs',
                waistSize: parseFloat(formData.get('waistSize') as string),
                waistUnit: formData.get('waistUnit') as 'cm' | 'inches'
            };

            const response = await this.saveEntry(entry);
            
            if (response.success) {
                this.showMessage('Entry saved successfully!', 'success');
                form.reset();
                this.setDefaultDate();
                
                // Refresh data
                await Promise.all([
                    this.updateChart(),
                    this.loadHistoryData()
                ]);
            } else {
                this.showMessage(response.message || 'Failed to save entry', 'error');
            }
        } catch (error) {
            console.error('Error saving entry:', error);
            this.showMessage('An error occurred while saving the entry', 'error');
        } finally {
            // Reset button state
            saveButton.classList.remove('loading');
            saveButton.disabled = false;
            saveButton.textContent = 'Save Progress';
        }
    }

    private async saveEntry(entry: HealthEntry): Promise<ApiResponse> {
        const response = await fetch('/api/entries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(entry)
        });

        return await response.json();
    }

    private handleTimeFilter(e: Event): void {
        const button = e.target as HTMLButtonElement;
        const filterId = button.id.replace('filter-', '');

        // Update active state
        document.querySelectorAll('.time-filter').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        this.currentTimeFilter = filterId;
        this.currentPage = 1;

        // Update chart and history
        Promise.all([
            this.updateChart(),
            this.loadHistoryData()
        ]);
    }

    private handleMeasurementFilter(e: Event): void {
        const button = e.target as HTMLButtonElement;
        const filterId = button.id.replace('measurement-', '');

        // Update active state
        document.querySelectorAll('.measurement-filter').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        this.currentMeasurementFilter = filterId;

        // Update only chart (measurement filter doesn't affect history)
        this.updateChart();
    }

    private handleFormWeightUnitChange(e: Event): void {
        const select = e.target as HTMLSelectElement;
        const newUnit = select.value as 'kg' | 'lbs';
        const oldUnit = this.currentWeightUnit;
        
        // Convert form input value if units are different
        if (oldUnit !== newUnit) {
            const weightInput = document.getElementById('weight') as HTMLInputElement;
            if (weightInput && weightInput.value && !isNaN(parseFloat(weightInput.value))) {
                const currentValue = parseFloat(weightInput.value);
                const convertedValue = convertWeight(currentValue, oldUnit, newUnit);
                weightInput.value = convertedValue.toFixed(1);
            }
        }
        
        this.currentWeightUnit = newUnit;
        this.saveUnits();
        
        // Update history unit selector without triggering its event
        this.isUpdatingUnits = true;
        const historyWeightUnit = document.getElementById('historyWeightUnit') as HTMLSelectElement;
        if (historyWeightUnit) historyWeightUnit.value = newUnit;
        this.isUpdatingUnits = false;
        
        // Update history table and chart
        this.updateHistoryTable();
        if (this.currentMeasurementFilter === 'weight' || this.currentMeasurementFilter === 'all') {
            this.updateChart();
        }
    }

    private handleFormWaistUnitChange(e: Event): void {
        const select = e.target as HTMLSelectElement;
        const newUnit = select.value as 'cm' | 'inches';
        const oldUnit = this.currentWaistUnit;
        
        // Convert form input value if units are different
        if (oldUnit !== newUnit) {
            const waistInput = document.getElementById('waistSize') as HTMLInputElement;
            if (waistInput && waistInput.value && !isNaN(parseFloat(waistInput.value))) {
                const currentValue = parseFloat(waistInput.value);
                const convertedValue = convertWaist(currentValue, oldUnit, newUnit);
                waistInput.value = convertedValue.toFixed(1);
            }
        }
        
        this.currentWaistUnit = newUnit;
        this.saveUnits();
        
        // Update history unit selector without triggering its event
        this.isUpdatingUnits = true;
        const historyWaistUnit = document.getElementById('historyWaistUnit') as HTMLSelectElement;
        if (historyWaistUnit) historyWaistUnit.value = newUnit;
        this.isUpdatingUnits = false;
        
        // Update history table and chart
        this.updateHistoryTable();
        if (this.currentMeasurementFilter === 'waist' || this.currentMeasurementFilter === 'all') {
            this.updateChart();
        }
    }

    private handleHistoryUnitChange(e: Event): void {
        // Prevent recursive calls during unit synchronization
        if (this.isUpdatingUnits) return;
        
        const select = e.target as HTMLSelectElement;
        const isWeightUnit = select.id === 'historyWeightUnit';
        const newUnit = select.value;
        
        if (isWeightUnit) {
            this.currentWeightUnit = newUnit as 'kg' | 'lbs';
            // Update form unit selector without triggering its event
            this.isUpdatingUnits = true;
            const formWeightUnit = document.getElementById('weightUnit') as HTMLSelectElement;
            if (formWeightUnit) formWeightUnit.value = newUnit;
            this.isUpdatingUnits = false;
        } else {
            this.currentWaistUnit = newUnit as 'cm' | 'inches';
            // Update form unit selector without triggering its event
            this.isUpdatingUnits = true;
            const formWaistUnit = document.getElementById('waistUnit') as HTMLSelectElement;
            if (formWaistUnit) formWaistUnit.value = newUnit;
            this.isUpdatingUnits = false;
        }
        
        this.saveUnits();
        
        // Update history table and chart
        this.updateHistoryTable();
        if ((isWeightUnit && (this.currentMeasurementFilter === 'weight' || this.currentMeasurementFilter === 'all')) ||
            (!isWeightUnit && (this.currentMeasurementFilter === 'waist' || this.currentMeasurementFilter === 'all'))) {
            this.updateChart();
        }
    }

    private getDateRange(): { startDate?: string; endDate?: string } {
        if (this.currentTimeFilter === 'all') {
            return {};
        }

        const today = new Date();
        const startDate = new Date();

        switch (this.currentTimeFilter) {
            case '1M':
                startDate.setMonth(today.getMonth() - 1);
                break;
            case '3M':
                startDate.setMonth(today.getMonth() - 3);
                break;
            case '6M':
                startDate.setMonth(today.getMonth() - 6);
                break;
            default:
                return {};
        }

        return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0]
        };
    }

    private async updateChart(): Promise<void> {
        try {
            const { startDate, endDate } = this.getDateRange();
            const params = new URLSearchParams();
            
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            params.append('measurementFilter', this.currentMeasurementFilter);
            params.append('weightUnit', this.currentWeightUnit);
            params.append('waistUnit', this.currentWaistUnit);

            const response = await fetch(`/api/chart?${params}`);
            const result: ApiResponse = await response.json();

            const chartToolbar = document.getElementById('chartToolbar');
            const chartContainer = document.getElementById('chartContainer');
            const noDataContainer = document.getElementById('noDataContainer');
            const placeholder = document.getElementById('chartPlaceholder');
            
            if (result.success) {
                if (result.dataPoints && result.dataPoints > 0) {
                    // Show chart with toolbar and hide no data message
                    if (chartToolbar) chartToolbar.style.display = 'flex';
                    if (chartContainer) chartContainer.style.display = 'block';
                    if (noDataContainer) noDataContainer.style.display = 'none';
                    if (placeholder) placeholder.style.display = 'none';
                    
                    // Execute the chart script directly
                    if (result.chartHtml) {
                        const scriptElement = document.createElement('script');
                        scriptElement.textContent = result.chartHtml.replace(/<\/?script>/g, '');
                        document.head.appendChild(scriptElement);
                        document.head.removeChild(scriptElement);
                    }
                } else {
                    // No data available - hide chart/toolbar and show no data message
                    if (chartToolbar) chartToolbar.style.display = 'none';
                    if (chartContainer) chartContainer.style.display = 'none';
                    if (noDataContainer) noDataContainer.style.display = 'flex';
                }
            }
        } catch (error) {
            console.error('Error updating chart:', error);
            this.showMessage('Failed to load chart', 'error');
            
            // On error, show no data message
            const chartToolbar = document.getElementById('chartToolbar');
            const chartContainer = document.getElementById('chartContainer');
            const noDataContainer = document.getElementById('noDataContainer');
            
            if (chartToolbar) chartToolbar.style.display = 'none';
            if (chartContainer) chartContainer.style.display = 'none';
            if (noDataContainer) noDataContainer.style.display = 'flex';
        }
    }

    private async loadHistoryData(): Promise<void> {
        try {
            const { startDate, endDate } = this.getDateRange();
            
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            params.append('weightUnit', this.currentWeightUnit);
            params.append('waistUnit', this.currentWaistUnit);

            const response = await fetch(`/api/entries?${params}`);
            const result: ApiResponse<HealthEntry[]> = await response.json();

            if (result.success && result.data) {
                this.allEntries = result.data;
                this.updateHistoryTable();
            }
        } catch (error) {
            console.error('Error loading history:', error);
            this.showMessage('Failed to load history', 'error');
        }
    }

    private updateHistoryTable(): void {
        const tbody = document.getElementById('historyTableBody');
        const pagination = document.getElementById('pagination');
        
        if (!tbody || !pagination) return;

        const startIndex = (this.currentPage - 1) * this.entriesPerPage;
        const endIndex = startIndex + this.entriesPerPage;
        const paginatedEntries = this.allEntries.slice(startIndex, endIndex);

        // Clear existing rows
        tbody.innerHTML = '';

        // Populate table
        if (paginatedEntries.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="3" class="px-6 py-8 text-center text-gray-500">
                        No entries found for the selected time period
                    </td>
                </tr>
            `;
        } else {
            paginatedEntries.forEach(entry => {
                const row = document.createElement('tr');
                const formattedDate = this.formatDate(entry.date);
                const formattedWeight = `${entry.weight.toFixed(1)} ${entry.weightUnit}`;
                const formattedWaist = `${entry.waistSize.toFixed(1)} ${entry.waistUnit}`;
                
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formattedDate}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formattedWeight}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formattedWaist}</td>
                `;
                tbody.appendChild(row);
            });
        }

        // Update pagination
        this.updatePagination();
    }

    private updatePagination(): void {
        const totalEntries = this.allEntries.length;
        const totalPages = Math.ceil(totalEntries / this.entriesPerPage);
        
        if (totalPages <= 1) {
            document.getElementById('pagination')?.classList.add('hidden');
            return;
        }

        document.getElementById('pagination')?.classList.remove('hidden');

        const startEntry = (this.currentPage - 1) * this.entriesPerPage + 1;
        const endEntry = Math.min(this.currentPage * this.entriesPerPage, totalEntries);

        // Update pagination info
        const entriesStart = document.getElementById('entriesStart');
        const entriesEnd = document.getElementById('entriesEnd');
        const entriesTotal = document.getElementById('entriesTotal');

        if (entriesStart) entriesStart.textContent = startEntry.toString();
        if (entriesEnd) entriesEnd.textContent = endEntry.toString();
        if (entriesTotal) entriesTotal.textContent = totalEntries.toString();

        // Update pagination buttons
        const prevButton = document.getElementById('prevPage') as HTMLButtonElement;
        const nextButton = document.getElementById('nextPage') as HTMLButtonElement;

        if (prevButton) prevButton.disabled = this.currentPage === 1;
        if (nextButton) nextButton.disabled = this.currentPage === totalPages;
    }

    private changePage(direction: number): void {
        const totalPages = Math.ceil(this.allEntries.length / this.entriesPerPage);
        const newPage = this.currentPage + direction;

        if (newPage >= 1 && newPage <= totalPages) {
            this.currentPage = newPage;
            this.updateHistoryTable();
        }
    }

    private formatDate(dateString: string): string {
        const date = new Date(dateString + 'T00:00:00'); // Ensure local timezone
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    private showMessage(message: string, type: 'success' | 'error'): void {
        const container = document.getElementById('messageContainer');
        if (!container) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type} hide`;
        messageDiv.textContent = message;

        container.appendChild(messageDiv);

        // Trigger animation
        setTimeout(() => messageDiv.classList.replace('hide', 'show'), 100);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            messageDiv.classList.replace('show', 'hide');
            setTimeout(() => container.removeChild(messageDiv), 300);
        }, 5000);
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