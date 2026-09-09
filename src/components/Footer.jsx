import React from "react";
import { Link } from "react-router-dom";
import { Activity, Github, ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <footer className="site-footer mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-500 p-[1.5px]">
              <div className="w-full h-full bg-[var(--bg-primary)] rounded-[7px] flex items-center justify-center">
                <Activity className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <span className="text-sm font-bold text-white">
                CoinPulse<span className="text-cyan-400">X</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono block -mt-0.5">
                Simulated Trading Platform
              </span>
            </div>
          </div>

          {/* Nav links */}
          <div className="flex items-center space-x-6 text-xs font-medium text-slate-400">
            <Link
              to="/about"
              className="hover:text-cyan-400 transition-colors"
            >
              About
            </Link>
            <Link
              to="/dashboard"
              className="hover:text-cyan-400 transition-colors"
            >
              Terminal
            </Link>
            <a
              href="https://github.com/hetsalot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 hover:text-cyan-400 transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          </div>

          {/* Copyright */}
          <p className="text-[11px] text-slate-500 font-mono">
            © {new Date().getFullYear()} CoinPulseX · Het Salot
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
