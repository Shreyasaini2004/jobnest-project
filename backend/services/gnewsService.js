import axios from 'axios';

const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
const GNEWS_ENDPOINT = 'https://gnews.io/api/v4/search';

// Keywords for job seekers and employers
const DEFAULT_KEYWORDS = [
  'career advice',
  'job search',
  'resume tips',
  'interview',
  'hiring',
  'employer',
  'job market'
];

export async function fetchCareerBlogs(keywords = DEFAULT_KEYWORDS) {
  const query = keywords.join(' OR ');
  try {
    const response = await axios.get(GNEWS_ENDPOINT, {
      params: {
        q: query,
        token: GNEWS_API_KEY,
        lang: 'en',
        max: 20
      }
    });
    return response.data.articles;
  } catch (error) {
    console.error('Error fetching blogs from GNews:', error.message);
    return [];
  }
} 