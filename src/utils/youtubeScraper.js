import axios from 'axios';
import { z } from 'zod';

// Configurações validadas com Zod
const envSchema = z.object({
  ELITE_CHANNEL_ID: z.string().min(1),
  CACHE_TTL: z.coerce.number().default(300_000) // 5 minutos
});

const env = envSchema.parse(process.env);

// Helpers reutilizáveis
const YOUTUBE_URL_REGEX = /^(https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})(?:[&?#].*)?$/i;
const ISO8601_DURATION_REGEX = /P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;

const parseDuration = (isoDuration) => {
  try {
    const matches = ISO8601_DURATION_REGEX.exec(isoDuration) || [];
    const [
      years = 0,
      months = 0,
      weeks = 0,
      days = 0,
      hours = 0,
      mins = 0,
      secs = 0
    ] = matches.slice(1).map(m => parseInt(m) || 0);

    return {
      years,
      months,
      weeks,
      days,
      hours,
      minutes: mins,
      seconds: secs,
      totalSeconds: 
        (years * 365 * 24 * 60 * 60) +
        (months * 30 * 24 * 60 * 60) +
        (weeks * 7 * 24 * 60 * 60) +
        (days * 24 * 60 * 60) +
        (hours * 60 * 60) +
        (mins * 60) +
        secs
    };
  } catch (error) {
    console.error('Error parsing duration:', isoDuration);
    return { totalSeconds: 0 };
  }
};

const cache = new Map();

const fetchWithCache = async (key, fn, ttl = env.CACHE_TTL) => {
  if (cache.has(key)) {
    const { expires, value } = cache.get(key);
    if (Date.now() < expires) return value;
  }

  const value = await fn();
  cache.set(key, { 
    expires: Date.now() + ttl,
    value 
  });
  
  return value;
};

// Schemas de validação
const VideoSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  isElite: z.boolean()
});

const VideoDetailsSchema = z.object({
  title: z.string(),
  duration: z.number().nonnegative().transform(val => isNaN(val) ? 0 : val)
});

const getDefaultHeaders = () => ({
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
});

export const youtubeScraper = {
  /**
   * Busca vídeos no YouTube
   * @param {string} query - Termo de busca ou URL
   * @returns {Promise<VideoType[]>}
   */
  async searchVideos(query) {
    try {
      const urlMatch = YOUTUBE_URL_REGEX.exec(query);
      
      if (urlMatch) {
        const videoId = urlMatch[2];
        return this.fetchVideoById(videoId);
      }
      
      return this.searchVideosByQuery(query);
    } catch (error) {
      console.error('YouTube search failed:', error);
      return [];
    }
  },

  /**
   * Obtém detalhes do vídeo
   * @param {string} youtubeLink - URL do vídeo
   * @returns {Promise<VideoDetailsType>}
   */
  async getVideoDetails(youtubeLink) {
    try {
      const videoId = YOUTUBE_URL_REGEX.exec(youtubeLink)?.[2];
      if (!videoId) throw new Error('Invalid YouTube URL');

      return this.fetchVideoDetails(videoId);
    } catch (error) {
      console.error('Failed to get video details:', error);
      return {
        title: 'Untitled',
        duration: 0
      };
    }
  },

  // Métodos privados
  async fetchVideoById(videoId) {
    const cacheKey = `video-${videoId}`;
    
    return fetchWithCache(cacheKey, async () => {
      const { data } = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, {
        headers: getDefaultHeaders()
      });

      const titleMatch = data.match(/<meta name="title" content="([^"]*)/);
      const title = titleMatch ? titleMatch[1] : 'Untitled';

      const channelIdMatch = data.match(/{"url":"\/channel\/([^"]+)/);
      const channelId = channelIdMatch ? channelIdMatch[1] : '';

      return [{
        title: this.unescapeHtml(title),
        url: `https://youtu.be/${videoId}`,
        isElite: channelId === env.ELITE_CHANNEL_ID
      }];
    });
  },

  async searchVideosByQuery(query) {
    const cacheKey = `search-${query}`;
    
    return fetchWithCache(cacheKey, async () => {
      const { data } = await axios.get(
        `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
        { headers: getDefaultHeaders() }
      );

      const ytInitialDataRegex = /var ytInitialData\s*=\s*({.+?});<\/script>/is;
      const match = data.match(ytInitialDataRegex);
      
      if (!match) return [];
      
      const searchData = JSON.parse(match[1]);
      const videos = [];

      const contents = searchData.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents || [];

      for (const content of contents) {
        try {
          if (content.videoRenderer && content.videoRenderer.videoId) {
            const vr = content.videoRenderer;
            const channelId = vr.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId || '';
            
            videos.push({
              title: this.unescapeHtml(vr.title?.runs?.[0]?.text || 'Untitled'),
              url: `https://youtu.be/${vr.videoId}`,
              isElite: channelId === env.ELITE_CHANNEL_ID
            });

            if (videos.length >= 20) break;
          }
        } catch (e) {
          console.error('Error parsing video result:', e);
        }
      }

      return videos.sort((a, b) => b.isElite - a.isElite);
    });
  },

  async fetchVideoDetails(videoId) {
    const cacheKey = `details-${videoId}`;
    
    return fetchWithCache(cacheKey, async () => {
      const { data } = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, {
        headers: getDefaultHeaders()
      });

      // Extrair título
      const titleMatch = data.match(/<meta name="title" content="([^"]*)/);
      const title = titleMatch ? this.unescapeHtml(titleMatch[1]) : 'Untitled';

      console.log('Título do vídeo:', title); // Log para debug

      // Extrair duração
      let duration = 0;
      const durationMatch = data.match(/"approxDurationMs":"(\d+)"/);
      if (durationMatch) {
        duration = Math.round(parseInt(durationMatch[1], 10) / 1000);
      } else {
        const isoMatch = data.match(/<meta itemprop="duration" content="(PT[\w\d]+)"/);
        if (isoMatch) duration = parseDuration(isoMatch[1]).totalSeconds;
      }

      return {
        title,
        duration: duration || 0
      };
    });
  },

  unescapeHtml(text) {
    return text.replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'");
  }
};