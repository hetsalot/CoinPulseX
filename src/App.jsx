import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProfilePage from "./pages/ProfilePage";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import About from "./pages/About";
import PortfolioPage from "./pages/PortfolioPage";
import PrivateRoutes from "./components/PrivateRoutes"; // import here
import NotFound from "./pages/NotFound";

const App = () => {
  return (
    <Router>
      <Navbar />
      <div className="min-h-screen bg-black text-white">
        <Routes>
          <Route path="/" element={<ProfilePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/*" element={<NotFound />} />
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
        </Routes>
      </div>
    </Router>
  );
};

export default App;
