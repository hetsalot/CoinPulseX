import React from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Flame,
  TrendingDown,
  PieChart,
  Activity,
  ChevronRight,
  Info,
} from "lucide-react";

export const RiskScoreCard = ({ riskData, onOpenDetails }) => {
  if (!riskData) return null;

  const {
    score,
    tier,
    color,
    borderColor,
    bgGradient,
    gaugeColor,
    concentrationScore,
    volatilityScore,
    drawdownScore,
    portfolioVolatility,
    portfolioDrawdown,
    dominantAsset,
    cashWeight,
    insights,
  } = riskData;

  const getTierIcon = () => {
    if (score > 80) return <Flame className="w-5 h-5 text-rose-400 animate-pulse" />;
    if (score > 55) return <ShieldAlert className="w-5 h-5 text-amber-400" />;
    if (score > 30) return <AlertTriangle className="w-5 h-5 text-cyan-400" />;
    return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
  };

  // SVG Gauge Calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div
      className={`glass-card rounded-2xl p-6 sm:p-7 border ${borderColor} bg-gradient-to-br ${bgGradient} transition-all duration-300 shadow-2xl relative overflow-hidden`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Activity className="w-4 h-4" />
          </span>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
            Portfolio Risk Assessment
          </span>
        </div>

        {onOpenDetails && (
          <button
            onClick={onOpenDetails}
            className="flex items-center space-x-1.5 text-xs font-mono font-semibold text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
          >
            <span>View Breakdown</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Grid: Gauge + Sub-metric Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Section: Radial Score Gauge & Tier */}
        <div className="lg:col-span-5 flex items-center space-x-5">
          <div className="relative flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
            {/* SVG Circular Progress */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="text-slate-800/80"
                strokeWidth="7"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={gaugeColor}
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Score Center Text */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className={`text-2xl sm:text-3xl font-black tracking-tight num-font ${color}`}>
                {score}
              </span>
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                / 100
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              {getTierIcon()}
              <h3 className={`text-lg sm:text-xl font-bold tracking-tight ${color}`}>
                {tier}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Calculated from your current holdings concentration, 30d asset volatility, and drawdown history.
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2.5 text-[11px] font-mono">
              <span className="px-2.5 py-0.5 rounded-lg bg-slate-950/70 border border-white/[0.06] text-slate-300">
                Cash Cushion: {cashWeight}
              </span>
              {dominantAsset && (
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-950/70 border border-white/[0.06] text-slate-300 truncate">
                  Max: {dominantAsset.symbol} ({dominantAsset.weight})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Section: 3 Pillar Metric Cards */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Concentration Card */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/[0.06] hover:border-cyan-500/30 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-cyan-400 mb-1">
              <span className="flex items-center space-x-1">
                <PieChart className="w-3.5 h-3.5" />
                <span>Concentration</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">HHI</span>
            </div>
            <div className="my-1">
              <div className="flex items-baseline space-x-1">
                <span className="text-xl font-black text-white num-font">{concentrationScore}</span>
                <span className="text-[11px] text-slate-500 font-mono">/100</span>
              </div>
              <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${concentrationScore}%` }}
                />
              </div>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-2 truncate">
              {dominantAsset ? `${dominantAsset.symbol}: ${dominantAsset.weight}` : "Evenly weighted"}
            </p>
          </div>

          {/* Volatility Card */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/[0.06] hover:border-purple-500/30 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-purple-400 mb-1">
              <span className="flex items-center space-x-1">
                <Activity className="w-3.5 h-3.5" />
                <span>Volatility</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">30d Ann.</span>
            </div>
            <div className="my-1">
              <div className="flex items-baseline space-x-1">
                <span className="text-xl font-black text-white num-font">{volatilityScore}</span>
                <span className="text-[11px] text-slate-500 font-mono">/100</span>
              </div>
              <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-purple-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${volatilityScore}%` }}
                />
              </div>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-2 truncate">
              {portfolioVolatility} price swings
            </p>
          </div>

          {/* Drawdown Card */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/[0.06] hover:border-rose-500/30 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-rose-400 mb-1">
              <span className="flex items-center space-x-1">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Max Drawdown</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">30d Peak</span>
            </div>
            <div className="my-1">
              <div className="flex items-baseline space-x-1">
                <span className="text-xl font-black text-white num-font">{drawdownScore}</span>
                <span className="text-[11px] text-slate-500 font-mono">/100</span>
              </div>
              <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-rose-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${drawdownScore}%` }}
                />
              </div>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-2 truncate">
              {portfolioDrawdown} worst dip
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Actionable Insight Bar */}
      {insights && insights.length > 0 && (
        <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2.5 min-w-0">
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
            <span className="text-slate-300 truncate font-mono">
              <strong className="text-cyan-300 font-semibold mr-1">Risk Insight:</strong>
              {insights[0]}
            </span>
          </div>
          {onOpenDetails && (
            <button
              onClick={onOpenDetails}
              className="text-cyan-400 hover:text-cyan-300 font-mono text-xs flex-shrink-0 cursor-pointer underline"
            >
              Details
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RiskScoreCard;
