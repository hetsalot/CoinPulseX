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
  History,
} from "lucide-react";

const BuySellPannel = React.lazy(() => import("../components/BuySellPannel"));
const CryptoChart = React.lazy(() => import("../components/CryptoChart"));
const TradeHistory = React.lazy(() => import("../components/TradeHistory"));

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
    <div className="page-container">
      {/* Top Banner / Hero Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 section-gap animate-fade-in-up">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Activity className="w-4 h-4" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Trading Terminal
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1.5 max-w-lg">
            Real-time simulated execution engine powered by live Binance order flow
          </p>
        </div>

        {/* User Balance & Fast Navigation Pill */}
        <div className="flex items-center space-x-3 self-start md:self-auto">
          <div className="glass-card px-4 py-2.5 rounded-2xl flex items-center space-x-3 border border-white/[0.08] shadow-lg">
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
            className="hidden sm:flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-white/[0.08] hover:border-cyan-500/30 transition-all group"
          >
            <span>Portfolio</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-cyan-400" />
          </Link>
        </div>
      </div>

      {/* Quick 1-Click Coin Switcher Bar */}
      <div className="section-gap animate-fade-in-up delay-1">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none scroll-mask-x px-1">
          <span className="text-xs font-mono uppercase text-slate-500 flex-shrink-0 flex items-center gap-1.5 mr-1">
            <Layers className="w-3.5 h-3.5" /> Watchlist:
          </span>
          {TOP_WATCHLIST.map((coin) => {
            const isSelected = selectedCoin === coin;
            return (
              <button
                key={coin}
                onClick={() => handleCoinChange(coin)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 scale-[1.03]"
                    : "bg-slate-900/70 hover:bg-slate-800 text-slate-300 border border-white/[0.06] hover:border-white/[0.15]"
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
      </div>

      {/* Main Terminal Layout: Left HUD/Trade & Right Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in-up delay-2">
        {/* Left Column (5 cols on large screens): Price HUD & Order Execution */}
        <div className="lg:col-span-5 space-y-6">
          <CryptoPriceCard
            selectedCoin={selectedCoin}
            onCoinChange={handleCoinChange}
            onPriceUpdate={handlePriceUpdate}
          />

          <Suspense
            fallback={
              <div className="glass-card p-8 rounded-2xl animate-pulse space-y-4">
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
              <div className="glass-card p-8 rounded-2xl text-center space-y-3">
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
              <div className="glass-card p-8 rounded-2xl h-[500px] animate-pulse flex flex-col justify-between">
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

      {/* Live Order Audit Trail / Recent Trades Section */}
      <div className="section-gap-lg mt-8 animate-fade-in-up delay-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <History className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Audit Trail & Order Ledger</span>
                <span className="text-[10px] uppercase font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full">
                  Live Log
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Timestamped execution history of your simulated orders
              </p>
            </div>
          </div>

          <Link
            to="/history"
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white border border-white/[0.08] hover:border-cyan-500/30 transition-all group"
          >
            <span>Full History</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="glass-card p-8 rounded-2xl animate-pulse space-y-4">
              <div className="h-6 bg-slate-800 rounded w-1/4" />
              <div className="h-40 bg-slate-800/40 rounded-xl" />
            </div>
          }
        >
          {userId ? (
            <TradeHistory
              userId={userId}
              refreshTrigger={balanceKey}
              limit={10}
              compact={true}
              hideMetrics={true}
            />
          ) : (
            <div className="glass-card p-8 rounded-2xl text-center space-y-3">
              <p className="text-xs text-slate-400 font-mono">
                Sign in to view your simulated order audit trail.
              </p>
            </div>
          )}
        </Suspense>
      </div>
    </div>
  );
};

export default Dashboard;
