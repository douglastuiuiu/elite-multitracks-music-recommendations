// utils/initDB.js

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

// Executar a criação da tabela
createIndicationsTable().catch(err => console.error('Erro ao criar a tabela:', err));
