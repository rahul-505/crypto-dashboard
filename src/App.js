import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import './App.css';
import { Sparklines, SparklinesLine } from 'react-sparklines';

// Main App component 

const App = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [currency, setCurrency] = useState('usd');
  const [search, setSearch] = useState('');
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [coinChartData, setCoinChartData] = useState(null);
  const [refresh, setRefresh] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [days, setDays] = useState('7');
  const [news, setNews] = useState([]);
  const [priceHistory, setPriceHistory] = useState({});

  const fetchData = React.useCallback(async () => {
    try {
      const res = await axios.get(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=10&page=1&sparkline=true`
      );
      setFilteredData(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [currency]);

  
  const fetchChart = async (id) => {
    try {
      const res = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=${currency}&days=${days}`
      );
      setCoinChartData({
        labels: res.data.prices.map((price) => new Date(price[0]).toLocaleDateString()),
        datasets: [
          {
            label: `${id.toUpperCase()} Price Trend`,
            data: res.data.prices.map((price) => price[1]),
            borderColor: '#4bc0c0',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.3,
          },
        ],
      });
    } catch (err) {
      console.error(err);
    }
  }
  // Remove invalid fetchNews and duplicate useEffect
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      if (refresh) fetchData();
    }, 60000);
    return () => clearInterval(interval);
  }, [currency, refresh, fetchData]);

  useEffect(() => {
    const fetchRealNews = async () => {
      try {
    // Using CryptoPanic API (get free token from their website)
        const response = await axios.get(`https://cryptopanic.com/api/v1/posts/?auth_token=YOUR_API_KEY&public=true`);
        const formattedNews = response.data.results.slice(0, 5).map(item => ({
          title: item.title,
          summary: item.metadata.description || "Click to read more...",
          source: item.domain || "CryptoPanic",
          date: new Date(item.created_at).toLocaleDateString(),
          url: item.url,
          id: item.id || item.url // Ensure id exists for key prop
        }));
        setNews(formattedNews);
      } catch (error) {
        console.error("Failed to fetch news, using placeholder", error);
      }
    };
    fetchRealNews();
  }, []);

  // Fallback to placeholder news if API fails
  useEffect(() => {
    if (news.length === 0) {
      setNews([
        { title: "Crypto Market Update", source: "Crypto News", url: "#", id: 1 },
        { title: "Bitcoin Hits New Highs", source: "Crypto Times", url: "#", id: 2 },
        { title: "Ethereum Upgrades Announced", source: "Blockchain Daily", url: "#", id: 3 },
      ]);
    }
  }, [news]);

  // Dark mode toggle effect  
    
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  ;
  //websocket connection 
  useEffect(() => {
    const socket = new WebSocket('wss://ws.coingecko.com/api/v3/coins/markets?vs_currency=usd');
    socket.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      setPriceHistory(prev => {
        const updated = { ...prev };
        newData.forEach(coin => {
          if (!updated[coin.id]) {
            updated[coin.id] = [];
          }
          updated[coin.id] = [...updated[coin.id].slice(-100)]; // Keep last 100 prices
          updated[coin.id].push(coin.current_price);

        });
        return updated;

      });
    };
    return () => {
      socket.close();
    };
  }, []);


  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      <div className="header-bar">
        <h1 className="title"> Live Crypto Dashboard</h1>
        <button className="mode-toggle" onClick={() => setDarkMode(!darkMode  )}>
          {darkMode ? '🌙' : '😎'}
        </button>
      </div>
      
      <div className="controls">
        <input
          type="text"
          placeholder="Search Coin..."
          onChange={(e) => setSearch(e.target.value)}
          className="search-bar"
        />
        <select onChange={(e) => setCurrency(e.target.value)} value={currency} className="dropdown">
          <option value="usd">USD</option>
          <option value="inr">INR</option>
          <option value="eur">EUR</option>
        </select>
        <select onChange={(e) => setDays(e.target.value)} value={days} className="dropdown">
          <option value="1">1 Day</option>
          <option value="7">7 Days</option>
          <option value="30">30 Days</option>          
        </select>
        <label className="switch">
          <input type="checkbox" checked={refresh} onChange={() => setRefresh(!refresh)} />
          <span className="slider"></span>
        </label>
        <span className="toggle-label">Auto Refresh</span>
      </div>

      <div className="dashboard">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Coin</th>
                <th>Price</th>
                <th>24H CHANGE</th>
                <th>Market Cap</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {filteredData
                .filter((coin) =>
                  coin.name.toLowerCase().includes(search.toLowerCase()) ||
                  coin.symbol.toLowerCase().includes(search.toLowerCase())
                )
                .map((coin) => (
                  <tr key={coin.id} onClick={() => { setSelectedCoin(coin.id); fetchChart(coin.id); }}>
                    <td>
                      <img src={coin.image} alt={coin.name} height="20" /> {coin.name}
                    </td>
                    <td>
                      {currency.toUpperCase()} {coin.current_price.toLocaleString()}
                    </td>
                    <td className={coin.price_change_percentage_24h >= 0 ? 'green' : 'red'}>
                      {coin.price_change_percentage_24h.toFixed(2)}%
                    </td>
                    <td>{coin.market_cap.toLocaleString()}</td>
                    <td>
                      {coin.sparkline_in_7d?.price && (
                        <Sparklines data={coin.sparkline_in_7d.price} width={100} height={40}>
                          <SparklinesLine color={coin.price_change_percentage_24h >=0? '#4caf50' : '#f44336'}/>
                        </Sparklines>
                      )}
                       
                    </td>
                    <td
                      className="trend-cell">
                        {priceHistory[coin.id] && (
                          <PriceChart 
                            data={priceHistory[coin.id]} 
                            width={120} 
                            height={40} 
                            color={coin.price_change_percentage_24h >= 0 ? '#4CAF50' : '#F44336'}
                          />
                        )}

                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>        
      </div>
      {coinChartData && (
        <div className="chart-container">
          <h2>📊 {selectedCoin.toUpperCase()} - Last {days} Days</h2>
          <Line data={coinChartData} />
        </div>
      )}
      <div className="news-container">
        <h2>📰 Latest Crypto News</h2>
        <ul>
          {news.map((item) => (
            <li key={item.id}>
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                {item.title}
              </a>
              <span className="news-source"> - {item.source}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="footer">
        <p>Made with ❤️ by Cryptoenthusiasts</p>
        <p>© 2025 Crypto Dashboard</p>
      </div>

      
    </div>
  );
};

// Simple PriceChart component using react-sparklines
const PriceChart = ({ data, width, height, color }) => (
  <Sparklines data={data} width={width} height={height}>
    <SparklinesLine color={color} />
  </Sparklines>
);

export default App;
