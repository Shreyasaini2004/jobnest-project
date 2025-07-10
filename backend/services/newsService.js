import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

// Google News RSS feeds for career-related topics
const RSS_FEEDS = [
  'https://news.google.com/rss/search?q=career+advice&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=job+search+tips&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=resume+writing&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=interview+preparation&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=remote+work&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=salary+negotiation&hl=en-US&gl=US&ceid=US:en'
];

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_"
});

export async function fetchCareerBlogsFromRSS() {
  try {
    const allArticles = [];
    
    // Fetch from multiple RSS feeds
    for (const feedUrl of RSS_FEEDS) {
      try {
        const response = await axios.get(feedUrl, {
          timeout: 5000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        const result = parser.parse(response.data);
        const items = result.rss?.channel?.item || [];
        
        // Transform RSS items to our format
        const articles = items.map(item => ({
          title: item.title || 'No Title',
          description: item.description || item['content:encoded'] || 'No description available',
          url: item.link || '#',
          urlToImage: extractImageFromContent(item['content:encoded'] || item.description) || 
                     'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
          publishedAt: item.pubDate || new Date().toISOString(),
          source: {
            name: item.source?.name || 'Google News'
          }
        }));
        
        allArticles.push(...articles);
      } catch (error) {
        console.error(`Error fetching RSS feed ${feedUrl}:`, error.message);
      }
    }
    
    // Remove duplicates based on title
    const uniqueArticles = removeDuplicates(allArticles, 'title');
    
    // Sort by date (newest first)
    uniqueArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    
    // Return top 20 articles
    return uniqueArticles.slice(0, 20);
    
  } catch (error) {
    console.error('Error fetching RSS feeds:', error.message);
    return getMockCareerArticles();
  }
}

function extractImageFromContent(content) {
  if (!content) return null;
  
  // Try to extract image from HTML content
  const imgMatch = content.match(/<img[^>]+src="([^"]+)"/i);
  if (imgMatch) {
    return imgMatch[1];
  }
  
  return null;
}

function removeDuplicates(articles, key) {
  const seen = new Set();
  return articles.filter(article => {
    const value = article[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

// Fallback mock data
function getMockCareerArticles() {
  return [
    {
      title: "10 Essential Resume Tips for 2024",
      description: "Learn the latest resume writing strategies that will help you stand out in today's competitive job market.",
      url: "https://example.com/resume-tips-2024",
      urlToImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400",
      publishedAt: new Date().toISOString(),
      source: { name: "Career Insights" }
    },
    {
      title: "Remote Work Trends: What Employers Need to Know",
      description: "Discover how remote work is reshaping the workplace and what companies are doing to adapt.",
      url: "https://example.com/remote-work-trends",
      urlToImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400",
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      source: { name: "Workplace Weekly" }
    },
    {
      title: "Interview Preparation: Questions You Should Ask",
      description: "Prepare for your next interview with these essential questions that will help you evaluate the opportunity.",
      url: "https://example.com/interview-questions",
      urlToImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400",
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      source: { name: "Job Search Pro" }
    },
    {
      title: "Salary Negotiation Strategies That Work",
      description: "Master the art of salary negotiation with these proven strategies and techniques.",
      url: "https://example.com/salary-negotiation",
      urlToImage: "https://images.unsplash.com/photo-1554224154-26032cdc-5d6b?w=400",
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      source: { name: "Career Finance" }
    },
    {
      title: "Building a Personal Brand for Career Growth",
      description: "Learn how to develop your personal brand to advance your career and open new opportunities.",
      url: "https://example.com/personal-branding",
      urlToImage: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400",
      publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      source: { name: "Professional Development" }
    },
    {
      title: "The Future of Work: AI and Automation",
      description: "Explore how artificial intelligence is transforming the workplace and what it means for your career.",
      url: "https://example.com/future-of-work",
      urlToImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400",
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      source: { name: "Tech Careers" }
    },
    {
      title: "Work-Life Balance in the Digital Age",
      description: "Discover strategies for maintaining a healthy work-life balance in today's always-connected world.",
      url: "https://example.com/work-life-balance",
      urlToImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
      publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      source: { name: "Wellness at Work" }
    },
    {
      title: "Networking Strategies for Career Success",
      description: "Build meaningful professional relationships that can accelerate your career growth.",
      url: "https://example.com/networking-strategies",
      urlToImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400",
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      source: { name: "Professional Networking" }
    }
  ];
} 