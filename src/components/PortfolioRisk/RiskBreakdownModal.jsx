import React from "react";
import {
  X,
  PieChart,
  Activity,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

export const RiskBreakdownModal = ({ isOpen, onClose, riskData }) => {
  if (!isOpen || !riskData) return null;

  const {
    score,
    tier,
    color,
    concentrationScore,
    volatilityScore,
    drawdownScore,
    hhi,
    portfolioVolatility,
    portfolioDrawdown,
    totalPortfolioValue,
    cashBalance,
    cashWeight,
    assetBreakdown = [],
    insights = [],
  } = riskData;

  const formatCurrency = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return "$0.00";
    return (
      "$" +
      (num < 1
        ? num.toFixed(4)
        : num.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="glass-card-elevated rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl border border-white/[0.1] bg-slate-950/95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Portfolio Risk Assessment
                </h3>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${color} bg-white/[0.05]`}>
                  {tier} ({score}/100)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time attribution of your actual crypto holdings and cash allocation.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06]">
              <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold mb-1">
                <PieChart className="w-4 h-4" />
                <span>Concentration Risk</span>
              </div>
              <p className="text-2xl font-bold text-white num-font">
                {concentrationScore} <span className="text-xs font-mono text-slate-500">/100</span>
              </p>
              <p className="text-[11px] font-mono text-slate-400 mt-1">
                HHI: <span className="text-cyan-300">{hhi}</span> (Target: &lt; 0.25)
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06]">
              <div className="flex items-center space-x-2 text-purple-400 text-xs font-semibold mb-1">
                <Activity className="w-4 h-4" />
                <span>Annualized Volatility</span>
              </div>
              <p className="text-2xl font-bold text-white num-font">
                {volatilityScore} <span className="text-xs font-mono text-slate-500">/100</span>
              </p>
              <p className="text-[11px] font-mono text-slate-400 mt-1">
                Portfolio Vol: <span className="text-purple-300">{portfolioVolatility}</span>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06]">
              <div className="flex items-center space-x-2 text-rose-400 text-xs font-semibold mb-1">
                <TrendingDown className="w-4 h-4" />
                <span>Historical Drawdown</span>
              </div>
              <p className="text-2xl font-bold text-white num-font">
                {drawdownScore} <span className="text-xs font-mono text-slate-500">/100</span>
              </p>
              <p className="text-[11px] font-mono text-slate-400 mt-1">
                Worst 30d Dip: <span className="text-rose-300">{portfolioDrawdown}</span>
              </p>
            </div>
          </div>

          {/* Holdings Risk Attribution Table */}
          <div>
            <h4 className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-300 mb-3 flex items-center justify-between">
              <span>Holdings Attribution Breakdown</span>
              <span className="text-[11px] font-normal text-slate-400">
                Total Valuation: {formatCurrency(totalPortfolioValue)}
              </span>
            </h4>

            <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-white/[0.06] text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Asset</th>
                    <th className="py-3 px-4">Weight</th>
                    <th className="py-3 px-4">Valuation</th>
                    <th className="py-3 px-4">30d Volatility</th>
                    <th className="py-3 px-4">30d Max Drawdown</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] bg-slate-900/30">
                  {/* Cash Row */}
                  {cashBalance > 0 && (
                    <tr className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-semibold text-white flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>CCoins (Cash)</span>
                      </td>
                      <td className="py-3 px-4 text-emerald-400 font-bold">{cashWeight}</td>
                      <td className="py-3 px-4 text-slate-200">{formatCurrency(cashBalance)}</td>
                      <td className="py-3 px-4 text-emerald-400">0.0% (Risk-free)</td>
                      <td className="py-3 px-4 text-emerald-400">0.0%</td>
                    </tr>
                  )}

                  {/* Asset Rows */}
                  {assetBreakdown.map((asset) => {
                    const weightPct = ((asset.weight || 0) * 100).toFixed(1) + "%";
                    const volPct = ((asset.volatility || 0) * 100).toFixed(1) + "%";
                    const mddPct = ((asset.maxDrawdown || 0) * 100).toFixed(1) + "%";

                    return (
                      <tr key={asset.symbol} className="hover:bg-slate-800/30 transition">
                        <td className="py-3 px-4 font-semibold text-white flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-cyan-400" />
                          <span>{asset.symbol}</span>
                        </td>
                        <td className="py-3 px-4 font-bold text-cyan-300">{weightPct}</td>
                        <td className="py-3 px-4 text-slate-200">{formatCurrency(asset.value)}</td>
                        <td className="py-3 px-4 text-purple-300">{volPct}</td>
                        <td className="py-3 px-4 text-rose-300">{mddPct}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-white/[0.06]">
            <h4 className="text-xs font-semibold uppercase font-mono tracking-wider text-cyan-400 mb-2.5 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Real-Time Risk Insights & Suggestions</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-300 font-mono">
              {insights.map((insight, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-cyan-400 mt-0.5">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Educational Formula Guide */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-white/[0.04] text-[11px] text-slate-400 space-y-1.5 font-mono">
            <div className="flex items-center space-x-1.5 text-slate-300 font-semibold text-xs mb-1">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Assessment Methodology</span>
            </div>
            <p>
              • <strong>Concentration (35%):</strong> Evaluates Herfindahl-Hirschman Index (HHI) across your assets.
            </p>
            <p>
              • <strong>Volatility (40%):</strong> Computes standard deviation of daily returns over 30 days annualized (x sqrt(365)) from live Binance klines.
            </p>
            <p>
              • <strong>Drawdown (25%):</strong> Measures peak-to-trough price declines over the past 30 days.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.08] bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiskBreakdownModal;
