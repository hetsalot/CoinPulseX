import React from "react";
import {
  Activity,
  Shield,
  Zap,
  Cpu,
  Github,
  Linkedin,
  Mail,
  Sparkles,
  Code2,
  Globe,
} from "lucide-react";

const About = () => {
  return (
    <div className="page-container page-container--mid">
      {/* Hero Header */}
      <div className="text-center space-y-4 section-gap-lg animate-fade-in-up">
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>About CoinPulseX</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
          Simulated Trading,{" "}
          <span className="text-gradient-brand">Real Market Data.</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          CoinPulseX is a real-time cryptocurrency trading simulator and portfolio tracking platform built to practice trading with zero financial risk.
        </p>
      </div>

      {/* Core Architectural Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 section-gap-lg">
        <div className="glass-card glass-card-hover p-7 rounded-2xl space-y-4 animate-fade-in-up delay-1">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Binance Market Feed</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Streams real-time 24h market stats and interactive price charts directly from public Binance APIs.
          </p>
        </div>

        <div className="glass-card glass-card-hover p-7 rounded-2xl space-y-4 animate-fade-in-up delay-2">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Live Portfolio Tracking</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Monitor your simulated CCoins balance and live asset valuation calculated from real-time crypto prices.
          </p>
        </div>

        <div className="glass-card glass-card-hover p-7 rounded-2xl space-y-4 animate-fade-in-up delay-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Zero-Friction Paper Trading</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Execute orders instantly with simulated CCoins credits without fear of real-world capital loss. Ideal for stress-testing trading strategies.
          </p>
        </div>
      </div>

      {/* Tech Stack Matrix */}
      <div className="glass-card-elevated rounded-2xl p-7 sm:p-9 section-gap-lg space-y-5 animate-fade-in-up delay-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-white">Technology & Infrastructure</h2>
        </div>
        <div className="flex flex-wrap gap-2.5 pt-1">
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
              className="px-4 py-2 rounded-xl bg-slate-950/70 border border-white/[0.06] text-xs font-mono text-slate-300 hover:border-cyan-500/25 hover:text-cyan-300 transition-colors"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Developer Profile Card */}
      <div className="glass-card-elevated rounded-2xl p-7 sm:p-9 shadow-2xl relative overflow-hidden animate-fade-in-up delay-5">
        {/* Decorative gradient */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-brand rounded-t-2xl" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-2">
          <div className="flex items-center space-x-5">
            {/* Avatar placeholder */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-white/[0.08] flex items-center justify-center flex-shrink-0">
              <Code2 className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 block mb-1">
                Lead Architect & Developer
              </span>
              <h2 className="text-2xl font-black text-white">Het Salot</h2>
              <p className="text-sm text-slate-400 max-w-md mt-1.5 leading-relaxed">
                Software engineer passionate about fintech, web3 systems, and interactive financial data visualization.
              </p>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://github.com/hetsalot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/[0.08] hover:border-cyan-500/25 text-slate-200 hover:text-white text-xs font-mono transition"
            >
              <Github className="w-4 h-4 text-cyan-400" />
              <span>GitHub</span>
            </a>

            <a
              href="https://linkedin.com/in/het-salot-8a20a5330"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/[0.08] hover:border-blue-500/25 text-slate-200 hover:text-white text-xs font-mono transition"
            >
              <Linkedin className="w-4 h-4 text-blue-400" />
              <span>LinkedIn</span>
            </a>

            <a
              href="mailto:hetsalot1410@gmail.com"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/[0.08] hover:border-amber-500/25 text-slate-200 hover:text-white text-xs font-mono transition"
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
