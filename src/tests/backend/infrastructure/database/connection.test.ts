import { Database, HealthEntry } from '../../../../backend/infrastructure/database/connection';
import * as fs from 'fs';
import * as path from 'path';

describe('Database', () => {
  let database: Database;
  const testDbPath = './test_health_tracker.db';

  beforeEach(async () => {
    // Clean up any existing test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    
    database = new Database(testDbPath);
    await database.initialize();
  });

  afterEach(async () => {
    await database.close();
    
    // Clean up test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('initialization', () => {
    it('should initialize database and create table', async () => {
      // The setup in beforeEach should complete without errors
      expect(true).toBe(true);
    });
  });

  describe('insertEntry', () => {
    it('should insert a valid health entry with kg and cm', async () => {
      const entry: HealthEntry = {
        date: '2024-01-15',
        weight: 75.5,
        weightUnit: 'kg',
        waistSize: 85.0,
        waistUnit: 'cm'
      };

      const id = await database.insertEntry(entry);
      expect(id).toBeGreaterThan(0);
    });

    it('should insert and convert pounds to kg', async () => {
      const entry: HealthEntry = {
        date: '2024-01-15',
        weight: 165, // pounds
        weightUnit: 'lbs',
        waistSize: 85.0,
        waistUnit: 'cm'
      };

      const id = await database.insertEntry(entry);
      expect(id).toBeGreaterThan(0);

      // Retrieve and verify conversion
      const entries = await database.getEntriesStandardUnits();
      expect(entries).toHaveLength(1);
      expect(entries[0].weight).toBeCloseTo(74.84, 2); // 165 lbs ≈ 74.84 kg
    });

    it('should insert and convert inches to cm', async () => {
      const entry: HealthEntry = {
        date: '2024-01-15',
        weight: 75.0,
        weightUnit: 'kg',
        waistSize: 34, // inches
        waistUnit: 'inches'
      };

      const id = await database.insertEntry(entry);
      expect(id).toBeGreaterThan(0);

      // Retrieve and verify conversion
      const entries = await database.getEntriesStandardUnits();
      expect(entries).toHaveLength(1);
      expect(entries[0].waist).toBeCloseTo(86.36, 2); // 34 inches ≈ 86.36 cm
    });
  });

  describe('getEntries', () => {
    beforeEach(async () => {
      // Insert test data
      const entries: HealthEntry[] = [
        {
          date: '2024-01-10',
          weight: 75.0,
          weightUnit: 'kg',
          waistSize: 85.0,
          waistUnit: 'cm'
        },
        {
          date: '2024-01-15',
          weight: 74.5,
          weightUnit: 'kg',
          waistSize: 84.5,
          waistUnit: 'cm'
        },
        {
          date: '2024-01-20',
          weight: 74.0,
          weightUnit: 'kg',
          waistSize: 84.0,
          waistUnit: 'cm'
        }
      ];

      for (const entry of entries) {
        await database.insertEntry(entry);
      }
    });

    it('should retrieve all entries', async () => {
      const entries = await database.getEntries();
      expect(entries).toHaveLength(3);
      expect(entries[0].date).toBe('2024-01-20'); // Most recent first
    });

    it('should filter entries by date range', async () => {
      const entries = await database.getEntries('2024-01-12', '2024-01-18');
      expect(entries).toHaveLength(1);
      expect(entries[0].date).toBe('2024-01-15');
    });

    it('should convert stored values to requested units', async () => {
      const entriesLbs = await database.getEntries(undefined, undefined, 'lbs');
      expect(entriesLbs[0].weight).toBeCloseTo(163.14, 1); // 74 kg ≈ 163.14 lbs
      expect(entriesLbs[0].weightUnit).toBe('lbs');
    });

    it('should return entries in descending date order', async () => {
      const entries = await database.getEntries();
      expect(entries[0].date).toBe('2024-01-20');
      expect(entries[1].date).toBe('2024-01-15');
      expect(entries[2].date).toBe('2024-01-10');
    });
  });

  describe('getEntriesStandardUnits', () => {
    beforeEach(async () => {
      const entry: HealthEntry = {
        date: '2024-01-15',
        weight: 165, // lbs
        weightUnit: 'lbs',
        waistSize: 34, // inches
        waistUnit: 'inches'
      };
      await database.insertEntry(entry);
    });

    it('should return entries in standard units (kg and cm)', async () => {
      const entries = await database.getEntriesStandardUnits();
      expect(entries).toHaveLength(1);
      expect(entries[0].weight).toBeCloseTo(74.84, 2);
      expect(entries[0].waist).toBeCloseTo(86.36, 2);
    });

    it('should return entries in ascending date order for charting', async () => {
      // Add another entry
      const entry2: HealthEntry = {
        date: '2024-01-10',
        weight: 170,
        weightUnit: 'lbs',
        waistSize: 35,
        waistUnit: 'inches'
      };
      await database.insertEntry(entry2);

      const entries = await database.getEntriesStandardUnits();
      expect(entries).toHaveLength(2);
      expect(entries[0].date).toBe('2024-01-10'); // Earliest first
      expect(entries[1].date).toBe('2024-01-15');
    });
  });
});