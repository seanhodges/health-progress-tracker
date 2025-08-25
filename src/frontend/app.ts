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

class HealthProgressTracker {
    private currentTimeFilter: string = 'all';
    private currentMeasurementFilter: string = 'all';
    private currentPage: number = 1;
    private entriesPerPage: number = 25;
    private allEntries: HealthEntry[] = [];

    constructor() {
        this.init();
    }

    private init(): void {
        this.setupEventListeners();
        this.setDefaultDate();
        this.loadInitialData();
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

        // History unit changes
        const historyWeightUnit = document.getElementById('historyWeightUnit') as HTMLSelectElement;
        const historyWaistUnit = document.getElementById('historyWaistUnit') as HTMLSelectElement;
        
        historyWeightUnit.addEventListener('change', () => this.updateHistoryTable());
        historyWaistUnit.addEventListener('change', () => this.updateHistoryTable());

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

            const response = await fetch(`/api/chart?${params}`);
            const result: ApiResponse = await response.json();

            if (result.success && result.chartHtml) {
                // Execute the chart script directly
                const scriptElement = document.createElement('script');
                scriptElement.textContent = result.chartHtml.replace(/<\/?script>/g, '');
                document.head.appendChild(scriptElement);
                document.head.removeChild(scriptElement);
            }
        } catch (error) {
            console.error('Error updating chart:', error);
            this.showMessage('Failed to load chart', 'error');
        }
    }

    private async loadHistoryData(): Promise<void> {
        try {
            const { startDate, endDate } = this.getDateRange();
            const historyWeightUnit = (document.getElementById('historyWeightUnit') as HTMLSelectElement).value as 'kg' | 'lbs';
            const historyWaistUnit = (document.getElementById('historyWaistUnit') as HTMLSelectElement).value as 'cm' | 'inches';
            
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            params.append('weightUnit', historyWeightUnit);
            params.append('waistUnit', historyWaistUnit);

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
document.addEventListener('DOMContentLoaded', () => {
    new HealthProgressTracker();
});