import { google } from 'googleapis';

const YOUTUBE_API_KEY = 'AIzaSyBD3Jpcn4XcHAJlIz3kks9q_PLehfSeTSA'
const ELITE_CHANNEL_ID = 'UC8WD-kFwKXQlFin1og1KsYw'; // ID do canal Elite

// Configuração da API do YouTube
const youtube = google.youtube({
  version: 'v3',
  auth: YOUTUBE_API_KEY, // Substitua com sua chave de API
});

// Função para buscar vídeos de um canal do YouTube
export const youtubeScraper = {
  async searchVideos(query) {
    try {
      const response = await youtube.search.list({
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: 20,
      });

      const results = response.data.items.map((item) => ({
        title: item.snippet.title,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        isElite: item.snippet.channelId === ELITE_CHANNEL_ID, // Flag para verificar se é do canal Elite
      }));

      // Ordenando os resultados para que os vídeos do canal Elite apareçam primeiro
      const sortedResults = results.sort((a, b) => {
        if (a.isElite && !b.isElite) return -1;
        if (!a.isElite && b.isElite) return 1;
        return 0; // Se ambos ou nenhum for do canal Elite, mantém a ordem original
      });

      return sortedResults;
    } catch (error) {
      console.error('Erro ao buscar vídeos do YouTube com API:', error.message);
      throw new Error('Erro ao buscar vídeos do YouTube com API');
    }
  },

  // Função para obter a duração do vídeo em minutos
  async getVideoDuration(youtubeLink) {
    const videoId = youtubeLink.split('v=')[1]?.split('&')[0];

    if (!videoId) {
      throw new Error('ID do vídeo não encontrado');
    }

    // URL da API do YouTube
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails&key=${YOUTUBE_API_KEY}`;

    // Fazer a requisição à API do YouTube para obter a duração
    const response = await youtube.videos.list({
      id: videoId,
      part: 'contentDetails',
    });

    const duration = response.data.items[0]?.contentDetails?.duration;

    if (!duration) {
      throw new Error('Duração do vídeo não encontrada');
    }

    // Converter a duração do formato ISO 8601 (ex: PT10M15S) para minutos
    const regex = /PT(\d+H)?(\d+M)?(\d+S)?/;
    const match = duration.match(regex);
    const hours = match[1] ? parseInt(match[1], 10) : 0;
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    const seconds = match[3] ? parseInt(match[3], 10) : 0;

    // Converter para minutos
    return hours * 60 + minutes + (seconds / 60);
  },
};
