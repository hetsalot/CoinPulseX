import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProfilePage from "./pages/ProfilePage";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import About from "./pages/About";
import PortfolioPage from "./pages/PortfolioPage";
import PrivateRoutes from "./components/PrivateRoutes";
import NotFound from "./pages/NotFound";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <div className="min-h-screen bg-[#080a10] text-slate-100 relative selection:bg-cyan-500/30 selection:text-cyan-200">
          {/* Subtle ambient lighting gradients */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[140px]" />
            <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[140px]" />
            <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[160px]" />
          </div>

          <div className="relative z-10">
            <Routes>
              <Route path="/" element={<ProfilePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/about" element={<About />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoutes>
                    <Dashboard />
                  </PrivateRoutes>
                }
              />
              <Route
                path="/history"
                element={
                  <PrivateRoutes>
                    <History />
                  </PrivateRoutes>
                }
              />
              <Route
                path="/portfolio"
                element={
                  <PrivateRoutes>
                    <PortfolioPage />
                  </PrivateRoutes>
                }
              />
              <Route path="/*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
