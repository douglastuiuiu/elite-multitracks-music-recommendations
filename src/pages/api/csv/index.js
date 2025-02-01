import { getDb } from '../../../utils/db';
import { format } from 'fast-csv';
import path from 'path';
import fs from 'fs';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const db = await getDb();
      const collection = db.collection('indications');
      const indications = await collection.find({}).toArray();

      if (indications.length === 0) {
        console.log('Nenhuma indicação encontrada no banco');
        return res.status(404).json({ error: 'Nenhuma indicação encontrada' });
      }

      const timestamp = new Date().toISOString().replace(/[:]/g, '-');
      const fileName = `indications_${timestamp}.csv`;
      const tmpDir = '/tmp';
      
      // Criar diretório tmp se não existir
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }

      const filePath = path.join(tmpDir, fileName);
      const headers = ['Nome', 'Email', 'Título', 'Excede 7min', 'Link YouTube', 'Data Criação'];

      const csvData = indications.map((indication) => ({
        Nome: indication.name,
        Email: indication.email,
        'Título': indication.title,
        'Excede 7min': indication.isLate ? 'Sim' : 'Não',
        'Link YouTube': indication.youtubeLink,
        'Data Criação': new Date(indication.createdAt).toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      }));

      const writableStream = fs.createWriteStream(filePath);
      const csvStream = format({ headers: true });

      csvStream.pipe(writableStream);
      csvData.forEach((row) => csvStream.write(row));
      csvStream.end();

      writableStream.on('finish', () => {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

        fileStream.on('end', () => {
          fs.unlinkSync(filePath);
        });
      });
    } catch (error) {
      console.error('Erro ao gerar o CSV:', error);
      res.status(500).json({ error: 'Erro ao gerar o CSV' });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
}