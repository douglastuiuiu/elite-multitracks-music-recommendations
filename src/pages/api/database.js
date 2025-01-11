import path from 'path';
import fs from 'fs';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Caminho completo para o arquivo `database.db` dentro do diretório público
      const filePath = path.resolve('/tmp/database.db'); // Confirma o caminho correto

      // Verifica se o arquivo existe
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Arquivo não encontrado.' });
      }

      // Obtém a data e hora atual no formato "YYYY-MM-DD HH:mm:ss"
      const now = new Date();
      const formattedDate = now
        .toISOString()
        .replace('T', ' ')
        .slice(0, 19); // "2025-01-11 15:02:34"

      // Nome do arquivo para o download
      const fileName = `database_${formattedDate.replace(/:/g, '-')}.db`; // ":" não é permitido em nomes de arquivo

      // Configura os headers para o download do arquivo
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

      // Cria um stream de leitura e envia o arquivo como resposta
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('Erro ao processar o download:', error);
      res.status(500).json({ error: 'Erro ao processar o download do arquivo.' });
    }
  } else {
    // Retorna método não permitido para outras requisições que não sejam GET
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Método ${req.method} não permitido.`);
  }
}
