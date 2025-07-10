import express from 'express';
import { fetchCareerBlogs } from '../services/gnewsService.js';
import { fetchCareerBlogsFromRSS } from '../services/newsService.js';

const router = express.Router();

// GET /api/blogs
router.get('/', async (req, res) => {
  try {
    let articles = [];
    
    // Try RSS feeds first (free, no API key needed)
    try {
      articles = await fetchCareerBlogsFromRSS();
      console.log(`✅ Fetched ${articles.length} articles from RSS feeds`);
    } catch (rssError) {
      console.error('RSS fetch failed, trying NewsAPI:', rssError.message);
      
      // Fallback to NewsAPI if RSS fails
      try {
        articles = await fetchCareerBlogs();
        console.log(`✅ Fetched ${articles.length} articles from NewsAPI`);
      } catch (newsApiError) {
        console.error('NewsAPI also failed:', newsApiError.message);
        // Both failed, return empty array (fallback data is handled in the services)
        articles = [];
      }
    }
    
    res.json({ articles });
  } catch (error) {
    console.error('Blogs route error:', error);
    res.status(500).json({ error: 'Failed to fetch blog articles.' });
  }
});

export default router; 