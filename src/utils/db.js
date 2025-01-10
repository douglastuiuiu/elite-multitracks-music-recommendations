import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Função para abrir a conexão com o banco de dados
async function openDb() {
  return await open({
    filename: './database.db',
    driver: sqlite3.Database
  });
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

// Função para salvar a indicação no banco de dados
export async function saveIndication({ name, email, youtubeLink }) {
  const db = await openDb();
  await db.run(
    'INSERT INTO indications (name, email, youtubeLink, createdAt) VALUES (?, ?, ?, ?)',
    [name, email, youtubeLink, new Date()]
  );
}

// Função para buscar músicas no canal (com base na descrição do vídeo ou URL)
export async function getMusicFromChannel(searchTerm) {
  const db = await openDb();

  // Busca no banco de dados tanto pelo nome quanto pela URL (ou parte de qualquer um)
  const videos = await db.all(
    'SELECT * FROM indications WHERE name LIKE ? OR youtubeLink LIKE ?',
    [`%${searchTerm}%`, `%${searchTerm}%`] // O `searchTerm` pode ser o nome ou a URL
  );

  return videos;
}

// Executar a criação da tabela ao iniciar
createIndicationsTable().catch(err => console.error('Erro ao criar a tabela:', err));
