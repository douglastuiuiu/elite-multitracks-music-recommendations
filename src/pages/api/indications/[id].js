import { getDb } from '../../../utils/db';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const { id } = req.query; // Obtém o ID da URL

    try {
      const db = await getDb();
      const result = await db.collection('indications').deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 1) {
        res.status(200).json({ message: 'Indicação excluída com sucesso' });
      } else {
        res.status(404).json({ error: 'Indicação não encontrada' });
      }
    } catch (error) {
      console.error('Erro ao excluir a indicação:', error);
      res.status(500).json({ error: 'Erro ao excluir a indicação' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Método ${req.method} não permitido.`);
  }
}
