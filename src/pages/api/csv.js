import { getDb } from '../../utils/db'; // Função para obter o banco de dados MongoDB
import { Writable } from 'stream';
import { format } from 'fast-csv';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Conectar ao banco de dados
      const db = await getDb();
      const collection = db.collection('indications');

      // Buscar todas as indicações
      const indications = await collection.find({}).toArray();

      // Verificar se há indicações
      if (indications.length === 0) {
        console.log('Nenhuma indicação encontrada no banco');
        return res.status(404).json({ error: 'Nenhuma indicação encontrada' });
      }

      // Gerar o nome do arquivo com timestamp
      const timestamp = new Date().toISOString().replace(/[:]/g, '-');
      const fileName = `indications_${timestamp}.csv`;

      // Definir cabeçalhos do CSV
      const headers = ['Nome', 'Email', 'Link do YouTube', 'Data de Criação'];

      // Definir os dados para o CSV
      const csvData = indications.map((indication) => [
        indication.name,
        indication.email,
        indication.youtubeLink,
        new Date(indication.createdAt).toLocaleString(),
      ]);

      // Enviar o CSV como resposta diretamente
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

      // Criar e configurar o fluxo de escrita
      const csvStream = format({ headers: true });

      // Criar um Writable stream para enviar o CSV
      csvStream.pipe(res);

      // Escrever os dados no fluxo
      csvData.forEach((row) => csvStream.write(row));

      // Finalizar o stream de CSV
      csvStream.end();

    } catch (error) {
      console.error('Erro ao gerar o CSV:', error);
      res.status(500).json({ error: 'Erro ao gerar o CSV' });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
}
