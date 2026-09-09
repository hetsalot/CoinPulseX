import React, { useState, Suspense } from "react";
import CryptoPriceCard, { COINS } from "../components/CryptoPriceCard";
import UserBalance from "../components/UserBalance";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Wallet,
  Activity,
  Layers,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const BuySellPannel = React.lazy(() => import("../components/BuySellPannel"));
const CryptoChart = React.lazy(() => import("../components/CryptoChart"));

const TOP_WATCHLIST = ["BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "DOGE", "AVAX"];

const Dashboard = () => {
  const { user } = useAuth();
  const [selectedCoin, setSelectedCoin] = useState("BTC");
  const [currentPrice, setCurrentPrice] = useState(null);
  const [balanceKey, setBalanceKey] = useState(0);

  const userId = user?.uid || null;

  const handleCoinChange = (coin) => setSelectedCoin(coin);
  const handlePriceUpdate = (price) => setCurrentPrice(price);

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12">
      {/* Top Banner / Hero Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Activity className="w-4 h-4" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Trading Terminal
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time simulated execution engine powered by live Binance order flow
          </p>
        </div>

        {/* User Balance & Fast Navigation Pill */}
        <div className="flex items-center space-x-3 self-start md:self-auto">
          <div className="glass-card px-4 py-2 rounded-2xl flex items-center space-x-3 border border-white/10 shadow-lg">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block leading-tight">
                Simulated Balance
              </span>
              <span className="text-base font-bold text-cyan-300 font-mono">
                <UserBalance refreshTrigger={balanceKey} />{" "}
                <span className="text-xs text-slate-400 font-normal">CCoins</span>
              </span>
            </div>
          </div>

          <Link
            to="/portfolio"
            className="hidden sm:flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-white/10 hover:border-cyan-500/30 transition-all group"
          >
            <span>Portfolio</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-cyan-400" />
          </Link>
        </div>
      </div>

      {/* Quick 1-Click Coin Switcher Bar */}
      <div className="mb-6 flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-mono uppercase text-slate-500 flex-shrink-0 flex items-center gap-1 mr-1">
          <Layers className="w-3.5 h-3.5" /> Watchlist:
        </span>
        {TOP_WATCHLIST.map((coin) => {
          const isSelected = selectedCoin === coin;
          return (
            <button
              key={coin}
              onClick={() => handleCoinChange(coin)}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                isSelected
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 scale-[1.02]"
                  : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/5 hover:border-white/20"
              }`}
            >
              <span>{coin}</span>
              <span
                className={`text-[10px] font-normal ${
                  isSelected ? "text-slate-900/80" : "text-slate-500"
                }`}
              >
                /USDT
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Terminal Layout: Left HUD/Trade & Right Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols on large screens): Price HUD & Order Execution */}
        <div className="lg:col-span-5 space-y-6">
          <CryptoPriceCard
            selectedCoin={selectedCoin}
            onCoinChange={handleCoinChange}
            onPriceUpdate={handlePriceUpdate}
          />

          <Suspense
            fallback={
              <div className="glass-card p-6 rounded-2xl animate-pulse space-y-4">
                <div className="h-5 bg-slate-800 rounded w-1/3" />
                <div className="h-12 bg-slate-800 rounded-xl" />
                <div className="h-12 bg-slate-800 rounded-xl" />
                <div className="h-10 bg-slate-800 rounded-xl" />
              </div>
            }
          >
            {userId && currentPrice ? (
              <BuySellPannel
                userId={userId}
                selectedCoin={selectedCoin}
                currentPrice={currentPrice}
                onTradeSuccess={() => setBalanceKey((k) => k + 1)}
              />
            ) : (
              <div className="glass-card p-6 rounded-2xl text-center space-y-3">
                <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400 font-mono">
                  Loading trade execution pipeline...
                </p>
              </div>
            )}
          </Suspense>
        </div>

        {/* Right Column (7 cols on large screens): Pro Chart Terminal */}
        <div className="lg:col-span-7">
          <Suspense
            fallback={
              <div className="glass-card p-6 rounded-2xl h-[480px] animate-pulse flex flex-col justify-between">
                <div className="h-6 bg-slate-800 rounded w-1/4" />
                <div className="h-64 bg-slate-800/40 rounded-xl" />
                <div className="h-4 bg-slate-800 rounded w-1/2" />
              </div>
            }
          >
            <CryptoChart coinSymbol={selectedCoin + "USDT"} />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
