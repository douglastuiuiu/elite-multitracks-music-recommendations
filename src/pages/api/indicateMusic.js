import { saveIndication } from '../../utils/db'; // Função para salvar indicação no banco
import { youtubeScraper } from '../../utils/youtubeScraper'; // Importar a função getVideoDuration

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, email, youtubeLink, title } = req.body;

    // Verificar se todos os campos necessários estão presentes
    if (!name || !email || !youtubeLink) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    try {
      // Obter os detalhes do vídeo, incluindo o título
      const videoDetails = await youtubeScraper.getVideoDetails(youtubeLink);

      if (!videoDetails) {
        throw new Error('Não foi possível obter os detalhes do vídeo. Verifique o link fornecido.');
      }

      // Definir o valor de isLate com base no tempo do vídeo
      const isLate = videoDetails.duration > 420; // Verifica se a duração do vídeo é maior que 7 minutos

      // Criar a indicação com o novo atributo isLate
      const indication = {
        name,
        email,
        title,
        isLate,
        youtubeLink,
        createdAt: new Date(), // Preencher com a data atual
      };

      // Salvar a indicação no banco
      await saveIndication(indication);

      return res.status(200).json({ success: 'Indicação salva com sucesso!' });
    } catch (error) {
      console.error('Erro ao salvar indicação:', error.message);
      return res.status(400).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido.' });
  }
}
