import React from "react";
import {
  Activity,
  Shield,
  Zap,
  Code2,
  Database,
  Cpu,
  Github,
  Linkedin,
  Mail,
  ExternalLink,
  Sparkles,
} from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen pt-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto pb-16">
      {/* Hero Header */}
      <div className="text-center space-y-3 mb-12">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>About CoinPulseX</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
          Simulated Trading, Real Precision.
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
          CoinPulseX is an institutional-grade cryptocurrency trading simulator and quantitative risk management platform built to bridge market theory and hands-on execution.
        </p>
      </div>

      {/* Core Architectural Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass-card p-6 rounded-2xl border border-white/[0.08] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">Binance Market Pipeline</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Consumes raw 24hr ticker data and historical kline candlesticks directly from public Binance endpoints for millisecond-grade price accuracy.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/[0.08] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">Multi-Factor Risk Engine</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Continuously evaluates portfolio concentration via Herfindahl-Hirschman Index (HHI), 30-day volatility vectors, and max drawdown stress testing.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/[0.08] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">Zero-Friction Paper Trading</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Execute orders instantly with simulated CCoins credits without fear of real-world capital loss. Ideal for stress-testing trading strategies.
          </p>
        </div>
      </div>

      {/* Tech Stack Matrix */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/[0.08] mb-12 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>Technology & Infrastructure</span>
        </h2>
        <div className="flex flex-wrap gap-2 pt-2">
          {[
            "React 19",
            "Tailwind CSS v4",
            "Vite",
            "Chart.js & React-Chartjs-2",
            "Binance REST API",
            "Firebase Firestore",
            "Google Auth",
            "Lucide Icons",
            "Local Storage Fallback",
          ].map((tech) => (
            <span
              key={tech}
              className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs font-mono text-slate-300"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Developer Profile Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 block mb-1">
              Lead Architect & Developer
            </span>
            <h2 className="text-2xl font-black text-white">Het Salot</h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mt-1 leading-relaxed">
              Software engineer passionate about fintech, web3 systems, and interactive financial data visualization.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://github.com/hetsalot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 hover:border-cyan-500/30 text-slate-200 hover:text-white text-xs font-mono transition"
            >
              <Github className="w-4 h-4 text-cyan-400" />
              <span>GitHub</span>
            </a>

            <a
              href="https://linkedin.com/in/het-salot-8a20a5330"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 hover:border-cyan-500/30 text-slate-200 hover:text-white text-xs font-mono transition"
            >
              <Linkedin className="w-4 h-4 text-blue-400" />
              <span>LinkedIn</span>
            </a>

            <a
              href="mailto:hetsalot1410@gmail.com"
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 hover:border-cyan-500/30 text-slate-200 hover:text-white text-xs font-mono transition"
            >
              <Mail className="w-4 h-4 text-amber-400" />
              <span>Email</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
