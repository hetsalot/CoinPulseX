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
  BTC: { symbol: "BTCUSDT", name: "Bitcoin" },
  ETH: { symbol: "ETHUSDT", name: "Ethereum" },
  SOL: { symbol: "SOLUSDT", name: "Solana" },
  BNB: { symbol: "BNBUSDT", name: "Binance Coin" },
  XRP: { symbol: "XRPUSDT", name: "XRP (Ripple)" },
  ADA: { symbol: "ADAUSDT", name: "Cardano" },
  DOGE: { symbol: "DOGEUSDT", name: "Dogecoin" },
  AVAX: { symbol: "AVAXUSDT", name: "Avalanche" },
  LINK: { symbol: "LINKUSDT", name: "Chainlink" },
  SUI: { symbol: "SUIUSDT", name: "Sui" },
  LTC: { symbol: "LTCUSDT", name: "Litecoin" },
  NEAR: { symbol: "NEARUSDT", name: "NEAR Protocol" },
  DOT: { symbol: "DOTUSDT", name: "Polkadot" },
  UNI: { symbol: "UNIUSDT", name: "Uniswap" },
  BCH: { symbol: "BCHUSDT", name: "Bitcoin Cash" },
  APT: { symbol: "APTUSDT", name: "Aptos" },
  ICP: { symbol: "ICPUSDT", name: "Internet Computer" },
  SHIB: { symbol: "SHIBUSDT", name: "Shiba Inu" },
  ATOM: { symbol: "ATOMUSDT", name: "Cosmos" },
  ALGO: { symbol: "ALGOUSDT", name: "Algorand" },
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
    <div className="glass-card rounded-2xl p-6 shadow-2xl relative overflow-hidden transition-all duration-300">
      {/* Background radial accent */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/[0.04] rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

      {/* Top Selector Bar */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
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
            className="appearance-none bg-slate-900/80 text-white font-semibold text-xs sm:text-sm pl-4 pr-9 py-2.5 rounded-xl border border-white/[0.08] hover:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 cursor-pointer shadow-inner"
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
        <div className="space-y-5">
          {/* Main Price & Delta Banner */}
          <div className="p-5 rounded-xl bg-slate-950/50 border border-white/[0.06] flex items-center justify-between">
            <div>
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider block">
                {selected} / USDT Spot
              </span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-white num-font">
                  ${data.price}
                </span>
              </div>
            </div>

            <div
              className={`flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-bold font-mono border ${
                isPositive
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 glow-emerald"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/25 glow-rose"
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
          <div className="grid grid-cols-2 gap-3">
            {/* 24h High */}
            <div className="p-4 rounded-xl bg-slate-900/40 border border-white/[0.05] hover:border-white/[0.1] transition-colors">
              <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mb-1.5">
                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                <span>24h High</span>
              </div>
              <p className="text-sm sm:text-base font-bold text-white num-font">
                ${data.high24h}
              </p>
            </div>

            {/* 24h Low */}
            <div className="p-4 rounded-xl bg-slate-900/40 border border-white/[0.05] hover:border-white/[0.1] transition-colors">
              <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mb-1.5">
                <ArrowDownRight className="w-3 h-3 text-rose-400" />
                <span>24h Low</span>
              </div>
              <p className="text-sm sm:text-base font-bold text-white num-font">
                ${data.low24h}
              </p>
            </div>

            {/* 24h Volume */}
            <div className="p-4 rounded-xl bg-slate-900/40 border border-white/[0.05] hover:border-white/[0.1] transition-colors">
              <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mb-1.5">
                <BarChart3 className="w-3 h-3 text-cyan-400" />
                <span>24h Volume</span>
              </div>
              <p className="text-sm sm:text-base font-bold text-white num-font truncate">
                {data.volume} {selected}
              </p>
            </div>

            {/* 24h Turnover / Market Cap */}
            <div className="p-4 rounded-xl bg-slate-900/40 border border-white/[0.05] hover:border-white/[0.1] transition-colors">
              <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mb-1.5">
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
        <div className="p-10 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Syncing market feed...</p>
        </div>
      )}
    </div>
  );
};

export default CryptoPriceCard;
