import React, { useState, useEffect } from "react";
import { executeTrade, getUserPortfolio } from "../config/tradeService";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  Wallet,
} from "lucide-react";

const BuySellPannel = ({ userId, selectedCoin = "BTC", currentPrice, onTradeSuccess }) => {
  const [amount, setAmount] = useState("");
  const [action, setAction] = useState("buy");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [userPortfolio, setUserPortfolio] = useState(null);

  const cleanPrice = parseFloat(
    typeof currentPrice === "string" ? currentPrice.replace(/,/g, "") : currentPrice
  );

  const loadUserBalance = async () => {
    if (!userId) return;
    try {
      const data = await getUserPortfolio(userId);
      setUserPortfolio(data);
    } catch (err) {
      console.warn("Could not fetch user holdings for trade panel:", err);
    }
  };

  useEffect(() => {
    loadUserBalance();
  }, [userId, action, selectedCoin]);

  // Listen to balance updates
  useEffect(() => {
    const handleUpdate = () => loadUserBalance();
    window.addEventListener("coinpulsex_balance_updated", handleUpdate);
    return () => window.removeEventListener("coinpulsex_balance_updated", handleUpdate);
  }, [userId]);

  const formatNumber = (num, decimals = 2) => {
    const parsed = parseFloat(num);
    if (isNaN(parsed)) return "0.00";
    return parsed < 1
      ? parsed.toFixed(Math.max(decimals, 4))
      : parsed.toLocaleString("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
  };

  const cashBalance = userPortfolio?.balance ?? 0;
  const coinHoldings = userPortfolio?.holdings?.[selectedCoin.toUpperCase()] ?? 0;

  const numericAmount = parseFloat(amount) || 0;
  const totalValue = cleanPrice && numericAmount > 0 ? cleanPrice * numericAmount : 0;

  // Percentage preset handler
  const handlePreset = (percent) => {
    setError("");
    if (!cleanPrice || cleanPrice <= 0) return;

    if (action === "buy") {
      const budget = (cashBalance * percent) / 100;
      const coinQty = budget / cleanPrice;
      setAmount(coinQty > 0 ? (coinQty < 1 ? coinQty.toFixed(5) : coinQty.toFixed(4)) : "0");
    } else {
      const coinQty = (coinHoldings * percent) / 100;
      setAmount(coinQty > 0 ? (coinQty < 1 ? coinQty.toFixed(5) : coinQty.toFixed(4)) : "0");
    }
  };

  const handleTrade = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    const coinId = selectedCoin.toUpperCase();

    try {
      if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
        throw new Error("Please enter a valid amount");
      }

      if (!userId) {
        throw new Error("User authentication required");
      }

      if (action === "buy" && totalValue > cashBalance) {
        throw new Error(
          `Insufficient CCoins balance ($${formatNumber(cashBalance)} available)`
        );
      }

      if (action === "sell" && numericAmount > coinHoldings) {
        throw new Error(
          `Insufficient ${coinId} holdings (${formatNumber(coinHoldings, 4)} available)`
        );
      }

      const result = await executeTrade(userId, coinId, amount, cleanPrice, action);

      setAmount("");
      setSuccess(result.message || `Successfully executed ${action.toUpperCase()} order!`);
      await loadUserBalance();

      if (onTradeSuccess) {
        onTradeSuccess();
      }
    } catch (err) {
      console.error("Trade error:", err);
      setError(err.message || "Failed to execute order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 shadow-2xl relative overflow-hidden transition-all duration-300">
      {/* Top Tabs: Buy / Sell */}
      <div className="flex p-1 bg-slate-950/80 rounded-xl border border-white/[0.08] mb-5">
        <button
          onClick={() => {
            setAction("buy");
            setError("");
            setSuccess("");
          }}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            action === "buy"
              ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>BUY {selectedCoin}</span>
        </button>

        <button
          onClick={() => {
            setAction("sell");
            setError("");
            setSuccess("");
          }}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            action === "sell"
              ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>SELL {selectedCoin}</span>
        </button>
      </div>

      {/* Available Balance Helper */}
      <div className="flex items-center justify-between text-xs mb-3 text-slate-400">
        <span className="flex items-center space-x-1">
          <Wallet className="w-3.5 h-3.5 text-cyan-400" />
          <span>Available:</span>
        </span>
        <span className="font-mono font-semibold text-slate-200">
          {action === "buy" ? (
            <span>${formatNumber(cashBalance)} CCoins</span>
          ) : (
            <span>
              {formatNumber(coinHoldings, 4)} {selectedCoin}
            </span>
          )}
        </span>
      </div>

      {/* Order Amount Input */}
      <div className="relative mb-3">
        <label className="text-[11px] uppercase font-mono tracking-wider text-slate-400 block mb-1.5">
          Order Amount
        </label>
        <div className="relative flex items-center">
          <input
            type="number"
            step="any"
            placeholder="0.00"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError("");
              setSuccess("");
            }}
            className="w-full bg-slate-950/80 text-white font-mono text-base sm:text-lg pl-4 pr-16 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all placeholder:text-slate-600"
          />
          <div className="absolute right-3.5 px-2 py-1 rounded bg-slate-900 border border-white/10 text-xs font-bold font-mono text-cyan-400">
            {selectedCoin}
          </div>
        </div>
      </div>

      {/* Percentage Presets (25%, 50%, 75%, MAX) */}
      <div className="grid grid-cols-4 gap-1.5 mb-4">
        {[25, 50, 75, 100].map((pct) => (
          <button
            key={pct}
            onClick={() => handlePreset(pct)}
            className="py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-white/5 hover:border-cyan-500/30 text-slate-300 hover:text-cyan-300 font-mono text-xs font-semibold transition-all cursor-pointer"
          >
            {pct === 100 ? "MAX" : `${pct}%`}
          </button>
        ))}
      </div>

      {/* Order Execution Estimation Card */}
      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-white/[0.05] space-y-2 mb-4 text-xs font-mono">
        <div className="flex items-center justify-between text-slate-400">
          <span>Execution Price</span>
          <span className="text-white">${cleanPrice ? formatNumber(cleanPrice) : "--"}</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>Simulated Fee (0%)</span>
          <span className="text-emerald-400 font-semibold">$0.00</span>
        </div>
        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between font-bold">
          <span className="text-slate-300">Total Value</span>
          <span className="text-base text-cyan-300">${formatNumber(totalValue)}</span>
        </div>
      </div>

      {/* Trade Action Submit Button */}
      <button
        onClick={handleTrade}
        disabled={loading || !amount || numericAmount <= 0}
        className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg ${
          action === "buy"
            ? "bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-emerald-500/20"
            : "bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white shadow-rose-500/20"
        }`}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Simulating Order...</span>
          </>
        ) : (
          <>
            <Zap className="w-4 h-4 fill-current" />
            <span>
              {action === "buy" ? "CONFIRM BUY" : "CONFIRM SELL"} {selectedCoin}
            </span>
          </>
        )}
      </button>

      {/* Dynamic Alerts */}
      {error && (
        <div className="mt-3 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start space-x-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {success && (
        <div className="mt-3 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-start space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
          <span className="leading-relaxed">{success}</span>
        </div>
      )}
    </div>
  );
};

export default BuySellPannel;
