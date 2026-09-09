import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserBalance from "../components/UserBalance";
import { saveLocalPortfolioData, getLocalPortfolioData } from "../config/tradeService";
import {
  User,
  Wallet,
  Activity,
  PieChart,
  History,
  Shield,
  Sparkles,
  ArrowRight,
  LogOut,
  RefreshCw,
  CheckCircle2,
  Lock,
  Zap,
} from "lucide-react";

const ProfilePage = () => {
  const {
    user,
    loading,
    authError,
    isDevMode,
    isLocalEnv,
    signInWithGoogle,
    signInWithGoogleRedirect,
    signInAsDevUser,
    logout,
    clearAuthError,
  } = useAuth();

  const [refillNotice, setRefillNotice] = useState("");
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    const res = await signInWithGoogle();
    if (res?.success) {
      navigate("/dashboard");
    }
  };

  const handleDevSignIn = () => {
    signInAsDevUser({
      displayName: "Het (Dev Trader)",
      email: "trader@coinpulsex.local",
      balance: 10000,
    });
    navigate("/dashboard");
  };

  const handleResetFunds = () => {
    if (!user) return;
    const current = getLocalPortfolioData(user.uid);
    const resetData = {
      balance: 10000,
      holdings: {
        BTC: 0.15,
        ETH: 1.5,
        SOL: 10,
      },
    };
    saveLocalPortfolioData(user.uid, resetData);
    setRefillNotice("Reset portfolio to $10,000 CCoins + default sample positions!");
    setTimeout(() => setRefillNotice(""), 4000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="glass-card p-8 rounded-2xl flex items-center space-x-4 border border-white/10 shadow-2xl">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-mono text-slate-300">Synchronizing trader session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto pb-16">
      {/* Auth Notice Banner */}
      {authError && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-start justify-between gap-3 animate-in fade-in">
          <div>
            <span className="font-bold block mb-1">Authentication Notice:</span>
            <p className="text-slate-300">{authError}</p>
          </div>
          <button
            onClick={clearAuthError}
            className="text-slate-400 hover:text-white text-xs underline font-mono cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {!user ? (
        /* Unauthenticated Gateway Hero & Sign-In Card */
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Crypto Simulation Platform</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Institutional Simulator & <br />
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">
                Portfolio Risk Engine
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
              Simulate high-frequency crypto trading with live Binance order flows, calculate multi-factor portfolio risk scores, and sharpen execution with zero financial downside.
            </p>
          </div>

          {/* 3 Feature Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-4 rounded-2xl border border-white/[0.06] text-center space-y-1">
              <Activity className="w-5 h-5 text-cyan-400 mx-auto" />
              <h3 className="font-bold text-white text-xs">Live Binance Feed</h3>
              <p className="text-[11px] text-slate-400">Sub-second spot price ticks across 14+ major pairs.</p>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-white/[0.06] text-center space-y-1">
              <Shield className="w-5 h-5 text-emerald-400 mx-auto" />
              <h3 className="font-bold text-white text-xs">Risk Audit Engine</h3>
              <p className="text-[11px] text-slate-400">Continuous HHI concentration, volatility & drawdown audit.</p>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-white/[0.06] text-center space-y-1">
              <Zap className="w-5 h-5 text-amber-400 mx-auto" />
              <h3 className="font-bold text-white text-xs">Zero Capital Risk</h3>
              <p className="text-[11px] text-slate-400">Trade freely with 10,000 simulated CCoins credits.</p>
            </div>
          </div>

          {/* Sign In Card */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 max-w-md mx-auto border border-white/10 shadow-2xl space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-white">Access Trading Terminal</h2>
              <p className="text-xs text-slate-400">
                Log in to synchronize your virtual wallet, holdings, and order ledger.
              </p>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 px-4 rounded-xl transition duration-200 shadow-md hover:shadow-cyan-500/20 cursor-pointer text-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.14 0 9.89 0 12s.45 3.86 1.24 5.42l4.04-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Sign In with Google</span>
            </button>

            <button
              onClick={signInWithGoogleRedirect}
              className="w-full text-xs text-slate-400 hover:text-cyan-400 text-center py-1 transition cursor-pointer"
            >
              Having popup issues? Try Redirect Mode →
            </button>

            {/* Quick 1-Click Test Sign-In */}
            <div className="pt-4 border-t border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-cyan-400 flex items-center gap-1.5 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  Instant Test Sandbox
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-white/10">
                  1-Click Dev Mode
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Skip Firebase configuration and immediately start test trading with a simulated $10,000 balance.
              </p>
              <button
                onClick={handleDevSignIn}
                className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl transition duration-200 cursor-pointer text-xs sm:text-sm shadow-lg shadow-cyan-500/20"
              >
                Launch Instant Test Session
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Authenticated Trader Dashboard Profile */
        <div className="space-y-6">
          {/* Trader Profile Header Card */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Trader Avatar"
                    className="w-16 h-16 rounded-2xl border-2 border-cyan-400/60 shadow-xl object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-cyan-950 border-2 border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-2xl">
                    {user.displayName?.[0] || "T"}
                  </div>
                )}
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      {user.displayName || "Simulated Trader"}
                    </h2>
                    {isDevMode && (
                      <span className="text-[10px] font-mono uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                        Dev Trader
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">{user.email}</p>
                  <p className="text-[11px] font-mono text-slate-500 mt-1">ID: {user.uid}</p>
                </div>
              </div>

              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition cursor-pointer self-start sm:self-auto"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>

            {/* Balance & Quick Actions */}
            <div className="mt-8 pt-6 border-t border-white/[0.08] grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase font-mono tracking-wider text-slate-400 block">
                    Simulated Liquid Balance
                  </span>
                  <span className="text-2xl font-black text-cyan-300 num-font mt-0.5 block">
                    <UserBalance />{" "}
                    <span className="text-xs text-slate-400 font-normal">CCoins</span>
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>

              {/* Reset/Refill Funds Button */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase font-mono tracking-wider text-slate-400 block">
                    Simulated Wallet Reset
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Reset demo capital to $10,000 + default holdings
                  </p>
                </div>
                <button
                  onClick={handleResetFunds}
                  className="px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Funds</span>
                </button>
              </div>
            </div>

            {refillNotice && (
              <div className="mt-3 p-3 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 text-xs flex items-center space-x-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>{refillNotice}</span>
              </div>
            )}
          </div>

          {/* Quick Terminal Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/dashboard"
              className="glass-card glass-card-hover p-5 rounded-2xl border border-white/[0.08] flex items-center justify-between group"
            >
              <div className="space-y-1">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-sm">Trading Terminal</h3>
                <p className="text-xs text-slate-400">Live charts & instant execution</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              to="/portfolio"
              className="glass-card glass-card-hover p-5 rounded-2xl border border-white/[0.08] flex items-center justify-between group"
            >
              <div className="space-y-1">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit">
                  <PieChart className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-sm">Portfolio & Risk</h3>
                <p className="text-xs text-slate-400">Asset holdings & stress scores</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              to="/history"
              className="glass-card glass-card-hover p-5 rounded-2xl border border-white/[0.08] flex items-center justify-between group"
            >
              <div className="space-y-1">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 w-fit">
                  <History className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-sm">Trade History</h3>
                <p className="text-xs text-slate-400">Audit trail of order fills</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
