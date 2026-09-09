import React, { useState, useEffect, useRef } from "react";
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
  Filler,
} from "chart.js";
import { Activity } from "lucide-react";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TIMEFRAMES = [
  { id: "live", label: "LIVE 5s" },
  { id: "1d", label: "1D", days: 1, interval: "15m", limit: 96 },
  { id: "7d", label: "7D", days: 7, interval: "1h", limit: 168 },
  { id: "30d", label: "30D", days: 30, interval: "4h", limit: 180 },
  { id: "60d", label: "60D", days: 60, interval: "1d", limit: 60 },
];

const CryptoChart = ({ coinSymbol = "BTCUSDT" }) => {
  const [priceData, setPriceData] = useState([]);
  const [timeLabels, setTimeLabels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastPrice, setLastPrice] = useState(null);
  const [highPrice, setHighPrice] = useState(null);
  const [lowPrice, setLowPrice] = useState(null);
  const [chartMode, setChartMode] = useState("live");
  const [error, setError] = useState(null);

  const chartRef = useRef(null);

  useEffect(() => {
    setPriceData([]);
    setTimeLabels([]);
    setIsLoading(true);
    setLastPrice(null);
    setHighPrice(null);
    setLowPrice(null);
    setError(null);
  }, [coinSymbol, chartMode]);

  useEffect(() => {
    const symbol = coinSymbol;
    let intervalId = null;

    if (chartMode !== "live") {
      const tfConfig = TIMEFRAMES.find((t) => t.id === chartMode) || TIMEFRAMES[1];
      const fetchHistoricalData = async () => {
        try {
          const now = Date.now();
          const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${tfConfig.interval}&limit=${tfConfig.limit}&endTime=${now}`;
          const response = await fetch(url);
          if (!response.ok) throw new Error(`API error: ${response.status}`);
          const data = await response.json();

          const prices = data.map((entry) => parseFloat(entry[4]));
          const times = data.map((entry) => {
            const d = new Date(entry[0]);
            return chartMode === "1d"
              ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : d.toLocaleDateString([], { month: "short", day: "numeric" });
          });

          setPriceData(prices);
          setTimeLabels(times);
          if (prices.length > 0) {
            setLastPrice(prices[prices.length - 1]);
            setHighPrice(Math.max(...prices));
            setLowPrice(Math.min(...prices));
          }
          setIsLoading(false);
        } catch (err) {
          console.error("Historical chart error:", err);
          setError(`Unable to stream market candles: ${err.message}`);
          setIsLoading(false);
        }
      };

      fetchHistoricalData();
      return () => intervalId && clearInterval(intervalId);
    }

    // Live Streaming Mode (5s polling)
    const fetchLivePrice = async () => {
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`
        );
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        const price = parseFloat(data.price);
        const now = new Date();
        const timeLabel = now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        setPriceData((prev) => {
          const next = [...prev, price].slice(-24);
          setHighPrice(Math.max(...next));
          setLowPrice(Math.min(...next));
          return next;
        });
        setTimeLabels((prev) => [...prev, timeLabel].slice(-24));
        setLastPrice(price);
        setIsLoading(false);
      } catch (err) {
        console.error("Live price chart error:", err);
        setError(`Unable to stream live ticks: ${err.message}`);
        setIsLoading(false);
      }
    };

    fetchLivePrice();
    intervalId = setInterval(fetchLivePrice, 5000);

    return () => intervalId && clearInterval(intervalId);
  }, [coinSymbol, chartMode]);

  const isTrendingUp =
    priceData.length > 1
      ? priceData[priceData.length - 1] >= priceData[0]
      : true;

  const strokeColor = isTrendingUp ? "#10b981" : "#f43f5e";
  const fillColor = isTrendingUp
    ? "rgba(16, 185, 129, 0.08)"
    : "rgba(244, 63, 94, 0.08)";

  const chartData = {
    labels: timeLabels,
    datasets: [
      {
        label: `${coinSymbol} Price`,
        data: priceData,
        borderColor: strokeColor,
        backgroundColor: fillColor,
        fill: true,
        borderWidth: 2,
        tension: 0.35,
        pointRadius: chartMode === "live" ? 3 : 1,
        pointHoverRadius: 6,
        pointBackgroundColor: strokeColor,
        pointBorderColor: "var(--bg-primary)",
        pointBorderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        backgroundColor: "rgba(8, 12, 22, 0.95)",
        titleColor: "#94a3b8",
        bodyColor: "#38bdf8",
        bodyFont: { family: "JetBrains Mono", size: 13, weight: "bold" },
        borderColor: "rgba(34, 211, 238, 0.25)",
        borderWidth: 1,
        padding: 14,
        boxPadding: 6,
        cornerRadius: 10,
        usePointStyle: true,
        displayColors: false,
        callbacks: {
          label: (context) => {
            const val = context.parsed.y;
            return `$${val < 1 ? val.toFixed(5) : val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.03)",
          drawBorder: false,
        },
        ticks: {
          color: "#475569",
          font: { family: "JetBrains Mono", size: 10 },
          maxTicksLimit: 7,
          padding: 8,
        },
      },
      y: {
        position: "right",
        grid: {
          color: "rgba(255, 255, 255, 0.03)",
          drawBorder: false,
        },
        ticks: {
          color: "#475569",
          font: { family: "JetBrains Mono", size: 10 },
          padding: 12,
          callback: (value) => `$${value < 1 ? value.toFixed(4) : value.toLocaleString()}`,
        },
      },
    },
  };

  const formattedPrice = lastPrice
    ? lastPrice < 1
      ? lastPrice.toFixed(5)
      : lastPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "--";

  return (
    <div className="glass-card-elevated rounded-2xl p-6 md:p-7 shadow-2xl relative overflow-hidden">
      {/* Top Header & Price Overview */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-6 border-b border-white/[0.06] mb-6">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2.5">
            <span className="text-xs font-mono uppercase font-bold text-cyan-400 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              {coinSymbol}
            </span>
            <div className="flex items-center space-x-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {chartMode === "live" ? "Streaming Real-Time Ticks" : "Candle History"}
              </span>
            </div>
          </div>

          <div className="flex items-baseline space-x-3 mt-2">
            <span className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black tracking-tight text-white num-font">
              ${formattedPrice}
            </span>
            {highPrice && lowPrice && (
              <div className="hidden sm:flex items-center space-x-4 text-xs font-mono text-slate-400">
                <span>H: <strong className="text-emerald-400 font-normal">${lowPrice < 1 ? highPrice.toFixed(4) : highPrice.toLocaleString()}</strong></span>
                <span>L: <strong className="text-rose-400 font-normal">${lowPrice < 1 ? lowPrice.toFixed(4) : lowPrice.toLocaleString()}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Timeframe Switcher Pills */}
        <div className="flex items-center space-x-1 bg-slate-950/70 p-1.5 rounded-xl border border-white/[0.06] self-start lg:self-center overflow-x-auto max-w-full">
          {TIMEFRAMES.map((tf) => {
            const active = chartMode === tf.id;
            return (
              <button
                key={tf.id}
                onClick={() => setChartMode(tf.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                {tf.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Canvas Area */}
      {error ? (
        <div className="h-[380px] flex items-center justify-center p-6 text-center text-rose-400 text-sm">
          {error}
        </div>
      ) : isLoading && priceData.length === 0 ? (
        <div className="h-[380px] flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Loading market stream...</p>
        </div>
      ) : (
        <div className="h-[380px] sm:h-[420px] w-full relative">
          <Line ref={chartRef} data={chartData} options={chartOptions} />
        </div>
      )}

      {/* Footer Info Bar */}
      <div className="mt-5 pt-4 border-t border-white/[0.05] flex items-center justify-between text-[11px] font-mono text-slate-500">
        <span className="flex items-center space-x-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Binance Public Market Stream</span>
        </span>
        <span>Precision 64-bit float</span>
      </div>
    </div>
  );
};

export default CryptoChart;
