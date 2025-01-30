import { google } from 'googleapis';
import axios from 'axios';
import { z } from 'zod';

// Configurações validadas com Zod
const envSchema = z.object({
  YOUTUBE_API_KEY: z.string().min(1),
  ELITE_CHANNEL_ID: z.string().min(1),
  CACHE_TTL: z.coerce.number().default(300_000) // 5 minutos
});

const env = envSchema.parse(process.env);

// Configuração otimizada da API
const youtube = google.youtube({
  version: 'v3',
  auth: env.YOUTUBE_API_KEY,
  params: {
    prettyPrint: false,
    alt: 'json'
  }
});

// Helpers reutilizáveis
const YOUTUBE_URL_REGEX = /^(https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})(?:[&?#].*)?$/i;
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
      return this.fallbackSearch(query);
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

      const details = await this.fetchVideoDetails(videoId);
      return VideoDetailsSchema.parse(details);
    } catch (error) {
      console.error('Failed to get video details:', error);
      return this.fallbackVideoDetails(youtubeLink);
    }
  },

  // Métodos privados
  async fetchVideoById(videoId) {
    const cacheKey = `video-${videoId}`;
    
    return fetchWithCache(cacheKey, async () => {
      const { data } = await youtube.videos.list({
        id: videoId,
        part: 'snippet',
        maxResults: 1
      });

      const item = data.items?.[0];
      if (!item) throw new Error('Video not found');

      return [{
        title: item.snippet.title,
        url: `https://youtu.be/${videoId}`,
        isElite: item.snippet.channelId === env.ELITE_CHANNEL_ID
      }];
    });
  },

  async searchVideosByQuery(query) {
    const cacheKey = `search-${query}`;
    
    return fetchWithCache(cacheKey, async () => {
      const { data } = await youtube.search.list({
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: 20,
        safeSearch: 'none'
      });

      return (data.items || []).map(item => ({
        title: item.snippet.title,
        url: `https://youtu.be/${item.id.videoId}`,
        isElite: item.snippet.channelId === env.ELITE_CHANNEL_ID
      })).sort((a, b) => b.isElite - a.isElite);
    });
  },

  async fetchVideoDetails(videoId) {
    const cacheKey = `details-${videoId}`;
    
    return fetchWithCache(cacheKey, async () => {
      const { data } = await youtube.videos.list({
        id: videoId,
        part: 'snippet,contentDetails'
      });

      const video = data.items?.[0];
      if (!video) throw new Error('Video not found');

      const duration = parseDuration(video.contentDetails.duration).totalSeconds || 0;
      
      return {
        title: video.snippet.title,
        duration: Number.isFinite(duration) ? duration : 0
      };
    });
  },

  async fallbackSearch(query) {
    try {
      const urlMatch = YOUTUBE_URL_REGEX.exec(query);
      if (urlMatch) {
        const videoId = urlMatch[2];
        const { data } = await axios.get(`https://youtube.com/watch?v=${videoId}`);
        
        const title = data.match(/<title>(.*?)<\/title>/)?.[1]
          ?.replace(/\s*-\s*YouTube$/, '') 
          || 'Untitled';

        return [{
          title,
          url: `https://youtu.be/${videoId}`,
          isElite: false
        }];
      }

      const { data } = await axios.get(
        `https://youtube.com/results?search_query=${encodeURIComponent(query)}`
      );

      const videoIds = [...new Set(
        [...data.matchAll(/"videoId":"([\w-]{11})"/g)]
          .map(m => m[1])
      )].slice(0, 20);

      const titles = [...data.matchAll(/"title":{"runs":\[{"text":"(.*?)"}/g)]
        .map(m => m[1]?.replace(/\\"/g, '"') || 'Untitled');

      return videoIds.map((id, index) => ({
        title: titles[index] || 'Untitled',
        url: `https://youtu.be/${id}`,
        isElite: false
      }));
    } catch (error) {
      throw new Error('All search methods failed');
    }
  },

  async fallbackVideoDetails(url) {
    try {
      const videoId = YOUTUBE_URL_REGEX.exec(url)?.[2];
      if (!videoId) throw new Error('Invalid URL');

      const { data } = await axios.get(`https://youtube.com/watch?v=${videoId}`);
      
      const title = data.match(/<meta property="og:title" content="(.*?)">/)?.[1]
        ?.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(code)) 
        || 'Untitled';

      const durationMatch = data.match(/"approxDurationMs":"(\d+)"/);
      const durationMs = durationMatch ? parseInt(durationMatch[1], 10) || 0 : 0;

      return {
        title,
        duration: Math.round(durationMs / 1000)
      };
    } catch (error) {
      console.error('Fallback video details failed:', error);
      return {
        title: 'Untitled',
        duration: 0
      };
    }
  }
};