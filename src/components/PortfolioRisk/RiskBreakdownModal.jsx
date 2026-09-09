import React from "react";
import {
  X,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Flame,
  PieChart,
  Activity,
  TrendingDown,
  Info,
  CheckCircle2,
  HelpCircle
} from "lucide-react";

export const RiskBreakdownModal = ({ isOpen, onClose, riskData }) => {
  if (!isOpen || !riskData) return null;

  const {
    score = 0,
    tier = "Low Risk",
    color = "text-emerald-400",
    totalPortfolioValue = 0,
    cashBalance = 0,
    cashWeight = "0.0%",
    concentrationScore = 0,
    volatilityScore = 0,
    drawdownScore = 0,
    hhi = "0.000",
    portfolioVolatility = "0.0%",
    portfolioDrawdown = "0.0%",
    assetBreakdown = [],
    insights = []
  } = riskData;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  const getTierIcon = () => {
    if (score > 80) return <Flame className="w-5 h-5 text-rose-500" />;
    if (score > 60) return <ShieldAlert className="w-5 h-5 text-amber-500" />;
    if (score > 30) return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              {getTierIcon()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Portfolio Risk Audit</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border border-current font-semibold ${color}`}>
                  Score: {score}/100 • {tier}
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Detailed quantitative attribution of asset concentration, volatility, and drawdowns.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-gray-950/70 border border-gray-800 p-3.5 rounded-xl">
              <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold mb-1">
                <PieChart className="w-4 h-4" />
                <span>Concentration Risk</span>
              </div>
              <p className="text-2xl font-bold text-white">{concentrationScore} <span className="text-xs text-gray-500">/100</span></p>
              <p className="text-[11px] text-gray-400 mt-1">
                HHI: <span className="text-cyan-300 font-mono">{hhi}</span> (Ideal: &lt; 0.25)
              </p>
            </div>

            <div className="bg-gray-950/70 border border-gray-800 p-3.5 rounded-xl">
              <div className="flex items-center space-x-2 text-purple-400 text-xs font-semibold mb-1">
                <Activity className="w-4 h-4" />
                <span>Annualized Volatility</span>
              </div>
              <p className="text-2xl font-bold text-white">{volatilityScore} <span className="text-xs text-gray-500">/100</span></p>
              <p className="text-[11px] text-gray-400 mt-1">
                Portfolio $\sigma$: <span className="text-purple-300 font-mono">{portfolioVolatility}</span>
              </p>
            </div>

            <div className="bg-gray-950/70 border border-gray-800 p-3.5 rounded-xl">
              <div className="flex items-center space-x-2 text-rose-400 text-xs font-semibold mb-1">
                <TrendingDown className="w-4 h-4" />
                <span>Historical Max Drawdown</span>
              </div>
              <p className="text-2xl font-bold text-white">{drawdownScore} <span className="text-xs text-gray-500">/100</span></p>
              <p className="text-[11px] text-gray-400 mt-1">
                Weighted MDD: <span className="text-rose-300 font-mono">{portfolioDrawdown}</span>
              </p>
            </div>
          </div>

          {/* Holdings Risk Attribution Table */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-3 flex items-center justify-between">
              <span>Asset Attribution Breakdown</span>
              <span className="text-xs font-normal text-gray-500">
                Total Value: {formatCurrency(totalPortfolioValue)}
              </span>
            </h4>

            <div className="overflow-x-auto rounded-xl border border-gray-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-950/90 text-gray-400 border-b border-gray-800 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Asset</th>
                    <th className="py-3 px-4">Portfolio Weight</th>
                    <th className="py-3 px-4">Holdings Value</th>
                    <th className="py-3 px-4">30d Volatility</th>
                    <th className="py-3 px-4">30d Max Drawdown</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 bg-gray-900/40">
                  {/* Cash Row */}
                  {cashBalance > 0 && (
                    <tr className="hover:bg-gray-800/30 transition">
                      <td className="py-3 px-4 font-semibold text-white flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>CCoins (Cash)</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-cyan-300">{cashWeight}</td>
                      <td className="py-3 px-4 text-gray-300">{formatCurrency(cashBalance)}</td>
                      <td className="py-3 px-4 text-emerald-400 font-mono">0.0% (Risk-free)</td>
                      <td className="py-3 px-4 text-emerald-400 font-mono">0.0%</td>
                    </tr>
                  )}

                  {/* Asset Rows */}
                  {assetBreakdown.map((asset) => {
                    const weightPct = ((asset.weight || 0) * 100).toFixed(1) + "%";
                    const volPct = ((asset.volatility || 0) * 100).toFixed(1) + "%";
                    const mddPct = ((asset.maxDrawdown || 0) * 100).toFixed(1) + "%";

                    return (
                      <tr key={asset.symbol} className="hover:bg-gray-800/30 transition">
                        <td className="py-3 px-4 font-semibold text-white flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-cyan-400" />
                          <span>{asset.symbol}</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-cyan-300">{weightPct}</td>
                        <td className="py-3 px-4 text-gray-300">{formatCurrency(asset.value)}</td>
                        <td className="py-3 px-4 font-mono text-purple-300">{volPct}</td>
                        <td className="py-3 px-4 font-mono text-rose-300">{mddPct}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="bg-gray-950/60 border border-gray-800/80 rounded-xl p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2.5 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Automated Risk Mitigation Recommendations</span>
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
              {insights.map((insight, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-cyan-400 mt-0.5">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Educational Formula Guide */}
          <div className="bg-gray-950/30 border border-gray-800/50 rounded-xl p-4 text-[11px] text-gray-400 space-y-2">
            <div className="flex items-center space-x-1.5 text-gray-300 font-semibold text-xs">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>How We Calculate Your Risk</span>
            </div>
            <p>
              • <strong className="text-gray-300">Concentration (35% weight):</strong> Uses the Herfindahl-Hirschman Index (HHI). Holding 90%+ in 1 crypto coin generates extreme concentration penalties.
            </p>
            <p>
              • <strong className="text-gray-300">Volatility (40% weight):</strong> Computes daily returns over 30 days annualized by $\sqrt{365}$. Assets with annual swings &gt; 100% trigger high volatility alerts.
            </p>
            <p>
              • <strong className="text-gray-300">Drawdown (25% weight):</strong> Tracks historical peak-to-trough declines over the last 30 days to measure liquidation vulnerability.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-gray-800 bg-gray-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-semibold text-xs transition cursor-pointer shadow-md"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiskBreakdownModal;
