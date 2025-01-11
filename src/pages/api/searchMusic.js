import { youtubeScraper } from '../../utils/youtubeScraper';
import '../../utils/db';

export default async function handler(req, res) {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Query is required' });
  }

  try {
    // Buscando vídeos do YouTube
    const youtubeResults = await youtubeScraper.searchVideos(query);

    return res.status(200).json({
      results: youtubeResults,
    });
  } catch (error) {
    console.error('Erro ao buscar vídeos:', error);
    return res.status(500).json({ message: 'Erro ao buscar vídeos' });
  }
}
