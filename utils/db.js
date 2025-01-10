const Database = require('better-sqlite3');
const db = new Database(':memory:');

// Criação da tabela de indicações
db.exec(`
    CREATE TABLE Indications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        youtubeLink TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

module.exports = db;
