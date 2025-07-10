import express from 'express';
import { fetchCareerBlogs } from '../services/gnewsService.js';

const router = express.Router();

// GET /api/blogs
router.get('/', async (req, res) => {
  try {
    const articles = await fetchCareerBlogs();
    res.json({ articles });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blog articles.' });
  }
});

export default router; 