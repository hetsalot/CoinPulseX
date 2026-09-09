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
  Sparkles
} from "lucide-react";

export const RiskScoreCard = ({ riskData, onOpenDetails }) => {
  if (!riskData) return null;

  const {
    score = 0,
    tier = "Low Risk",
    color = "text-emerald-400",
    borderColor = "border-emerald-500/30",
    bgGradient = "from-emerald-950/30 to-gray-900",
    gaugeColor = "#34d399",
    concentrationScore = 0,
    volatilityScore = 0,
    drawdownScore = 0,
    portfolioVolatility = "0.0%",
    portfolioDrawdown = "0.0%",
    dominantAsset,
    cashWeight = "0.0%",
    insights = []
  } = riskData;

  const getTierIcon = () => {
    if (score > 80) return <Flame className="w-6 h-6 text-rose-500 animate-pulse" />;
    if (score > 60) return <ShieldAlert className="w-6 h-6 text-amber-500" />;
    if (score > 30) return <AlertTriangle className="w-6 h-6 text-yellow-400" />;
    return <ShieldCheck className="w-6 h-6 text-emerald-400" />;
  };

  // Circular gauge calculations (circumference = 2 * PI * r = 2 * 3.14159 * 42 ≈ 263.89)
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 md:p-6 mb-8 border ${borderColor} bg-gradient-to-br ${bgGradient} backdrop-blur-md shadow-2xl transition-all duration-300`}
    >
      {/* Subtle background glow effect */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-800/80 mb-5">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
              Portfolio Risk Engine
            </h2>
            <p className="text-xs text-gray-500 hidden sm:block">
              Real-time multi-factor assessment (Concentration • Volatility • Drawdown)
            </p>
          </div>
        </div>

        <button
          onClick={onOpenDetails}
          className="flex items-center space-x-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm"
        >
          <span>Audit Breakdown</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Grid: Gauge + Sub-metric Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Section: Radial Score Gauge & Tier */}
        <div className="lg:col-span-5 flex items-center space-x-5">
          <div className="relative flex-shrink-0 w-28 h-28 flex items-center justify-center">
            {/* SVG Circular Progress */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="text-gray-800/80"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={gaugeColor}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Score Center Text */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className={`text-3xl font-black tracking-tight ${color}`}>
                {score}
              </span>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                / 100
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              {getTierIcon()}
              <h3 className={`text-xl font-bold tracking-tight ${color}`}>
                {tier}
              </h3>
            </div>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Composite stress index calculated from live price volatility and capital concentration.
            </p>
            <div className="flex items-center space-x-2 mt-2 text-[11px] text-gray-400">
              <span className="px-2 py-0.5 rounded bg-gray-900/90 border border-gray-800 text-gray-300">
                Cash: {cashWeight}
              </span>
              {dominantAsset && (
                <span className="px-2 py-0.5 rounded bg-gray-900/90 border border-gray-800 text-gray-300 truncate">
                  Max: {dominantAsset.symbol} ({dominantAsset.weight})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Section: 3 Pillar Metric Cards */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Concentration Card */}
          <div className="bg-gray-900/90 border border-gray-800/90 hover:border-cyan-500/30 p-3.5 rounded-xl transition-all shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-cyan-400 mb-1">
              <span className="flex items-center space-x-1">
                <PieChart className="w-3.5 h-3.5" />
                <span>Concentration</span>
              </span>
              <span className="text-gray-400 text-[10px]">HHI</span>
            </div>
            <div className="my-1">
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-black text-white">{concentrationScore}</span>
                <span className="text-xs text-gray-500">/100</span>
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${concentrationScore}%` }}
                />
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-2 truncate">
              {dominantAsset ? `${dominantAsset.symbol}: ${dominantAsset.weight}` : "Evenly weighted"}
            </p>
          </div>

          {/* Volatility Card */}
          <div className="bg-gray-900/90 border border-gray-800/90 hover:border-purple-500/30 p-3.5 rounded-xl transition-all shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-purple-400 mb-1">
              <span className="flex items-center space-x-1">
                <Activity className="w-3.5 h-3.5" />
                <span>30d Volatility</span>
              </span>
              <span className="text-gray-400 text-[10px]">Annualized</span>
            </div>
            <div className="my-1">
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-black text-white">{volatilityScore}</span>
                <span className="text-xs text-gray-500">/100</span>
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                <div
                  className="bg-purple-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${volatilityScore}%` }}
                />
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-2 truncate">
              {portfolioVolatility} price swing index
            </p>
          </div>

          {/* Drawdown Card */}
          <div className="bg-gray-900/90 border border-gray-800/90 hover:border-rose-500/30 p-3.5 rounded-xl transition-all shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-rose-400 mb-1">
              <span className="flex items-center space-x-1">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Max Drawdown</span>
              </span>
              <span className="text-gray-400 text-[10px]">30d Peak</span>
            </div>
            <div className="my-1">
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-black text-white">{drawdownScore}</span>
                <span className="text-xs text-gray-500">/100</span>
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                <div
                  className="bg-rose-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${drawdownScore}%` }}
                />
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-2 truncate">
              {portfolioDrawdown} worst drop
            </p>
          </div>
        </div>
      </div>

      {/* Real-time Dynamic Insight Bar */}
      {insights && insights.length > 0 && (
        <div className="mt-5 pt-3.5 border-t border-gray-800/70 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2.5 min-w-0">
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-gray-300 truncate">
              <strong className="text-cyan-300 font-semibold mr-1">AI Risk Advisory:</strong>
              {insights[0]}
            </span>
          </div>
          <button
            onClick={onOpenDetails}
            className="text-cyan-400 hover:text-cyan-300 underline font-medium text-xs flex-shrink-0 cursor-pointer"
          >
            Details
          </button>
        </div>
      )}
    </div>
  );
};

export default RiskScoreCard;
