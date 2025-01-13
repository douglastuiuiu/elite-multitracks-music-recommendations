import { saveIndication } from '../../utils/db'; // Função para salvar indicação no banco
import { youtubeScraper } from '../../utils/youtubeScraper'; // Importar a função getVideoDuration

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, email, youtubeLink } = req.body;

    // Verificar se todos os campos necessários estão presentes
    if (!name || !email || !youtubeLink) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    try {
      // Obter a duração do vídeo
      const videoDuration = await youtubeScraper.getVideoDuration(youtubeLink);

      // Definir o valor de isLate com base no tempo do vídeo
      const isLate = videoDuration > 7; // Verifica se a duração do vídeo é maior que 7 minutos

      // Criar a indicação com o novo atributo isLate
      const indication = {
        name,
        email,
        youtubeLink,
        createdAt: new Date(), // Preencher com a data atual
        isLate,
      };

      // Tenta salvar a indicação no banco
      await saveIndication(indication);

      return res.status(200).json({ success: 'Indicação salva com sucesso!' });
    } catch (error) {
      // Caso ocorra erro, retorna mensagem de erro
      return res.status(400).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido.' });
  }
}
