import { google } from 'googleapis';

// Configuração da API do YouTube
const youtube = google.youtube({
  version: 'v3',
  auth: 'AIzaSyBD3Jpcn4XcHAJlIz3kks9q_PLehfSeTSA', // Substitua com sua chave de API
});

const ELITE_CHANNEL_ID = 'UC8WD-kFwKXQlFin1og1KsYw'; // ID do canal Elite

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
};
