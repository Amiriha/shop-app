import Database from 'better-sqlite3';
import { join } from 'path';

const db = new Database(join(process.cwd(), 'shop.db'));
db.pragma('journal_mode = WAL');

export default db;