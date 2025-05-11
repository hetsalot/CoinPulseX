import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const CryptoChart = ({ coinSymbol = "BTCUSDT" }) => {
  const [priceData, setPriceData] = useState([]);
  const [timeLabels, setTimeLabels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastPrice, setLastPrice] = useState(null);
  const [chartMode, setChartMode] = useState("live"); // "live" or "historical"
  const [error, setError] = useState(null);

  useEffect(() => {
    setPriceData([]);
    setTimeLabels([]);
    setIsLoading(true);
    setLastPrice(null);
    setError(null);
  }, [coinSymbol, chartMode]);

  useEffect(() => {
    const symbol = coinSymbol;

    let intervalId = null;

    if (chartMode === "historical") {
      const fetchHistoricalData = async () => {
        try {
          const now = Date.now();
          const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1d&limit=60&endTime=${now}`;
          const response = await fetch(url);
          if (!response.ok) throw new Error(`API status: ${response.status}`);
          const data = await response.json();

          const prices = data.map((entry) => parseFloat(entry[4]));
          const times = data.map((entry) =>
            new Date(entry[0]).toLocaleDateString()
          );

          setPriceData(prices);
          setTimeLabels(times);
          setLastPrice(prices[prices.length - 1]);
          setIsLoading(false);
        } catch (error) {
          setError(`Failed to load historical data: ${error.message}`);
          setIsLoading(false);
        }
      };

      fetchHistoricalData();
      return () => intervalId && clearInterval(intervalId);
    }

    const fetchPrice = async () => {
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`
        );
        if (!response.ok) throw new Error(`API status: ${response.status}`);
        const data = await response.json();
        const price = parseFloat(data.price);
        const now = new Date();
        const timeLabel = now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        setPriceData((prev) => [...prev, price].slice(-20));
        setTimeLabels((prev) => [...prev, timeLabel].slice(-20));
        setLastPrice(price);
        setIsLoading(false);
      } catch (error) {
        setError(`Failed to load price data: ${error.message}`);
        setIsLoading(false);
      }
    };

    fetchPrice();
    intervalId = setInterval(fetchPrice, 5000);

    return () => intervalId && clearInterval(intervalId);
  }, [coinSymbol, chartMode]);

  const chartData = {
    labels: timeLabels,
    datasets: [
      {
        label: "Price",
        data: priceData,
        borderColor:
          priceData[priceData.length - 1] > priceData[priceData.length - 2]
            ? "green"
            : "red",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `Price Chart for ${coinSymbol}`,
      },
    },
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-center md:items-start">
        <h2 className="text-md sm:text-xl md:text-2xl font-semibold text-white mb-4 md:mb-0">
          Current Price: ${lastPrice}
        </h2>

        <div className="flex flex-row space-x-4">
          <button
            className={`px-6 py-2 rounded-md cursor-pointer transition-all hover:animate-pulse ${
              chartMode === "live"
                ? "bg-cyan-400 text-black font-semibold"
                : "bg-gray-800 text-white"
            }`}
            onClick={() => setChartMode("live")}
          >
            Live
          </button>
          <button
            className={`px-6 py-2 rounded-md cursor-pointer hover:animate-pulse transition-all ${
              chartMode === "historical"
                ? "bg-cyan-400 text-black font-semibold"
                : "text-white bg-gray-800"
            }`}
            onClick={() => setChartMode("historical")}
          >
            Historical
          </button>
        </div>
      </div>
      {error ? (
        <div className="text-red-500 mt-4">{error}</div>
      ) : (
        <>
          {isLoading ? (
            <div className="text-center text-gray-400">Loading chart...</div>
          ) : (
            <div className="overflow-x-auto w-full">
              <div className="min-w-[500px]">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          )}
          <div className="mt-4 text-center">
            <h2 className="text-md sm:text-xl font-semibold text-white">
              Real-time Price Chart
            </h2>
          </div>
        </>
      )}
    </div>
  );
};

export default CryptoChart;
