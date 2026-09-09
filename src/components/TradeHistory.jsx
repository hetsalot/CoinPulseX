import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { getUserTrades } from "../config/tradeService";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  SlidersHorizontal,
  History,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const TradeHistory = ({ userId }) => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all' | 'buy' | 'sell'
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchTrades = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const tradesData = await getUserTrades(userId);
        setTrades(tradesData);
        setError("");
      } catch (err) {
        console.error("Error fetching trade history:", err);
        setError("Failed to load trade history");
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, [userId]);

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
    if (!dateObj) return "N/A";
    const date = new Date(dateObj);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  const buyCount = trades.filter((t) => t.type?.toLowerCase() === "buy").length;
  const sellCount = trades.filter((t) => t.type?.toLowerCase() === "sell").length;

  return (
    <div className="space-y-6">
      {/* Top Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-white/[0.08] flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400 block">
              Total Recorded Trades
            </span>
            <span className="text-2xl font-black text-white num-font mt-0.5 block">
              {trades.length}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
            <History className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/[0.08] flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400 block">
              Buy Orders
            </span>
            <span className="text-2xl font-black text-emerald-400 num-font mt-0.5 block">
              {buyCount}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/[0.08] flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400 block">
              Sell Orders
            </span>
            <span className="text-2xl font-black text-rose-400 num-font mt-0.5 block">
              {sellCount}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 rounded-2xl border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Type Tabs */}
        <div className="flex p-1 bg-slate-950/80 rounded-xl border border-white/[0.06] w-full sm:w-auto">
          {[
            { id: "all", label: "All Activity" },
            { id: "buy", label: "Buys" },
            { id: "sell", label: "Sells" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
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
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search coin (e.g. BTC)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/70 text-slate-200 text-xs pl-9 pr-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 font-mono placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Trade Records Ledger */}
      <div className="glass-card rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono text-slate-400">Loading audit ledger...</p>
          </div>
        ) : error ? (
          <div className="text-rose-400 text-center py-8 text-sm">{error}</div>
        ) : filteredTrades.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No Matching Transactions</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {trades.length === 0
                ? "You have not executed any simulated trades yet. Open your first position in the trading terminal."
                : "No orders match your filter criteria."}
            </p>
            {trades.length === 0 && (
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
                <tr className="border-b border-white/[0.08] bg-slate-950/70 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4 font-semibold">Side</th>
                  <th className="py-3.5 px-4 font-semibold">Asset</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Order Size</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Fill Price</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Total (CCoins)</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-xs font-mono">
                {filteredTrades.map((trade) => {
                  const isBuy = trade.type?.toLowerCase() === "buy";
                  return (
                    <tr
                      key={trade.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Side Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase border ${
                            isBuy
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/30"
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
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-white text-sm">
                          {trade.coin}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          /USDT Spot
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap text-slate-200 font-semibold">
                        {formatNumber(trade.amount, 4)} {trade.coin}
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap text-slate-400">
                        ${formatNumber(trade.price)}
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-bold text-cyan-300">
                        ${formatNumber(trade.totalValue)}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap text-slate-400 text-[11px]">
                        {formatDate(trade.timestamp)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeHistory;
