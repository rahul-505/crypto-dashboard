
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import React, { useEffect, useState } from 'react';


ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);


function CryptoChart({ coinId }) {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    async function fetchChartData() {
      const res = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`,
        {
          params: {
            vs_currency: 'usd',
            days: 7,
          },
        }
      );

      const prices = res.data.prices;

      setChartData({
        labels: prices.map((entry) =>
          new Date(entry[0]).toLocaleDateString()
        ),
        datasets: [
          {
            label: `${coinId} Price (USD)`,
            data: prices.map((entry) => entry[1]),
            borderColor: 'rgb(75, 192, 192)',
            fill: true,
          },
        ],
      });
    }

    if (coinId) {
      fetchChartData();
    }
  }, [coinId]);

  if (!chartData) return <p>Loading chart...</p>;

  return <Line data={chartData} />;
}

export default CryptoChart;
