const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

let dbInstance = null;

const connectDB = async () => {
  if (dbInstance) return dbInstance;
  try {
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS itineraries (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS travel_pins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        category TEXT NOT NULL,
        caption TEXT NOT NULL,
        image_path TEXT,
        likes INTEGER DEFAULT 0,
        color TEXT DEFAULT '#2d5a27',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    try {
      await db.exec(`ALTER TABLE travel_pins ADD COLUMN color TEXT DEFAULT '#2d5a27'`);
    } catch (e) {

    }

    console.log('SQLite Connected and Tables initialized');
    dbInstance = db;
    return db;
  } catch (error) {
    console.error('SQLite connection error:', error);
    process.exit(1);
  }
};

connectDB.getDB = () => {
  if (!dbInstance) {
    throw new Error('Database connection has not been initialized yet.');
  }
  return dbInstance;
};

module.exports = connectDB;
