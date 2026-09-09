import React from "react";
import TradeHistory from "../components/TradeHistory";
import { useAuth } from "../context/AuthContext";
import { History as HistoryIcon, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const History = () => {
  const { user, loading } = useAuth();
  const userId = user?.uid;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="glass-card p-8 rounded-2xl flex items-center space-x-4 border border-white/10 shadow-2xl">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-mono text-slate-300">Auditing transaction records...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen pt-28 px-4 flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl text-center space-y-4 max-w-md border border-white/10">
          <p className="text-sm text-slate-300">
            Please authenticate to inspect your simulated transaction history.
          </p>
          <Link
            to="/profile"
            className="inline-block bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs"
          >
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono uppercase tracking-wider mb-1">
            <HistoryIcon className="w-4 h-4" />
            <span>Audit Trail & Activity Log</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Order Execution History
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete simulated order book fills, prices, and timestamped transactions
          </p>
        </div>

        <Link
          to="/dashboard"
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:border-cyan-500/30 transition self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
          <span>Back to Terminal</span>
        </Link>
      </div>

      <TradeHistory userId={userId} />
    </div>
  );
};

export default History;
