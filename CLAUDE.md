# CLAUDE.md - Health Progress Tracker

## Project Overview

The Health Progress Tracker is a modern, full-stack web application for tracking health metrics (weight and waist measurements).

## Technical Stack

### Backend
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript (strict mode enabled)
- **Database**: SQLite with custom connection layer
- **Testing**: Jest with Supertest for API testing
- **Architecture**: DDD-inspired layered architecture

### Frontend
- **Language**: TypeScript
- **Bundling**: Webpack 5 with TypeScript loader
- **Styling**: Tailwind CSS
- **Charts**: Plotly.js for interactive data visualization
- **Storage**: localStorage for user preferences

### Development & Deployment
- **Build System**: TypeScript compiler + Webpack
- **Testing**: Jest with 100% test coverage requirement
- **Containerization**: Docker with multi-stage builds
- **Process Management**: Graceful shutdown handling
- **Development**: Hot reload with concurrent build processes

## Domain-Driven Design (DDD) Architecture

### Domain Model
The application is centered around the **Health** domain with the following core concepts:

#### Entities
```typescript
// Core domain entity
interface HealthEntry {
  id?: number;
  date: string;        // Value Object: Date in YYYY-MM-DD format
  weight: number;      // Value Object: Weight measurement
  weightUnit: WeightUnit;
  waistSize: number;   // Value Object: Waist measurement  
  waistUnit: WaistUnit;
  createdAt?: string;
}
```

#### Value Objects
```typescript
type WeightUnit = 'kg' | 'lbs' | 'st';
type WaistUnit = 'cm' | 'inches';
type MeasurementFilter = 'weight' | 'waist' | 'all';
type TimeFilter = '1M' | '3M' | '6M' | 'all';
```

#### Application Services
- **HealthService**: Core business logic for health entry management
- **ChartService**: Specialized service for data visualization
- **UnitConversionService**: Domain service for measurement conversions

### Layered Architecture

- **Presentation layer**: Controllers, route definitions, input validation and transformation
- **Domain layer**: Domain models, business rules, value objects, rules and invariants
- **Application layer**: Business logic and services
- **Infrastructure layer**: Database repositories and technical concerns

### DDD Principles Implementation

#### 1. Ubiquitous Language
- **Health Entry**: A recorded measurement on a specific date
- **Weight Unit**: The unit of measurement for weight (kg, lbs, st)
- **Waist Unit**: The unit of measurement for waist (cm, inches)
- **Time Filter**: Predefined time ranges for data filtering
- **Measurement Filter**: Type of measurement to display in charts

#### 2. Domain Invariants
```typescript
// Business rules enforced in domain services
class HealthService {
  private validateHealthEntry(entry: HealthEntry): void {
    // Domain rule: Weight must be within reasonable human ranges
    if (entry.weightUnit === 'kg' && (entry.weight > 500 || entry.weight < 20)) {
      throw new DomainError('Weight must be between 20kg and 500kg');
    }
    
    // Domain rule: Date cannot be in the future
    if (new Date(entry.date) > new Date()) {
      throw new DomainError('Entry date cannot be in the future');
    }
    
    // Domain rule: Measurements must be positive
    if (entry.weight <= 0 || entry.waistSize <= 0) {
      throw new DomainError('Measurements must be positive numbers');
    }
  }
}
```

#### 3. Aggregate Design
The **HealthEntry** serves as the aggregate root, encapsulating:
- Weight measurement with unit
- Waist measurement with unit
- Entry date
- Creation timestamp

#### 4. Domain Events (Implementation Ready)
```typescript
// Future expansion: Domain events for tracking changes
interface DomainEvent {
  eventType: string;
  aggregateId: string;
  timestamp: Date;
  data: any;
}

// Example events
interface HealthEntryCreated extends DomainEvent {
  eventType: 'HealthEntryCreated';
  data: HealthEntry;
}

interface WeightGoalAchieved extends DomainEvent {
  eventType: 'WeightGoalAchieved';
  data: { currentWeight: number; goalWeight: number; };
}
```

## Project Structure & File Organization

### Backend Structure
```
src/backend/
    api/                           # Presentation layer (including routes)
    api/controllers/               # Presentation controllers
    api/errors/                    # Presentation error handling
    api/validation/                # Presentation validation
    application/                   # Application layer
    application/services/          # Application services
    domain/                        # Domain layer
    domain/errors/                 # Domain errors
    domain/events/                 # Domain events
    domain/model/                  # Domain entity model
    domain/vo/                     # Domain value objects
    infrastructure/                # Infrastructure layer
    infrastructure/database/       # Sqlite database connection utilities
    infrastructure/repositories/   # Domain entity persistence and retrieval
```

### Frontend Structure
```
src/frontend/
    app.ts                         # Application entry point
    index.html                     # HTML template
    styles.css                     # Base styles
    domain/                        # Domain layer (Future expansion)
    domain/model/                  # Client-side domain entity model
    domain/vo/                     # Client-side domain value objects
    application/                   # Application layer
    application/services/          # Application services
    presentation/                  # Presentation layer
    presentation/components/       # Reusable UI components
    presentation/controllers/      # Presentation controllers
    infrastructure/                # Infrastructure layer
    infrastructure/http/           # HTTP client utilities
    infrastructure/storage/        # Storage adapters (local storage, cookies, etc)
```

