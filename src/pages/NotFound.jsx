import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, Activity } from "lucide-react";

const NotFound = () => (
  <div className="flex items-center justify-center min-h-screen px-4" style={{ paddingTop: "var(--nav-height)" }}>
    <div className="glass-card-elevated p-10 sm:p-14 rounded-2xl text-center space-y-6 max-w-lg shadow-2xl relative overflow-hidden animate-scale-in">
      {/* Decorative ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-rose-500/[0.06] rounded-full blur-3xl pointer-events-none -mt-32" />

      <div className="relative z-10 space-y-6">
        {/* Animated icon */}
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto animate-float">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-5xl sm:text-6xl font-black text-white font-mono tracking-tight">
            404
          </h1>
          <h2 className="text-lg font-bold text-slate-200">Terminal Route Not Found</h2>
          <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
            The requested simulated endpoint or page does not exist on this network.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm transition shadow-lg shadow-cyan-500/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Safety</span>
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center space-x-2 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold px-5 py-2.5 rounded-xl text-sm border border-white/[0.08] hover:border-cyan-500/25 transition"
          >
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Trading Terminal</span>
          </Link>
        </div>
      </div>
    </div>
  </div>
);

export default NotFound;
