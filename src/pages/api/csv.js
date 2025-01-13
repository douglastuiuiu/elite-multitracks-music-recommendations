import { getDb } from '../../utils/db'; // Função para obter o banco de dados MongoDB
import { format } from 'fast-csv';
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

      // Verificar se há indicações
      if (indications.length === 0) {
        console.log('Nenhuma indicação encontrada no banco');
        return res.status(404).json({ error: 'Nenhuma indicação encontrada' });
      }

      console.log('Indicações encontradas:', indications);

      // Gerar o nome do arquivo com timestamp
      const timestamp = new Date().toISOString().replace(/[:]/g, '-');
      const fileName = `indications_${timestamp}.csv`;

      // Caminho do arquivo temporário no diretório /tmp
      const filePath = path.join('/tmp', fileName);

      // Definir cabeçalhos do CSV
      const headers = ['Nome', 'Email', 'Link do YouTube', 'Excede 7min', 'Data de Criação'];

      // Definir os dados para o CSV
      const csvData = indications.map((indication) => ({
        Nome: indication.name,
        Email: indication.email,
        'Link do YouTube': indication.youtubeLink,
        'Excede 7min': indication.isLate ? 'Sim' : 'Não',
        'Data de Criação': new Date(indication.createdAt).toLocaleString(),
      }));

      // Criar fluxo de escrita para o CSV
      const writableStream = fs.createWriteStream(filePath);

      // Criar e configurar o fluxo do CSV
      const csvStream = format({ headers: true });

      // Pipar o fluxo para o arquivo
      csvStream.pipe(writableStream);

      // Escrever os dados no CSV
      csvData.forEach((row) => csvStream.write(row));

      // Finalizar o fluxo
      csvStream.end();

      writableStream.on('finish', () => {
        // Enviar o arquivo gerado como resposta
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

        // Ler o arquivo e enviar
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

        // Remover o arquivo do diretório temporário após enviar
        fileStream.on('end', () => {
          fs.unlinkSync(filePath); // Apagar o arquivo após o envio
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
