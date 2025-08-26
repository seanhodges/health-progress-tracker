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
├── presentation/   # API request handlers
├── application/    # Business logic layer
├── infrastructure/ # Database connection and persistance
└── domain/         # Domain entity model
```

### Frontend Structure
```
src/frontend/
├── index.html      # Main HTML template
├── app.ts          # TypeScript application logic
├── styles.css      # Custom CSS styles
├── presentation/   # UI logic / controllers
├── infrastructure/ # HTTP handlers and Web storage
└── domain/         # Domain entity model
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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.