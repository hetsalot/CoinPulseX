import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserBalance from "./UserBalance";
import {
  Activity,
  LayoutDashboard,
  History as HistoryIcon,
  PieChart,
  Info,
  User,
  Wallet,
  Menu,
  X,
  Sparkles,
  LogOut,
} from "lucide-react";

const Navbar = () => {
  const { user, isDevMode, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    ...(user
      ? [
          { name: "Terminal", path: "/dashboard", icon: LayoutDashboard },
          { name: "Portfolio", path: "/portfolio", icon: PieChart },
          { name: "History", path: "/history", icon: HistoryIcon },
        ]
      : []),
    { name: "About", path: "/about", icon: Info },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-[#080a10]/85 border-b border-white/[0.08] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <Link
              to={user ? "/dashboard" : "/"}
              className="flex items-center space-x-2.5 group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-cyan-400 to-blue-500 p-[1.5px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-400/40 transition-all duration-300">
                <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
                  <Activity className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                  CoinPulse<span className="text-cyan-400">X</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest text-cyan-400/70 font-mono -mt-1 hidden sm:block">
                  Simulated Terminal
                </span>
              </div>
            </Link>

            {isDevMode && (
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] uppercase font-mono tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                Dev Mode
              </span>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10"
                      : "text-slate-300 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-cyan-400" : "text-slate-400"}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Section: Balance Chip & User Pill */}
          <div className="hidden sm:flex items-center space-x-3">
            {user && (
              <Link
                to="/portfolio"
                className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-white/10 hover:border-cyan-500/30 text-xs font-mono transition-all group shadow-inner"
                title="View Portfolio"
              >
                <div className="p-1 rounded-md bg-cyan-500/10 text-cyan-400 group-hover:scale-105 transition-transform">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-slate-400 tracking-wider uppercase leading-none">
                    Balance
                  </span>
                  <span className="text-white font-bold group-hover:text-cyan-300 transition-colors">
                    <UserBalance />
                  </span>
                </div>
              </Link>
            )}

            <Link
              to="/profile"
              className={`flex items-center space-x-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border transition-all duration-200 ${
                isActive("/profile") || isActive("/")
                  ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300"
                  : "bg-slate-900/80 border-white/10 text-slate-200 hover:border-white/20 hover:bg-slate-800"
              }`}
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Avatar"
                  className="w-7 h-7 rounded-lg border border-cyan-400/50 object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
              <span className="text-xs font-semibold max-w-[100px] truncate hidden md:block">
                {user ? user.displayName?.split(" ")[0] || "Trader" : "Sign In"}
              </span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <Link
              to="/profile"
              className="p-1.5 rounded-lg bg-slate-900 border border-white/10 text-slate-300"
            >
              <User className="w-4 h-4 text-cyan-400" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900/90 border border-white/10 text-slate-300 hover:text-white focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#090d16]/95 backdrop-blur-2xl px-4 pt-3 pb-5 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {user && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-white/10 mb-3">
              <div className="flex items-center space-x-2 text-xs">
                <Wallet className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-400">Simulated Cash:</span>
              </div>
              <span className="font-mono text-cyan-300 font-bold text-sm">
                <UserBalance />
              </span>
            </div>
          )}

          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-300 hover:bg-white/[0.05]"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-cyan-400" : "text-slate-400"}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}

          <Link
            to="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/[0.05] border border-transparent"
          >
            <span className="flex items-center space-x-3">
              <User className="w-4 h-4 text-cyan-400" />
              <span>{user ? "My Profile & Settings" : "Sign In / Register"}</span>
            </span>
            {isDevMode && (
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                Dev
              </span>
            )}
          </Link>

          {user && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition mt-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
