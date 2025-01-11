import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Função para abrir a conexão com o banco de dados
export async function openDb() {
  const db = await open({
    filename: './database.db',
    driver: sqlite3.Database,
  });
  return db;
}

// Função para criar a tabela de indicações
async function createIndicationsTable() {
  const db = await openDb();

  await db.run(`
    CREATE TABLE IF NOT EXISTS indications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      youtubeLink TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
  `);

  console.log('Tabela "indications" criada ou já existente.');
}

// Função para salvar uma indicação no banco de dados
export async function saveIndication({ name, email, youtubeLink }) {
  const db = await openDb();

  const existingIndication = await db.get(
    'SELECT * FROM indications WHERE email = ?',
    [email]
  );

  if (existingIndication) {
    throw new Error('Este e-mail já fez uma indicação.');
  }

  await db.run(
    'INSERT INTO indications (name, email, youtubeLink, createdAt) VALUES (?, ?, ?, ?)',
    [name, email, youtubeLink, new Date().toISOString()]
  );
}

// Função para buscar músicas no banco com base no nome ou URL
export async function getMusicFromChannel(searchTerm) {
  const db = await openDb();

  const videos = await db.all(
    'SELECT * FROM indications WHERE name LIKE ? OR youtubeLink LIKE ?',
    [`%${searchTerm}%`, `%${searchTerm}%`]
  );

  return videos;
}

// Inicializar o banco de dados ao iniciar a aplicação
(async () => {
  try {
    await createIndicationsTable();
  } catch (err) {
    console.error('Erro ao inicializar o banco de dados:', err);
  }
})();
