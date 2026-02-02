// Database connection and initialization
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'

const sqlite = new Database(process.env.DATABASE_PATH || './ai-detective.db')
export const db = drizzle(sqlite, { schema })

// Run migrations
export function runMigrations() {
  migrate(db, { migrationsFolder: './drizzle' })
}

// Initialize database (create tables if they don't exist)
export async function initDatabase() {
  try {
    runMigrations()
    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Database initialization error:', error)
    // Create tables manually if migrations fail
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS cases (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        status TEXT NOT NULL,
        description TEXT NOT NULL,
        jurisdiction TEXT,
        case_number TEXT,
        assigned_officer TEXT,
        priority TEXT NOT NULL DEFAULT 'medium',
        tags TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        privacy_flags TEXT
      );

      CREATE TABLE IF NOT EXISTS evidence (
        id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        source TEXT,
        date TEXT,
        file_url TEXT,
        metadata TEXT,
        confidence REAL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS analyses (
        id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        insights TEXT,
        hypotheses TEXT,
        patterns TEXT,
        anomalies TEXT,
        timeline TEXT,
        locations TEXT,
        confidence_scores TEXT,
        recommendations TEXT,
        sources TEXT,
        audit_trail TEXT,
        reasoning_chain TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS feedback (
        id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL,
        verified INTEGER NOT NULL,
        accuracy INTEGER NOT NULL,
        correct_insights TEXT,
        incorrect_insights TEXT,
        correct_hypotheses TEXT,
        incorrect_hypotheses TEXT,
        correct_anomalies TEXT,
        incorrect_anomalies TEXT,
        actual_outcome TEXT,
        solved_by TEXT,
        notes TEXT,
        verified_by TEXT,
        verified_at TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT,
        password_hash TEXT,
        role TEXT NOT NULL DEFAULT 'investigator',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_login TEXT
      );

      CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        case_id TEXT,
        evidence_id TEXT,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        size INTEGER NOT NULL,
        path TEXT NOT NULL,
        extracted_text TEXT,
        metadata TEXT,
        uploaded_by TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
        FOREIGN KEY (evidence_id) REFERENCES evidence(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id)
      );

      CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
      CREATE INDEX IF NOT EXISTS idx_cases_date ON cases(date);
      CREATE INDEX IF NOT EXISTS idx_evidence_case_id ON evidence(case_id);
      CREATE INDEX IF NOT EXISTS idx_analyses_case_id ON analyses(case_id);
      CREATE INDEX IF NOT EXISTS idx_feedback_case_id ON feedback(case_id);
    `)
  }
}
