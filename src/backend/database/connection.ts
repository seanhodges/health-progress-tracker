import * as sqlite3 from 'sqlite3';
import { promisify } from 'util';

export interface HealthEntry {
  id?: number;
  date: string;
  weight: number;
  weightUnit: 'kg' | 'lbs' | 'st';
  waistSize: number;
  waistUnit: 'cm' | 'inches';
  createdAt?: string;
}

export interface StoredHealthEntry {
  id?: number;
  date: string;
  weight: number;
  waist: number;
  createdAt?: string;
}

export class Database {
  private db: sqlite3.Database;

  constructor(dbPath: string = './health_tracker.db') {
    // Initialize SQLite database with verbose mode for better debugging
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database');
      }
    });
  }

  // Convert weight to kg (standard unit for storage)
  private convertWeightToKg(weight: number, unit: 'kg' | 'lbs' | 'st'): number {
    if (unit === 'lbs') {
      return weight * 0.453592;
    } else if (unit === 'st') {
      return weight * 6.35029318;
    } else {
      return weight; // kg
    }
  }

  // Convert weight from kg to specified unit
  private convertWeightFromKg(weightKg: number, unit: 'kg' | 'lbs' | 'st'): number {
    if (unit === 'lbs') {
      return weightKg / 0.453592;
    } else if (unit === 'st') {
      return weightKg / 6.35029318;
    } else {
      return weightKg; // kg
    }
  }

  // Convert waist size from inches to cm
  private convertWaistToCm(waist: number, unit: 'cm' | 'inches'): number {
    return unit === 'inches' ? waist * 2.54 : waist;
  }

  // Convert waist size from cm to specified unit
  private convertWaistFromCm(waistCm: number, unit: 'cm' | 'inches'): number {
    return unit === 'inches' ? waistCm / 2.54 : waistCm;
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Create health_entries table storing only converted values in standard units (kg and cm)
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS health_entries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          weight REAL NOT NULL,
          waist REAL NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      this.db.run(createTableSQL, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database table initialized');
          resolve();
        }
      });
    });
  }

  async insertEntry(entry: HealthEntry): Promise<number> {
    return new Promise((resolve, reject) => {
      // Convert measurements to standard units (kg and cm) before storing
      const weightKg = this.convertWeightToKg(entry.weight, entry.weightUnit);
      const waistCm = this.convertWaistToCm(entry.waistSize, entry.waistUnit);

      const sql = `
        INSERT INTO health_entries (date, weight, waist)
        VALUES (?, ?, ?)
      `;
      
      this.db.run(sql, [entry.date, weightKg, waistCm], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  async getEntries(startDate?: string, endDate?: string, weightUnit: 'kg' | 'lbs' | 'st' = 'kg', waistUnit: 'cm' | 'inches' = 'cm'): Promise<HealthEntry[]> {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT id, date, weight, waist, created_at as createdAt
        FROM health_entries
      `;
      const params: string[] = [];

      if (startDate && endDate) {
        sql += ' WHERE date BETWEEN ? AND ?';
        params.push(startDate, endDate);
      }

      sql += ' ORDER BY date DESC';

      this.db.all(sql, params, (err, rows: StoredHealthEntry[]) => {
        if (err) {
          reject(err);
        } else {
          // Convert stored measurements (kg and cm) to requested units for display
          const entries: HealthEntry[] = (rows || []).map(row => ({
            id: row.id,
            date: row.date,
            weight: this.convertWeightFromKg(row.weight, weightUnit),
            weightUnit: weightUnit,
            waistSize: this.convertWaistFromCm(row.waist, waistUnit),
            waistUnit: waistUnit,
            createdAt: row.createdAt
          }));
          resolve(entries);
        }
      });
    });
  }

  // Get entries in standard units for charting (kg and cm)
  async getEntriesStandardUnits(startDate?: string, endDate?: string): Promise<StoredHealthEntry[]> {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT id, date, weight, waist, created_at as createdAt
        FROM health_entries
      `;
      const params: string[] = [];

      if (startDate && endDate) {
        sql += ' WHERE date BETWEEN ? AND ?';
        params.push(startDate, endDate);
      }

      sql += ' ORDER BY date ASC';

      this.db.all(sql, params, (err, rows: StoredHealthEntry[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  async deleteEntriesByDate(date: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM health_entries WHERE date = ?`;
      
      this.db.run(sql, [date], function(err) {
        if (err) {
          reject(err);
        } else {
          console.log(`Deleted ${this.changes} entries for date: ${date}`);
          resolve(this.changes);
        }
      });
    });
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database connection closed');
          resolve();
        }
      });
    });
  }
}