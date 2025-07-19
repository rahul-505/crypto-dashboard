import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CryptoNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(
          'https://newsapi.org/v2/everything?q=cryptocurrency&apiKey=d236cab0d29e4ccbaf79e7cf50760e89'
        );
        setNews(response.data.Data.slice(0, 5)); 
        setLoading(false);
      } catch (error) {
        console.error('Error fetching news:', error);
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) return <div>Loading news...</div>;

  return (
    <div className="news-section">
      <h3>Latest Crypto News</h3>
      <div className="news-list">
        {news.map((item) => (
          <div key={item.id} className="news-item">
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              <img src={item.imageurl} alt={item.title} width="100" />
              <h4>{item.title}</h4>
              <p>{item.body.substring(0, 100)}...</p>
              <span>Source: {item.source}</span>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CryptoNews;