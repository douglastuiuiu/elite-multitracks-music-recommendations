import { createObjectCsvWriter } from 'csv-writer';
import { getDb } from '../../utils/db'; // Função para obter o banco de dados MongoDB
import path from 'path';
import fs from 'fs';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Conectar ao banco de dados
      const db = await getDb();
      const collection = db.collection('indications');

      // Buscar todas as indicações
      const indications = await collection.find({}).toArray();

      // Transformar os dados para o formato esperado pelo CSV Writer
      const csvData = indications.map((indication) => ({
        name: indication.name,
        email: indication.email,
        youtubeLink: indication.youtubeLink,
        createdAt: new Date(indication.createdAt).toLocaleString(),
      }));

      // Definir o caminho para o arquivo CSV (salvando na pasta temporária)
      const timestamp = new Date().toISOString().replace(/[:]/g, '-');
      const filePath = path.join(process.cwd(), 'public', `indications_${timestamp}.csv`);

      const csvWriter = createObjectCsvWriter({
        path: filePath, // Caminho dinâmico com data
        header: [
          { id: 'name', title: 'Nome' },
          { id: 'email', title: 'Email' },
          { id: 'youtubeLink', title: 'Link do YouTube' },
          { id: 'createdAt', title: 'Data de Criação' },
        ],
      });

      // Escrever os dados no arquivo CSV
      await csvWriter.writeRecords(csvData);

      // Definir o cabeçalho para download do arquivo CSV
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=indications_${timestamp}.csv`);

      // Enviar o arquivo CSV diretamente para o cliente
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      // Após o arquivo ser enviado, excluir o arquivo do servidor
      fileStream.on('end', () => {
        fs.unlinkSync(filePath); // Apagar o arquivo após o envio
      });
    } catch (error) {
      console.error('Erro ao gerar o CSV:', error);
      res.status(500).json({ error: 'Erro ao gerar o CSV' });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
}
