import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Article {
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source: { name: string };
}

const PAGE_SIZE = 8;
const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1515168833906-d2a3b82b302b?auto=format&fit=crop&w=600&q=80';

function stripHtml(html: string): string {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function truncate(text: string, maxLength: number): string {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
    <div className="spinner" style={{
      width: 48, height: 48, border: '5px solid #ede9fe', borderTop: '5px solid #7c3aed', borderRadius: '50%', animation: 'spin 1s linear infinite'
    }} />
    <style>{`
      @keyframes spin { 100% { transform: rotate(360deg); } }
    `}</style>
  </div>
);

const CareerBlog: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('https://jobnest-project.onrender.com/api/blogs');
        const data = await res.json();
        setArticles(data.articles || []);
      } catch (err) {
        setError('Failed to load blog articles.');
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f3f4f6 0%, #ede9fe 100%)', padding: '2rem 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1rem' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'linear-gradient(90deg, #7c3aed 0%, #5b21b6 100%)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 15,
            padding: '0.5rem 1.5rem',
            border: 'none',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(91,33,182,0.10)',
            cursor: 'pointer',
            marginBottom: 24,
            transition: 'background 0.18s',
            display: 'block',
          }}
          aria-label="Go to Home"
        >
          Home
        </button>
        <h1 style={{ fontSize: '2.7rem', fontWeight: 800, marginBottom: '2rem', textAlign: 'center', color: '#5b21b6', letterSpacing: -1 }}>
          Career Blog
        </h1>
        <p style={{ textAlign: 'center', color: '#444', marginBottom: 32, fontSize: 18 }}>
          Curated articles for job seekers and employers: career advice, job search tips, resume writing, and more.
        </p>
        {loading && <Spinner />}
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          marginBottom: 32,
        }}>
          {articles.slice(0, visibleCount).map((article, idx) => (
            <div
              key={idx}
              style={{
                background: '#fff',
                borderRadius: 18,
                boxShadow: '0 4px 24px rgba(91,33,182,0.10)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 420,
                transition: 'transform 0.18s, box-shadow 0.18s',
                cursor: 'pointer',
                border: '1px solid #ede9fe',
                position: 'relative',
                zIndex: 1,
                willChange: 'transform',
                animation: 'fadeIn 0.7s',
              }}
              tabIndex={0}
              aria-label={article.title}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px) scale(1.025)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(91,33,182,0.13)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = '';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 24px rgba(91,33,182,0.10)';
              }}
            >
              <img
                src={article.urlToImage || DEFAULT_IMAGE}
                alt={article.title}
                style={{
                  width: '100%',
                  height: 180,
                  objectFit: 'cover',
                  background: '#f3f4f6',
                  borderTopLeftRadius: 18,
                  borderTopRightRadius: 18,
                  transition: 'opacity 0.4s',
                  opacity: 1,
                }}
                onError={e => {
                  (e.currentTarget as HTMLImageElement).src = DEFAULT_IMAGE;
                }}
                loading="lazy"
              />
              <div style={{ padding: '1.2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ fontSize: '1.18rem', fontWeight: 700, marginBottom: 10, color: '#312e81', lineHeight: 1.3 }}>{article.title}</h2>
                <p style={{ flex: 1, color: '#444', marginBottom: 14, fontSize: 15, lineHeight: 1.6 }}>
                  {truncate(stripHtml(article.description), 150)}
                </p>
                <div style={{ fontSize: 13, color: '#8b5cf6', marginBottom: 10, fontWeight: 500 }}>
                  {article.source?.name} &middot; {formatDate(article.publishedAt)}
                </div>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#fff',
                    background: 'linear-gradient(90deg, #7c3aed 0%, #5b21b6 100%)',
                    fontWeight: 600,
                    textDecoration: 'none',
                    padding: '0.5rem 1.1rem',
                    borderRadius: 8,
                    alignSelf: 'flex-start',
                    marginTop: 'auto',
                    fontSize: 15,
                    boxShadow: '0 2px 8px rgba(91,33,182,0.08)',
                    transition: 'background 0.18s',
                  }}
                  aria-label={`Read more about ${article.title}`}
                >
                  Read More &rarr;
                </a>
              </div>
            </div>
          ))}
        </div>
        {!loading && articles.length === 0 && !error && (
          <p style={{ textAlign: 'center', marginTop: 32 }}>No articles found. Try again later.</p>
        )}
        {!loading && visibleCount < articles.length && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 36 }}>
            <button
              onClick={handleLoadMore}
              style={{
                background: 'linear-gradient(90deg, #7c3aed 0%, #5b21b6 100%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 16,
                padding: '0.7rem 2.2rem',
                border: 'none',
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(91,33,182,0.10)',
                cursor: 'pointer',
                transition: 'background 0.18s',
              }}
              aria-label="Load more articles"
            >
              Load More
            </button>
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
};

export default CareerBlog; 