import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoutes = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-card p-8 rounded-2xl flex items-center space-x-4 shadow-2xl">
          <div className="w-7 h-7 border-[2.5px] border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-mono text-slate-300">Verifying session...</p>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/" replace />;
};

export default PrivateRoutes;
