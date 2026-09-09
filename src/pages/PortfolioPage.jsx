import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import { getUserPortfolio } from "../config/tradeService";
import { getBinancePrice, getBinanceHistoricalKlines } from "../config/binance";
import { computePortfolioRisk } from "../utils/riskCalculations";
import RiskScoreCard from "../components/PortfolioRisk/RiskScoreCard";
import RiskBreakdownModal from "../components/PortfolioRisk/RiskBreakdownModal";
import {
  Wallet,
  Coins,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  PieChart,
} from "lucide-react";

const PortfolioPage = () => {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [valueData, setValueData] = useState({});
  const [previousData, setPreviousData] = useState({});
  const [historicalKlines, setHistoricalKlines] = useState({});
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const formatNumber = (num, decimals = 2) => {
    const parsedNum = parseFloat(num);
    if (isNaN(parsedNum)) return "0.00";
    return parsedNum < 1
      ? parsedNum.toFixed(4)
      : parsedNum.toLocaleString("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
  };

  // Sync portfolio from Firestore database
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    if (user.isLocalDev) {
      getUserPortfolio(user.uid).then((data) => {
        setPortfolio(data);
        setLoading(false);
      });
      const handleUpdate = () => {
        getUserPortfolio(user.uid).then((data) => setPortfolio(data));
      };
      window.addEventListener("coinpulsex_balance_updated", handleUpdate);
      return () => window.removeEventListener("coinpulsex_balance_updated", handleUpdate);
    }

    // Direct live snapshot from Firestore database
    const userDocRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPortfolio({
            balance: data.balance ?? 0,
            holdings: data.holdings || {},
          });
        } else {
          setPortfolio({ balance: 10000, holdings: {} });
        }
        setLoading(false);
      },
      (err) => {
        console.warn("Firestore portfolio fetch error:", err.message);
        getUserPortfolio(user.uid).then((data) => {
          setPortfolio(data);
          setLoading(false);
        });
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Fetch Binance prices and 30-day klines for all user holdings
  useEffect(() => {
    if (!portfolio?.holdings) return;

    const symbols = Object.keys(portfolio.holdings).filter(
      (coin) => (portfolio.holdings[coin] || 0) > 0
    );

    if (symbols.length === 0) {
      setValueData({});
      setHistoricalKlines({});
      return;
    }

    const fetchPricesAndKlines = async () => {
      const prices = {};
      const klinesMap = {};

      await Promise.all(
        symbols.map(async (coin) => {
          const pair = `${coin.toUpperCase()}USDT`;
          try {
            const [priceInfo, klines] = await Promise.all([
              getBinancePrice(pair),
              getBinanceHistoricalKlines(pair, 30),
            ]);
            if (priceInfo) prices[coin] = priceInfo;
            if (klines && klines.length > 0) klinesMap[coin] = klines;
          } catch (err) {
            console.warn(`Failed to fetch market data for ${coin}:`, err);
          }
        })
      );

      setValueData((prev) => {
        setPreviousData(prev);
        return prices;
      });
      setHistoricalKlines(klinesMap);
    };

    fetchPricesAndKlines();
    const interval = setInterval(fetchPricesAndKlines, 6000);
    return () => clearInterval(interval);
  }, [portfolio]);

  // Real-time dynamic risk calculation on user's real holdings
  const riskData = useMemo(() => {
    return computePortfolioRisk({
      holdings: portfolio?.holdings || {},
      cashBalance: portfolio?.balance || 0,
      currentPrices: valueData,
      historicalKlines,
    });
  }, [portfolio, valueData, historicalKlines]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="glass-card p-8 rounded-2xl flex items-center space-x-4 shadow-2xl">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-mono text-slate-300">Loading portfolio & risk assessment...</p>
        </div>
      </div>
    );
  }

  const cashBalance = portfolio?.balance ?? 0;
  const holdingsEntries = Object.entries(portfolio?.holdings || {}).filter(
    ([_, amount]) => (parseFloat(amount) || 0) > 0
  );

  const holdingsTotal = holdingsEntries.reduce((acc, [coin, amount]) => {
    const coinData = valueData[coin];
    return acc + (coinData?.price || 0) * (parseFloat(amount) || 0);
  }, 0);

  const totalPortfolioValue = cashBalance + holdingsTotal;

  return (
    <div className="page-container">
      {/* Top Portfolio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 section-gap-lg animate-fade-in-up">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono uppercase tracking-wider mb-1.5">
            <PieChart className="w-4 h-4" />
            <span>Asset Portfolio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
            My Portfolio
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Simulated CCoins balance, live market valuation, and real-time risk calculations
          </p>
        </div>

        <Link
          to="/dashboard"
          className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-cyan-500/20 self-start sm:self-auto"
        >
          <span>Trade Assets</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 section-gap animate-fade-in-up delay-1">
        {/* CCoins Balance */}
        <div className="glass-card p-6 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[11px] uppercase font-mono tracking-wider text-slate-400 block">
              CCoins Balance
            </span>
            <span className="text-2xl sm:text-3xl font-black text-white num-font mt-1 block">
              ${formatNumber(cashBalance)}
            </span>
            <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
              Database Balance
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        {/* Total Valuation */}
        <div className="glass-card p-6 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[11px] uppercase font-mono tracking-wider text-slate-400 block">
              Total Valuation
            </span>
            <span className="text-2xl sm:text-3xl font-black text-cyan-300 num-font mt-1 block">
              ${formatNumber(totalPortfolioValue)}
            </span>
            <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
              Cash + Live Crypto Value
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <PieChart className="w-6 h-6" />
          </div>
        </div>

        {/* Active Crypto Holdings */}
        <div className="glass-card p-6 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[11px] uppercase font-mono tracking-wider text-slate-400 block">
              Active Holdings Value
            </span>
            <span className="text-2xl sm:text-3xl font-black text-white num-font mt-1 block">
              ${formatNumber(holdingsTotal)}
            </span>
            <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
              {holdingsEntries.length} {holdingsEntries.length === 1 ? "Coin" : "Coins"} in wallet
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Coins className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Real-time Portfolio Risk Assessment Card */}
      <div className="section-gap animate-fade-in-up delay-2">
        <RiskScoreCard
          riskData={riskData}
          onOpenDetails={() => setIsRiskModalOpen(true)}
        />
      </div>

      {/* Holdings Section */}
      <div className="space-y-4 animate-fade-in-up delay-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Coins className="w-5 h-5 text-cyan-400" />
            <span>Crypto Holdings</span>
          </h2>
          <span className="text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-white/[0.06]">
            {holdingsEntries.length} {holdingsEntries.length === 1 ? "Asset" : "Assets"}
          </span>
        </div>

        {holdingsEntries.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center space-y-4 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
              <Coins className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">No Crypto Holdings Yet</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              You haven't bought any cryptocurrency yet. Head to the terminal to open your first position.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-lg shadow-cyan-500/20"
            >
              <span>Go to Trading Terminal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {holdingsEntries.map(([coin, amount]) => {
              const coinData = valueData[coin];
              const prevPrice = previousData[coin]?.price || 0;
              const currentPrice = coinData?.price || 0;
              const total = currentPrice * (parseFloat(amount) || 0);

              const priceDiff = currentPrice - prevPrice;
              const isUp = priceDiff >= 0;

              return (
                <div
                  key={coin}
                  className="glass-card glass-card-hover rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-xl"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center font-bold text-sm text-cyan-300 font-mono">
                          {coin}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-base tracking-tight">
                            {coin}
                          </h3>
                          <span className="text-[11px] font-mono text-slate-400">
                            /USDT Spot
                          </span>
                        </div>
                      </div>

                      <div
                        className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold ${
                          isUp
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {isUp ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5" />
                        )}
                        <span>${formatNumber(currentPrice)}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/50 border border-white/[0.04] space-y-2.5 text-xs font-mono mt-3">
                      <div className="flex justify-between text-slate-400">
                        <span>Holding:</span>
                        <span className="text-white font-semibold">
                          {formatNumber(amount, 4)} {coin}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Current Price:</span>
                        <span className="text-slate-200 font-semibold">
                          ${formatNumber(currentPrice)}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-white/[0.06] flex justify-between font-bold">
                        <span className="text-slate-300">Total Value:</span>
                        <span className="text-cyan-300 text-sm">
                          ${formatNumber(total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-500">
                      Live Binance Feed
                    </span>
                    <Link
                      to="/dashboard"
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                    >
                      <span>Trade</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Risk Breakdown Detail Modal */}
      <RiskBreakdownModal
        isOpen={isRiskModalOpen}
        onClose={() => setIsRiskModalOpen(false)}
        riskData={riskData}
      />
    </div>
  );
};

export default PortfolioPage;
