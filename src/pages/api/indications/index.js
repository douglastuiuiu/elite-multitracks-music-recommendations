import { getDb, searchIndications } from '../../../utils/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { searchTerm } = req.query; // Obtém o parâmetro searchTerm da query string

      let indications;

      if (searchTerm) {
        // Se um termo de busca for fornecido, utiliza a função de busca
        indications = await searchIndications(searchTerm);
      } else {
        // Caso contrário, retorna todas as indicações
        const db = await getDb();
        indications = await db.collection('indications').find().toArray();
      }

      res.status(200).json(indications); // Retorna os dados no formato JSON
    } catch (error) {
      console.error('Erro ao buscar as indicações:', error);
      res.status(500).json({ error: 'Erro ao buscar as indicações.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Método ${req.method} não permitido.`);
  }
}
