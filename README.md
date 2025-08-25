# Health Progress Tracker

A comprehensive web application for tracking health progress with weight and waist measurements. Built with Node.js, Express, SQLite, TypeScript, and Plotly.js.

## Features

- **Data Entry**: Log weight (kg/lbs) and waist measurements (cm/inches)
- **Progress Visualization**: Interactive charts powered by Plotly.js
- **Time Filtering**: View progress over 1 month, 3 months, 6 months, or all time
- **Unit Conversion**: Automatic conversion and storage in standard units (kg/cm)
- **Responsive Design**: Clean, mobile-friendly interface with Tailwind CSS
- **Data Persistence**: SQLite database for reliable data storage
- **Comprehensive Testing**: Full test coverage for backend and frontend

## Requirements

- Node.js (v16 or higher)
- npm (v7 or higher)

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Build and start the application**:
   ```bash
   npm start
   ```

3. **Access the application**:
   Open your browser and go to `http://localhost:3000`

## Development

### Development Mode
Run the application in development mode with hot reloading:
```bash
npm run dev
```

### Build Only
Build the TypeScript files and frontend bundle:
```bash
npm run build
```

### Testing
Run the comprehensive test suite:
```bash
npm test
```

Run tests in watch mode during development:
```bash
npm run test:watch
```

## Architecture

### Backend Structure
```
src/backend/
├── controllers/     # API request handlers
├── services/       # Business logic layer
├── database/       # Database connection and models
└── routes/         # API route definitions
```

### Frontend Structure
```
src/frontend/
├── index.html      # Main HTML template
├── app.ts         # TypeScript application logic
└── styles.css     # Custom CSS styles
```

### Database Schema
The application uses a simple SQLite table:
```sql
CREATE TABLE health_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    weight REAL NOT NULL,        -- Always stored in kg
    waist REAL NOT NULL,         -- Always stored in cm
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Health Check
- `GET /api/health` - Returns API status

### Data Management
- `POST /api/entries` - Save a new health entry
- `GET /api/entries` - Retrieve health entries with optional filtering
  - Query parameters: `startDate`, `endDate`, `weightUnit`, `waistUnit`

### Charts
- `GET /api/chart` - Generate chart data
  - Query parameters: `startDate`, `endDate`, `measurementFilter`

## Key Features

### Automatic Unit Conversion
All measurements are automatically converted and stored in standard units:
- Weight: Always stored in kilograms
- Waist: Always stored in centimeters

When retrieving data, measurements are converted back to the user's preferred units for display.

### Time-based Filtering
Users can filter their progress data by:
- Last 1 month
- Last 3 months  
- Last 6 months
- All time

### Interactive Charts
Charts are generated server-side using chart configuration and rendered client-side with Plotly.js:
- Dual y-axis support for showing both weight and waist measurements
- Responsive design that adapts to different screen sizes
- Interactive hover tooltips and controls

### Data Validation
Comprehensive validation ensures data integrity:
- Date format validation (YYYY-MM-DD)
- Reasonable range validation for measurements
- Unit validation (kg/lbs for weight, cm/inches for waist)
- Positive number validation

### Pagination
History table supports pagination for large datasets:
- 25 entries per page
- Navigation controls for browsing through historical data
- Automatic hiding when not needed

## Testing

The application includes comprehensive test coverage:

### Backend Tests
- Database operations and unit conversion
- Service layer business logic
- API endpoint functionality
- Error handling and validation

### Frontend Tests
- User interface interactions
- Form submission and validation
- Filter functionality
- Pagination logic

### Running Tests
```bash
# Run all tests with coverage report
npm test

# Run tests in watch mode
npm run test:watch
```

## Cross-Platform Compatibility

The application is designed to run on:
- Windows
- macOS
- Linux

All dependencies are cross-platform compatible, and the build process works consistently across operating systems.

## Project Structure

```
health-progress-tracker/
├── src/
│   ├── backend/
│   │   ├── controllers/
│   │   ├── database/
│   │   ├── routes/
│   │   └── services/
│   ├── frontend/
│   │   ├── app.ts
│   │   ├── index.html
│   │   └── styles.css
│   ├── tests/
│   └── server.ts
├── dist/              # Build output
├── coverage/          # Test coverage reports
├── health_tracker.db  # SQLite database (created automatically)
├── package.json
├── tsconfig.json
├── webpack.config.js
├── jest.config.js
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.