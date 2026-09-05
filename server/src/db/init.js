import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

const db = new Database(join(process.cwd(), 'shop.db'));

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Initialize tables
const schema = readFileSync(join(process.cwd(), 'src/db/schema.sql'), 'utf-8');
db.exec(schema);

console.log('Database initialized successfully!');
db.close();