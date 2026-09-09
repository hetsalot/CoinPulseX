import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Coins,
  ChevronDown,
  Radio,
} from "lucide-react";

export const COINS = {
  BTC: { symbol: "BTCUSDT", name: "Bitcoin", color: "text-amber-400", bg: "bg-amber-500/10" },
  ETH: { symbol: "ETHUSDT", name: "Ethereum", color: "text-indigo-400", bg: "bg-indigo-500/10" },
  SOL: { symbol: "SOLUSDT", name: "Solana", color: "text-purple-400", bg: "bg-purple-500/10" },
  ADA: { symbol: "ADAUSDT", name: "Cardano", color: "text-blue-400", bg: "bg-blue-500/10" },
  XRP: { symbol: "XRPUSDT", name: "XRP", color: "text-cyan-400", bg: "bg-cyan-500/10" },
  LTC: { symbol: "LTCUSDT", name: "Litecoin", color: "text-slate-300", bg: "bg-slate-500/10" },
  BNB: { symbol: "BNBUSDT", name: "BNB", color: "text-yellow-400", bg: "bg-yellow-500/10" },
  DOGE: { symbol: "DOGEUSDT", name: "Dogecoin", color: "text-amber-300", bg: "bg-amber-500/10" },
  DOT: { symbol: "DOTUSDT", name: "Polkadot", color: "text-pink-400", bg: "bg-pink-500/10" },
  AVAX: { symbol: "AVAXUSDT", name: "Avalanche", color: "text-red-400", bg: "bg-red-500/10" },
  UNI: { symbol: "UNIUSDT", name: "Uniswap", color: "text-pink-500", bg: "bg-pink-500/10" },
  LINK: { symbol: "LINKUSDT", name: "Chainlink", color: "text-blue-500", bg: "bg-blue-500/10" },
  BCH: { symbol: "BCHUSDT", name: "Bitcoin Cash", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ALGO: { symbol: "ALGOUSDT", name: "Algorand", color: "text-teal-400", bg: "bg-teal-500/10" },
};

const CryptoPriceCard = ({ selectedCoin = "BTC", onCoinChange, onPriceUpdate }) => {
  const [selected, setSelected] = useState(selectedCoin);
  const [data, setData] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (selectedCoin && selectedCoin !== selected) {
      setSelected(selectedCoin);
    }
  }, [selectedCoin]);

  const format = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    return num < 1 ? num.toFixed(5) : num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const fetchStats = async (symbol) => {
    try {
      const coinConfig = COINS[symbol];
      if (!coinConfig) return;
      
      setIsUpdating(true);
      const res = await fetch(
        `https://api.binance.com/api/v3/ticker/24hr?symbol=${coinConfig.symbol}`
      );
      const json = await res.json();
      const rawPrice = parseFloat(json.lastPrice);
      const price = format(rawPrice);
      const volume = format(json.volume);
      const marketCap = format(rawPrice * parseFloat(json.volume));
      const high24h = format(json.highPrice);
      const low24h = format(json.lowPrice);
      const priceChange = parseFloat(json.priceChangePercent).toFixed(2);

      const stats = { price, rawPrice, volume, marketCap, high24h, low24h, priceChange };
      setData(stats);

      if (onPriceUpdate) onPriceUpdate(price);
    } catch (err) {
      console.error("Error fetching Binance stats:", err);
    } finally {
      setTimeout(() => setIsUpdating(false), 600);
    }
  };

  useEffect(() => {
    fetchStats(selected);
    const interval = setInterval(() => fetchStats(selected), 5000);
    return () => clearInterval(interval);
  }, [selected]);

  const handleCoinSelect = (newCoin) => {
    setSelected(newCoin);
    if (onCoinChange) onCoinChange(newCoin);
  };

  const isPositive = data ? parseFloat(data.priceChange) >= 0 : true;

  return (
    <div className="glass-card rounded-2xl p-5 shadow-2xl relative overflow-hidden transition-all duration-300">
      {/* Background radial accent */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

      {/* Top Selector Bar */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Radio className={`w-4 h-4 ${isUpdating ? "text-cyan-300 animate-spin" : "text-cyan-400"}`} />
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Market HUD
            </h2>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-mono text-slate-400">Binance Live Feed</span>
            </div>
          </div>
        </div>

        {/* Styled Coin Dropdown */}
        <div className="relative">
          <select
            value={selected}
            onChange={(e) => handleCoinSelect(e.target.value)}
            className="appearance-none bg-slate-900/90 text-white font-semibold text-xs sm:text-sm pl-3.5 pr-8 py-2 rounded-xl border border-white/10 hover:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer shadow-inner"
          >
            {Object.keys(COINS).map((coin) => (
              <option key={coin} value={coin} className="bg-slate-950 text-white">
                {coin} — {COINS[coin].name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {data ? (
        <div className="space-y-4">
          {/* Main Price & Delta Banner */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/[0.06] flex items-center justify-between">
            <div>
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider block">
                {selected} / USDT Spot
              </span>
              <div className="flex items-baseline space-x-2 mt-0.5">
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-white num-font">
                  ${data.price}
                </span>
              </div>
            </div>

            <div
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-bold font-mono border ${
                isPositive
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 glow-emerald"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/30 glow-rose"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>
                {isPositive ? "+" : ""}
                {data.priceChange}%
              </span>
            </div>
          </div>

          {/* 4-Stat Metric Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* 24h High */}
            <div className="p-3 rounded-xl bg-slate-900/50 border border-white/[0.05]">
              <div className="flex items-center space-x-1 text-[11px] text-slate-400 mb-1">
                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                <span>24h High</span>
              </div>
              <p className="text-sm sm:text-base font-bold text-white num-font">
                ${data.high24h}
              </p>
            </div>

            {/* 24h Low */}
            <div className="p-3 rounded-xl bg-slate-900/50 border border-white/[0.05]">
              <div className="flex items-center space-x-1 text-[11px] text-slate-400 mb-1">
                <ArrowDownRight className="w-3 h-3 text-rose-400" />
                <span>24h Low</span>
              </div>
              <p className="text-sm sm:text-base font-bold text-white num-font">
                ${data.low24h}
              </p>
            </div>

            {/* 24h Volume */}
            <div className="p-3 rounded-xl bg-slate-900/50 border border-white/[0.05]">
              <div className="flex items-center space-x-1 text-[11px] text-slate-400 mb-1">
                <BarChart3 className="w-3 h-3 text-cyan-400" />
                <span>24h Volume</span>
              </div>
              <p className="text-sm sm:text-base font-bold text-white num-font truncate">
                {data.volume} {selected}
              </p>
            </div>

            {/* 24h Turnover / Market Cap */}
            <div className="p-3 rounded-xl bg-slate-900/50 border border-white/[0.05]">
              <div className="flex items-center space-x-1 text-[11px] text-slate-400 mb-1">
                <Coins className="w-3 h-3 text-amber-400" />
                <span>24h Turnover</span>
              </div>
              <p className="text-sm sm:text-base font-bold text-white num-font truncate">
                ${data.marketCap}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Syncing market feed...</p>
        </div>
      )}
    </div>
  );
};

export default CryptoPriceCard;
