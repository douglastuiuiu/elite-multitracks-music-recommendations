import { google } from 'googleapis';
import axios from 'axios';

const YOUTUBE_API_KEY = 'AIzaSyBYJ_IRtMDlHiDTnkqOWY5bF-GbaxMwMF0';
const ELITE_CHANNEL_ID = 'UC8WD-kFwKXQlFin1og1KsYw'; // ID do canal Elite

// Configuração da API do YouTube
const youtube = google.youtube({
  version: 'v3',
  auth: YOUTUBE_API_KEY,
});

// Função para buscar vídeos de um canal do YouTube
export const youtubeScraper = {
  async searchVideos(query) {
    try {
      // Primeira tentativa: API oficial do YouTube
      const response = await youtube.search.list({
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: 20,
      });

      const results = response.data.items.map((item) => ({
        title: item.snippet.title,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        isElite: item.snippet.channelId === ELITE_CHANNEL_ID,
      }));

      const sortedResults = results.sort((a, b) => {
        if (a.isElite && !b.isElite) return -1;
        if (!a.isElite && b.isElite) return 1;
        return 0;
      });

      return sortedResults;
    } catch (error) {
      console.error('Erro ao buscar vídeos na API do YouTube. Tentando método alternativo:', error.message);

      // Segunda tentativa: Método alternativo usando API pública ou scraping
      try {
        const fallbackResponse = await axios.get(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`);
        const html = fallbackResponse.data;

        // Parsing simplificado do HTML (bibliotecas como cheerio podem ajudar)
        const videoMatches = html.match(/"videoId":"(.*?)"/g)?.slice(0, 20);
        const titleMatches = html.match(/"title":{"runs":\[{"text":"(.*?)"}]/g)?.slice(0, 20);

        if (!videoMatches || !titleMatches) {
          throw new Error('Nenhum resultado encontrado na pesquisa alternativa');
        }

        const fallbackResults = videoMatches.map((match, index) => ({
          title: titleMatches[index]?.replace(/.*"text":"(.*?)".*/, '$1'),
          url: `https://www.youtube.com/watch?v=${match.replace(/.*"videoId":"(.*?)"/, '$1')}`,
          isElite: false, // Não podemos verificar o canal com esta abordagem
        }));

        return fallbackResults;
      } catch (fallbackError) {
        console.error('Erro na busca alternativa:', fallbackError.message);
        throw new Error('Erro ao buscar vídeos, ambos os métodos falharam');
      }
    }
  },

  // Função para obter informações detalhadas do vídeo
  async getVideoDetails(youtubeLink) {
    const videoId = youtubeLink.split('v=')[1]?.split('&')[0];

    if (!videoId) {
      throw new Error('ID do vídeo não encontrado');
    }

    try {
      // Primeira tentativa: API oficial do YouTube
      const response = await youtube.videos.list({
        id: videoId,
        part: 'snippet,contentDetails',
      });

      const videoData = response.data.items[0];

      if (!videoData) {
        throw new Error('Vídeo não encontrado');
      }

      const title = videoData?.snippet?.title;
      const durationISO = videoData?.contentDetails?.duration;

      // Converter a duração do formato ISO 8601 para minutos
      const regex = /PT(\d+H)?(\d+M)?(\d+S)?/;
      const match = durationISO.match(regex);
      const hours = match[1] ? parseInt(match[1], 10) : 0;
      const minutes = match[2] ? parseInt(match[2], 10) : 0;
      const seconds = match[3] ? parseInt(match[3], 10) : 0;
      const durationInMinutes = hours * 60 + minutes + seconds / 60;

      return {
        title,
        duration: durationInMinutes,
      };
    } catch (error) {
      console.error('Erro ao obter detalhes do vídeo na API do YouTube. Tentando método alternativo:', error.message);

      // Segunda tentativa: Método alternativo
      try {
        const response = await axios.get(`https://www.youtube.com/watch?v=${videoId}`);
        const html = response.data;

        const titleMatch = html.match(/<meta name="title" content="(.*?)">/);
        const title = titleMatch ? titleMatch[1] : 'Título não encontrado';

        return {
          title,
          duration: 'Indisponível via método alternativo', // Duração não é facilmente extraível sem a API oficial
        };
      } catch (fallbackError) {
        console.error('Erro ao obter detalhes do vídeo via método alternativo:', fallbackError.message);
        throw new Error('Erro ao obter detalhes do vídeo, ambos os métodos falharam');
      }
    }
  },
};
