import React, { useState, useEffect, useRef } from 'react';

const PriceChart = ({ coinId }) => {
  const [days, setDays] = useState(7);
  const [chartData, setChartData] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
      );
      const data = await res.json();
      setChartData(data.prices);
    };
    fetchData();
  }, [days, coinId]);

  useEffect(() => {
    if (!chartData) return;
  }, [chartData]);

  return (
    <div className="chart-container">
      <div className="duration-selector">
        {[1, 7, 30].map((day) => (
          <button
            key={day}
            onClick={() => setDays(day)}
            className={days === day ? 'active' : ''}
          >
            {day}D
          </button>
        ))}
      </div>
      <canvas ref={canvasRef} width={300} height={150} />
    {!chartData && (
      <div className="chart-Loading">Loading ...</div>
    )}
    </div>
    
  );
};

export default PriceChart;