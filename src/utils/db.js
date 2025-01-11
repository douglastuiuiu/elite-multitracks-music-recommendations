import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';

// Função para abrir a conexão com o banco de dados
export async function openDb() {
  const db = await open({
    filename: './public/database.db',
    driver: sqlite3.Database,
  });
  return db;
}

// Função para criar a tabela de indicações (caso não exista)
async function createIndicationsTable(db) {
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

// Função para sobrescrever o banco de dados (remover e recriar)
async function overwriteDatabase() {
  const dbPath = path.join(process.cwd(), 'public', 'database.db');

  // Verificar se o arquivo do banco de dados já existe
  if (fs.existsSync(dbPath)) {
    try {
      // Excluir o arquivo existente
      fs.unlinkSync(dbPath);
      console.log('Arquivo de banco de dados antigo removido.');
    } catch (error) {
      console.error('Erro ao excluir o banco de dados:', error);
    }
  }

  // Criar um novo banco de dados
  const db = await openDb();

  // Criar a tabela de indicações (caso não exista)
  await createIndicationsTable(db);
  console.log('Novo banco de dados criado e tabela "indications" recriada.');

  return db;
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

// Inicializar o banco de dados ao iniciar a aplicação (só executa no primeiro carregamento)
(async () => {
  try {
    const dbPath = path.join(process.cwd(), 'public', 'database.db');
    
    // Verificar se o arquivo do banco de dados existe
    if (!fs.existsSync(dbPath)) {
      // Sobrescrever o banco de dados e recriar a tabela apenas se o banco não existir
      await overwriteDatabase(); 
    } else {
      // Se o banco já existir, apenas criar a tabela caso não exista
      const db = await openDb();
      await createIndicationsTable(db);
    }
  } catch (err) {
    console.error('Erro ao inicializar o banco de dados:', err);
  }
})();
