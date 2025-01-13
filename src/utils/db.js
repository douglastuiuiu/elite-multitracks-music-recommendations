import { MongoClient } from 'mongodb';

// URL de conexão com o MongoDB Atlas (Use variáveis de ambiente em produção)
const url = process.env.MONGO_URI || 'mongodb+srv://douglastuiuiu:NjbijcTnsXn8GD4u@cluster.memtd.mongodb.net/?retryWrites=true&w=majority&appName=cluster';
const dbName = 'elite'; // Nome do banco de dados

let client;
let db;

// Função para abrir ou reutilizar a conexão com o MongoDB
export async function getDb() {
  if (!client) {
    client = new MongoClient(url); // Remove `useUnifiedTopology`
    await client.connect();
    console.log('Conectado ao banco de dados MongoDB Atlas');
  }

  if (!db) {
    db = client.db(dbName);
  }

  return db; // Retorna a instância do banco de dados
}

// Função para salvar uma indicação no MongoDB
export async function saveIndication({ name, email, youtubeLink }) {
  const db = await getDb();
  const collection = db.collection('indications');

  try {
    // Verifica se já existe uma indicação com o mesmo e-mail
    const existingIndication = await collection.findOne({ email });

    if (existingIndication) {
      throw new Error('Este e-mail já fez uma indicação.');
    }

    // Insere uma nova indicação na coleção
    await collection.insertOne({
      name,
      email,
      youtubeLink,
      createdAt: new Date().toISOString(),
    });
    console.log('Indicação salva com sucesso.');
  } catch (error) {
    console.error('Erro ao salvar indicação:', error);
    throw error;
  }
}

// Função para buscar as indicações no MongoDB
export async function searchIndications(searchTerm) {
  const db = await getDb();
  const collection = db.collection('indications');

  try {
    // Realiza a busca por nome ou link do YouTube
    const results = await collection.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } }, // Pesquisa por nome (case-insensitive)
        { youtubeLink: { $regex: searchTerm, $options: 'i' } }, // Pesquisa por link do YouTube (case-insensitive)
      ]
    }).toArray();

    return results; // Retorna as indicações que correspondem ao termo de pesquisa
  } catch (error) {
    console.error('Erro ao buscar indicações:', error);
    throw error;
  }
}

// Função para fechar a conexão com o banco de dados (importante para testes ou ambientes controlados)
export async function closeDb() {
  if (client) {
    await client.close();
    console.log('Conexão com o banco de dados fechada.');
  }
}

// Inicializar o banco de dados ao iniciar a aplicação (executa uma vez)
(async () => {
  try {
    await getDb(); // Só abre a conexão, sem necessidade de criar a coleção
  } catch (err) {
    console.error('Erro ao inicializar o banco de dados:', err);
  }
})();
