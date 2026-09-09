import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserPortfolio } from "../config/tradeService";
import { getBinancePrice, getBinanceHistoricalKlines } from "../config/binance";
import { computePortfolioRisk } from "../utils/riskCalculations";
import RiskScoreCard from "../components/PortfolioRisk/RiskScoreCard";
import RiskBreakdownModal from "../components/PortfolioRisk/RiskBreakdownModal";
import {
  PieChart,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
  Shield,
  Layers,
  ArrowRight,
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

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let intervalId;

    const fetchData = async () => {
      try {
        const data = await getUserPortfolio(user.uid);
        setPortfolio(data);

        const holdings = data.holdings || {};
        const symbols = Object.keys(holdings);

        const prices = {};
        const klinesMap = {};

        // Fetch prices and 30-day historical klines concurrently
        await Promise.all(
          symbols.map(async (coin) => {
            try {
              const [priceInfo, klines] = await Promise.all([
                getBinancePrice(`${coin.toUpperCase()}USDT`),
                getBinanceHistoricalKlines(`${coin.toUpperCase()}USDT`, 30),
              ]);
              if (priceInfo) prices[coin] = priceInfo;
              if (klines && klines.length > 0) klinesMap[coin] = klines;
            } catch (err) {
              console.warn(`Failed to fetch data for ${coin}:`, err);
            }
          })
        );

        setValueData((prev) => {
          setPreviousData(prev);
          return prices;
        });
        setHistoricalKlines(klinesMap);
      } catch (error) {
        console.error("Error loading portfolio:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    intervalId = setInterval(fetchData, 10000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user]);

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
        <div className="glass-card p-8 rounded-2xl flex items-center space-x-4 border border-white/10 shadow-2xl">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-mono text-slate-300">Auditing user portfolio & risk metrics...</p>
        </div>
      </div>
    );
  }

  const cashBalance = portfolio?.balance || 0;
  const holdingsTotal = Object.entries(portfolio?.holdings || {}).reduce(
    (acc, [coin, amount]) => {
      const coinData = valueData[coin];
      return acc + (coinData?.price || 0) * amount;
    },
    0
  );

  const totalPortfolioValue = cashBalance + holdingsTotal;
  const cashRatio = totalPortfolioValue > 0 ? (cashBalance / totalPortfolioValue) * 100 : 100;
  const cryptoRatio = totalPortfolioValue > 0 ? (holdingsTotal / totalPortfolioValue) * 100 : 0;

  const holdingsList = Object.entries(portfolio?.holdings || {}).filter(
    ([_, amount]) => amount > 0
  );

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16">
      {/* Top Executive Wealth Banner */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 mb-8 relative overflow-hidden border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono uppercase tracking-wider mb-2">
              <PieChart className="w-4 h-4" />
              <span>Institutional Wealth Overview</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white num-font">
              ${formatNumber(totalPortfolioValue)}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Combined simulated liquid cash & active cryptocurrency positions
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <span>Trade Assets</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Liquid Cash vs Crypto Holdings Breakdown Bar */}
        <div className="mt-8 pt-6 border-t border-white/[0.08] grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/[0.05] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] uppercase font-mono tracking-wider text-slate-400 block">
                  Simulated Cash (CCoins)
                </span>
                <span className="text-lg font-bold text-white num-font">
                  ${formatNumber(cashBalance)}
                </span>
              </div>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {cashRatio.toFixed(1)}%
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/[0.05] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] uppercase font-mono tracking-wider text-slate-400 block">
                  Active Crypto Holdings
                </span>
                <span className="text-lg font-bold text-white num-font">
                  ${formatNumber(holdingsTotal)}
                </span>
              </div>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {cryptoRatio.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Dual Ratio Progress Bar */}
        <div className="mt-4">
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
            <div
              className="bg-emerald-400 h-full transition-all duration-500"
              style={{ width: `${cashRatio}%` }}
              title={`Cash: ${cashRatio.toFixed(1)}%`}
            />
            <div
              className="bg-cyan-400 h-full transition-all duration-500"
              style={{ width: `${cryptoRatio}%` }}
              title={`Crypto: ${cryptoRatio.toFixed(1)}%`}
            />
          </div>
        </div>
      </div>

      {/* Real-time Quantitative Portfolio Risk Engine */}
      <RiskScoreCard
        riskData={riskData}
        onOpenDetails={() => setIsRiskModalOpen(true)}
      />

      {/* Asset Holdings Section */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
            Asset Holdings
          </h2>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-white/5">
          {holdingsList.length} {holdingsList.length === 1 ? "Asset" : "Assets"} Active
        </span>
      </div>

      {holdingsList.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center space-y-4 border border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
            <Coins className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">No Crypto Positions Open</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            Your portfolio is 100% liquid cash. Jump to the trading terminal to simulate your first position.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition"
          >
            <span>Launch Trading Terminal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {holdingsList.map(([coin, amount]) => {
            const coinData = valueData[coin];
            const prevPrice = previousData[coin]?.price || 0;
            const currentPrice = coinData?.price || 0;
            const total = currentPrice * amount;
            const allocation = totalPortfolioValue > 0 ? (total / totalPortfolioValue) * 100 : 0;

            const priceDiff = currentPrice - prevPrice;
            const isUp = priceDiff >= 0;

            return (
              <div
                key={coin}
                className="glass-card glass-card-hover rounded-2xl p-5 flex flex-col justify-between space-y-4 border border-white/[0.08]"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center font-bold text-xs text-cyan-300 font-mono">
                        {coin}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base tracking-tight">
                          {coin}
                        </h3>
                        <span className="text-[11px] font-mono text-slate-400">
                          {allocation.toFixed(1)}% of portfolio
                        </span>
                      </div>
                    </div>

                    <div
                      className={`flex items-center space-x-0.5 px-2 py-1 rounded-lg text-xs font-mono font-bold ${
                        isUp
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {isUp ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      )}
                      <span>${formatNumber(currentPrice)}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-white/[0.04] space-y-2 text-xs font-mono mt-3">
                    <div className="flex justify-between text-slate-400">
                      <span>Holding Amount</span>
                      <span className="text-white font-semibold">{formatNumber(amount, 4)} {coin}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Valuation</span>
                      <span className="text-cyan-300 font-bold">${formatNumber(total)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500">
                    Live Binance Spot
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

      {/* Deep-dive Quantitative Risk Audit Modal */}
      <RiskBreakdownModal
        isOpen={isRiskModalOpen}
        onClose={() => setIsRiskModalOpen(false)}
        riskData={riskData}
      />
    </div>
  );
};

export default PortfolioPage;
