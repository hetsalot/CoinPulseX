import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { getUserTrades } from "../config/tradeService";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  History,
  ArrowRight,
  Activity,
} from "lucide-react";

const TradeHistory = ({ userId, limit, compact = false, refreshTrigger, hideMetrics = false }) => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all' | 'buy' | 'sell'
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTrades = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const tradesData = await getUserTrades(userId);
      setTrades(Array.isArray(tradesData) ? tradesData : []);
      setError("");
    } catch (err) {
      console.error("Error fetching trade history:", err);
      setError("Failed to load trade history");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades, refreshTrigger]);

  // Listen to real-time trade event updates across the app
  useEffect(() => {
    const handleTradesUpdate = () => {
      fetchTrades();
    };

    window.addEventListener("coinpulsex_trades_updated", handleTradesUpdate);
    return () => {
      window.removeEventListener("coinpulsex_trades_updated", handleTradesUpdate);
    };
  }, [fetchTrades]);

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

  const formatDate = (dateObj) => {
    if (!dateObj) return "Just now";
    try {
      let date;
      if (typeof dateObj?.toDate === "function") {
        date = dateObj.toDate();
      } else if (dateObj?.seconds !== undefined) {
        date = new Date(dateObj.seconds * 1000);
      } else if (dateObj instanceof Date) {
        date = dateObj;
      } else {
        date = new Date(dateObj);
      }
      if (isNaN(date.getTime())) return "Recent";
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Recent";
    }
  };

  // Filtered trades
  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      const matchesType =
        filterType === "all" ? true : trade.type?.toLowerCase() === filterType;
      const matchesSearch = searchQuery
        ? trade.coin?.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesType && matchesSearch;
    });
  }, [trades, filterType, searchQuery]);

  const displayedTrades = useMemo(() => {
    if (limit && typeof limit === "number" && limit > 0) {
      return filteredTrades.slice(0, limit);
    }
    return filteredTrades;
  }, [filteredTrades, limit]);

  const buyCount = trades.filter((t) => t.type?.toLowerCase() === "buy").length;
  const sellCount = trades.filter((t) => t.type?.toLowerCase() === "sell").length;

  return (
    <div className="space-y-5">
      {/* Top Metrics Banner - Shown if not explicitly hidden and not compact */}
      {!hideMetrics && !compact && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in-up">
          <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase font-mono tracking-wider text-slate-400 block">
                Total Recorded Trades
              </span>
              <span className="text-2xl font-black text-white num-font mt-1 block">
                {trades.length}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
              <History className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase font-mono tracking-wider text-slate-400 block">
                Buy Orders
              </span>
              <span className="text-2xl font-black text-emerald-400 num-font mt-1 block">
                {buyCount}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase font-mono tracking-wider text-slate-400 block">
                Sell Orders
              </span>
              <span className="text-2xl font-black text-rose-400 num-font mt-1 block">
                {sellCount}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className={`glass-card ${compact ? "p-3.5" : "p-4 sm:p-5"} rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in-up delay-1`}>
        {/* Type Tabs */}
        <div className="flex p-1 bg-slate-950/70 rounded-xl border border-white/[0.06] w-full sm:w-auto">
          {[
            { id: "all", label: `All (${trades.length})` },
            { id: "buy", label: `Buys (${buyCount})` },
            { id: "sell", label: `Sells (${sellCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
                filterType === tab.id
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search coin (e.g. BTC)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/60 text-slate-200 text-xs pl-9 pr-4 py-2 rounded-xl border border-white/[0.08] focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 font-mono placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Trade Records Ledger */}
      <div className="glass-card-elevated rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up delay-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="w-7 h-7 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono text-slate-400">Auditing transaction records...</p>
          </div>
        ) : error ? (
          <div className="text-rose-400 text-center py-10 text-sm">{error}</div>
        ) : displayedTrades.length === 0 ? (
          <div className={`${compact ? "p-8" : "p-14"} text-center space-y-4`}>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No Matching Transactions</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
              {trades.length === 0
                ? "You have not executed any simulated trades yet. Execute your first order to begin your audit trail."
                : "No orders match your filter criteria."}
            </p>
            {trades.length === 0 && !compact && (
              <Link
                to="/dashboard"
                className="inline-flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition"
              >
                <span>Go to Trading Terminal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] bg-slate-950/70 text-[11px] font-mono uppercase tracking-wider text-slate-400 sticky top-0 z-10">
                  <th className="py-3.5 px-4 sm:px-5 font-semibold">Side</th>
                  <th className="py-3.5 px-4 sm:px-5 font-semibold">Asset</th>
                  <th className="py-3.5 px-4 sm:px-5 font-semibold text-right">Order Size</th>
                  <th className="py-3.5 px-4 sm:px-5 font-semibold text-right">Fill Price</th>
                  <th className="py-3.5 px-4 sm:px-5 font-semibold text-right">Total (CCoins)</th>
                  <th className="py-3.5 px-4 sm:px-5 font-semibold text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-xs font-mono">
                {displayedTrades.map((trade) => {
                  const isBuy = trade.type?.toLowerCase() === "buy";
                  const totalVal =
                    trade.totalValue !== undefined && trade.totalValue !== null
                      ? trade.totalValue
                      : parseFloat(trade.amount || 0) * parseFloat(trade.price || 0);

                  return (
                    <tr
                      key={trade.id}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Side Badge */}
                      <td className="py-3.5 px-4 sm:px-5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${
                            isBuy
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/25"
                          }`}
                        >
                          {isBuy ? (
                            <ArrowDownLeft className="w-3 h-3" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3" />
                          )}
                          <span>{isBuy ? "BUY" : "SELL"}</span>
                        </span>
                      </td>

                      {/* Coin */}
                      <td className="py-3.5 px-4 sm:px-5 whitespace-nowrap">
                        <span className="font-bold text-white text-sm">
                          {trade.coin}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          /USDT Spot
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 sm:px-5 text-right whitespace-nowrap text-slate-200 font-semibold">
                        {formatNumber(trade.amount, 4)} {trade.coin}
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 sm:px-5 text-right whitespace-nowrap text-slate-400">
                        ${formatNumber(trade.price)}
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 sm:px-5 text-right whitespace-nowrap font-bold text-cyan-300">
                        ${formatNumber(totalVal)}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 sm:px-5 text-right whitespace-nowrap text-slate-400 text-[11px]">
                        {formatDate(trade.timestamp)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info for compact/limit mode */}
        {limit && filteredTrades.length > limit && (
          <div className="p-3.5 bg-slate-950/60 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">
              Showing latest {displayedTrades.length} of {filteredTrades.length} recorded orders
            </span>
            <Link
              to="/history"
              className="inline-flex items-center space-x-1.5 text-cyan-400 hover:text-cyan-300 font-semibold transition"
            >
              <span>View Full Trail Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeHistory;