### Test Structure (100% Coverage Requirement)

Test files to as closely as possible mirror the production directory structure.

## Testing Requirements & Standards

### 100% Test Coverage Mandate

#### Coverage Requirements
```json
// jest.config.js - Enforce coverage thresholds
{
  "collectCoverageFrom": [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/*.test.ts"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 100,
      "functions": 100,
      "lines": 100,
      "statements": 100
    }
  }
}
```

#### Backend Testing Strategy
```typescript
// Example: Comprehensive service testing
describe('HealthService', () => {
  // Test all business rules and domain invariants
  describe('Domain Rules Validation', () => {
    it('should reject negative weights', () => {
      expect(() => service.validateEntry({ weight: -1 }))
        .toThrow('Weight must be a positive number');
    });
    
    it('should reject future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      expect(() => service.validateEntry({ date: futureDate.toISOString() }))
        .toThrow('Entry date cannot be in the future');
    });
  });
  
  // Test all service methods with edge cases
  describe('Entry Management', () => {
    it('should save valid entries with unit conversion', async () => {
      const entry = createValidEntry({ weight: 150, weightUnit: 'lbs' });
      const result = await service.saveEntry(entry);
      expect(result.id).toBeDefined();
      // Verify stored in standard units (kg)
      const stored = await service.getEntry(result.id);
      expect(stored.weight).toBeCloseTo(68.04, 2); // 150 lbs = ~68kg
    });
  });
  
  // Test error conditions
  describe('Error Handling', () => {
    it('should handle database connection failures', async () => {
      mockDatabase.getConnection.mockRejectedValue(new Error('Connection failed'));
      await expect(service.getEntries()).rejects.toThrow('Connection failed');
    });
  });
});
```

Backend tests must be run and checked for failues after any change to the backend production code.

#### Frontend Testing Strategy
```typescript
// Example: Comprehensive UI component testing
describe('HealthProgressTracker', () => {
  let tracker: HealthProgressTracker;
  let mockApiService: jest.Mocked<ApiService>;
  
  beforeEach(() => {
    setupDOMFixture(); // Set up test DOM elements
    mockApiService = createMockApiService();
    tracker = new HealthProgressTracker(mockApiService);
  });
  
  // Test user interactions
  describe('User Interactions', () => {
    it('should submit form with valid data', async () => {
      fillFormWithValidData();
      await clickSubmitButton();
      
      expect(mockApiService.saveEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          weight: 75,
          weightUnit: 'kg'
        })
      );
      expect(getSuccessMessage()).toBeVisible();
    });
    
    it('should handle API errors gracefully', async () => {
      mockApiService.saveEntry.mockRejectedValue(new Error('Server error'));
      fillFormWithValidData();
      await clickSubmitButton();
      
      expect(getErrorMessage()).toContain('Failed to save entry');
    });
  });
  
  // Test all filter combinations
  describe('Data Filtering', () => {
    it('should apply time filters correctly', async () => {
      await selectTimeFilter('3M');
      
      expect(mockApiService.getEntries).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: expect.stringMatching(/\d{4}-\d{2}-\d{2}/),
          endDate: expect.stringMatching(/\d{4}-\d{2}-\d{2}/)
        })
      );
    });
  });
  
  // Test edge cases
  describe('Edge Cases', () => {
    it('should handle empty API responses', async () => {
      mockApiService.getEntries.mockResolvedValue({ success: true, data: [] });
      await tracker.loadHistoryData();
      
      expect(getHistoryTable()).toContain('No entries found');
    });
  });
});
```

Frontend tests must be run and checked for failues after any change to the frontend production code.

### Test Quality Standards

#### 1. Test Naming Convention
```typescript
// Pattern: should [expected behavior] when [condition]
it('should save entry with converted units when valid data provided', () => {});
it('should reject entry when weight exceeds maximum threshold', () => {});
it('should display error message when API request fails', () => {});
```

#### 2. Test Data Management
```typescript
// Test factories for consistent, maintainable test data
export const TestDataFactory = {
  createValidHealthEntry: (overrides?: Partial<HealthEntry>): HealthEntry => ({
    date: '2024-01-15',
    weight: 75.0,
    weightUnit: 'kg',
    waistSize: 85.0,
    waistUnit: 'cm',
    ...overrides
  }),
  
  createInvalidHealthEntry: (invalidField: string): Partial<HealthEntry> => {
    const base = TestDataFactory.createValidHealthEntry();
    switch (invalidField) {
      case 'negativeWeight':
        return { ...base, weight: -1 };
      case 'futureDate':
        return { ...base, date: '2030-01-01' };
      default:
        throw new Error(`Unknown invalid field: ${invalidField}`);
    }
  }
};
```

