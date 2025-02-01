// pages/api/indications/index.js
import { getDb, searchIndications } from '../../../utils/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { searchTerm, page = 1, limit = 10 } = req.query;
      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
      const skip = (pageNumber - 1) * limitNumber;

      let query = {};
      if (searchTerm) {
        query = { $text: { $search: searchTerm } };
      }

      const db = await getDb();
      const [data, totalCount] = await Promise.all([
        db.collection('indications')
          .find(query)
          .skip(skip)
          .limit(limitNumber)
          .toArray(),
        db.collection('indications').countDocuments(query)
      ]);

      res.status(200).json({ data, totalCount });
    } catch (error) {
      console.error('Erro ao buscar as indicações:', error);
      res.status(500).json({ error: 'Erro ao buscar as indicações.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Método ${req.method} não permitido.`);
  }
}