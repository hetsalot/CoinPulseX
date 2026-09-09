import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft } from "lucide-react";

const NotFound = () => (
  <div className="flex items-center justify-center min-h-screen px-4">
    <div className="glass-card p-8 sm:p-12 rounded-2xl text-center space-y-4 max-w-md border border-white/10 shadow-2xl">
      <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h1 className="text-3xl sm:text-4xl font-black text-white font-mono">404</h1>
      <h2 className="text-lg font-bold text-slate-200">Terminal Route Not Found</h2>
      <p className="text-xs text-slate-400">
        The requested simulated endpoint or page does not exist on this network.
      </p>
      <Link
        to="/"
        className="inline-flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Safety</span>
      </Link>
    </div>
  </div>
);

export default NotFound;