#### 3. Mock Strategy
```typescript
// Comprehensive mocking at service boundaries
const createMockDatabase = (): jest.Mocked<Database> => ({
  initialize: jest.fn().mockResolvedValue(undefined),
  insertEntry: jest.fn().mockResolvedValue(1),
  getEntries: jest.fn().mockResolvedValue([]),
  close: jest.fn().mockResolvedValue(undefined)
});

// Spy on real objects for integration tests
const createServiceSpy = (realService: HealthService) => {
  return jest.spyOn(realService, 'saveEntry').mockImplementation();
};
```

## Security Best Practices

### Input Validation & Sanitization
```typescript
// Comprehensive validation at domain boundaries
class HealthService {
  private validateHealthEntry(entry: HealthEntry): void {
    // Prevent injection attacks with strict validation
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(entry.date)) {
      throw new ValidationError('Invalid date format. Expected YYYY-MM-DD');
    }
    
    // Prevent DoS with reasonable limits
    if (entry.weight > 1000 || entry.weight < 0.1) {
      throw new ValidationError('Weight must be between 0.1 and 1000');
    }
    
    // Enum validation prevents injection
    if (!['kg', 'lbs', 'st'].includes(entry.weightUnit)) {
      throw new ValidationError('Invalid weight unit');
    }
  }
}
```

### SQL Injection Prevention
```typescript
// Parameterized queries only
async insertEntry(entry: HealthEntry): Promise<number> {
  const sql = `
    INSERT INTO health_entries (date, weight, waist, created_at)
    VALUES (?, ?, ?, datetime('now'))
  `;
  
  const result = await this.db.run(sql, [entry.date, entry.weight, entry.waistSize]);
  return result.lastID as number;
}
```

### Authentication & Authorization (Future Extension, not to be implemented unless a user restricted area is added)
```typescript
// Framework for future security enhancements
interface SecurityContext {
  userId: string;
  permissions: Permission[];
  sessionId: string;
}

interface Permission {
  resource: string;
  action: 'read' | 'write' | 'delete';
}

// Middleware for protected routes
const requireAuth = (permission: Permission) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const context = extractSecurityContext(req);
    if (!hasPermission(context, permission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

## Development Standards & Guidelines

### Code Quality Requirements

#### 1. TypeScript Strict Mode
```json
// tsconfig.json - Maximum type safety
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  }
}
```

#### 2. Code Organization Rules
- **Single Responsibility**: Each class/function has one reason to change
- **Dependency Inversion**: Depend on abstractions, not concretions
- **Interface Segregation**: Clients shouldn't depend on unused interfaces
- **Open/Closed**: Open for extension, closed for modification

#### 3. Naming Conventions
```typescript
// Domain concepts use ubiquitous language
class HealthEntryRepository { }        // Repository pattern
class WeightConversionService { }      // Domain service
interface HealthMetrics { }           // Domain concept
type MeasurementUnit = 'kg' | 'lbs';   // Value object

// Technical concerns use standard patterns
class DatabaseConnection { }          // Infrastructure
class HttpController { }             // Application layer
interface ApiResponse<T> { }         // Technical interface
```

### File Organization Standards

#### Backend File Naming
```
healthController.ts        # PascalCase class + purpose
healthService.ts           # PascalCase class + purpose  
connection.ts              # Descriptive functionality
unitConversion.ts          # Camel case utility modules
```

#### Frontend File Naming
```
app.ts                    # Application entry point
healthProgressTracker.ts  # Main application class
chartDisplay.component.ts # Component with clear suffix
apiService.ts             # Service with clear suffix
```

#### Test File Naming
```
healthService.test.ts                 # Mirrors source file name
healthController.integration.test.ts  # Integration test suffix
testHelpers.ts                        # Utility files descriptive
mockFactories.ts                      # Mock creation utilities
```

## Performance & Scalability Considerations

### Database Optimization
```sql
-- Indices for common query patterns
CREATE INDEX idx_health_entries_date ON health_entries(date DESC);
CREATE INDEX idx_health_entries_created_at ON health_entries(created_at DESC);

-- Query optimization for date ranges
EXPLAIN QUERY PLAN 
SELECT * FROM health_entries 
WHERE date BETWEEN ? AND ? 
ORDER BY date DESC;
```

### Frontend Performance
```typescript
// Lazy loading for large datasets
class DataPagination {
  private readonly pageSize = 25;
  private currentPage = 1;
  
  async loadPage(page: number): Promise<HealthEntry[]> {
    const offset = (page - 1) * this.pageSize;
    return await this.apiService.getEntries({
      limit: this.pageSize,
      offset: offset
    });
  }
}

// Debounced user input
class FilterManager {
  private filterTimeout: NodeJS.Timeout | null = null;
  
  applyFilter(criteria: FilterCriteria): void {
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }
    
    this.filterTimeout = setTimeout(() => {
      this.executeFilter(criteria);
    }, 300); // 300ms debounce
  }
}
```

This file serves as the authoritative guide for development practices, ensuring consistency, quality, and maintainability while adhering to DDD principles and requiring 100% test coverage across the entire application.