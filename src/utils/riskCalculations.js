/**
 * Portfolio Risk Calculation Engine for CoinPulseX
 * 
 * Computes:
 * 1. Asset Concentration (Herfindahl-Hirschman Index - HHI)
 * 2. Historical Annualized Volatility (30-day daily returns standard deviation)
 * 3. Historical Maximum Drawdown (30-day peak-to-trough decline)
 * 4. Composite 0-100 Real-Time Risk Score & Actionable Insights
 */

/**
 * Calculates standard deviation of an array of numbers
 */
export const calculateStdDev = (arr) => {
  if (!arr || arr.length <= 1) return 0;
  const mean = arr.reduce((acc, val) => acc + val, 0) / arr.length;
  const variance = arr.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (arr.length - 1);
  return Math.sqrt(variance);
};

/**
 * Calculates 30-day annualized volatility from daily closing prices
 * Volatility = StdDev(Daily Returns) * sqrt(365)
 */
export const calculateAssetVolatility = (prices) => {
  if (!prices || prices.length < 5) return 0.55; // Baseline fallback (55% typical crypto vol)
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    const prev = prices[i - 1];
    const curr = prices[i];
    if (prev > 0) {
      returns.push((curr - prev) / prev);
    }
  }
  const dailyStdDev = calculateStdDev(returns);
  return dailyStdDev * Math.sqrt(365); // Annualized for 365-day crypto market
};

/**
 * Calculates historical Maximum Drawdown (MDD) from daily closing prices
 * MDD = max((Peak - Price) / Peak)
 */
export const calculateAssetMaxDrawdown = (prices) => {
  if (!prices || prices.length < 2) return 0.2; // Fallback baseline (20%)
  let peak = prices[0];
  let maxDrawdown = 0;

  for (const price of prices) {
    if (price > peak) {
      peak = price;
    }
    if (peak > 0) {
      const drawdown = (peak - price) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
  }
  return maxDrawdown;
};

/**
 * Evaluates the full portfolio and generates composite risk metrics and actionable insights
 * 
 * @param {Object} params
 * @param {Object} params.holdings - Map of coin symbol to amount (e.g. { btc: 0.5, eth: 2 })
 * @param {number} params.cashBalance - User cash / CCoins balance
 * @param {Object} params.currentPrices - Map of coin symbol to price object (e.g. { btc: { price: 95000 } })
 * @param {Object} params.historicalKlines - Map of coin symbol to array of 30-day daily closing prices
 * @returns {Object} Comprehensive risk metrics object
 */
export const computePortfolioRisk = ({
  holdings = {},
  cashBalance = 0,
  currentPrices = {},
  historicalKlines = {}
}) => {
  const assetBreakdown = [];
  let totalCryptoValue = 0;

  // 1. Calculate market value for each asset
  Object.entries(holdings).forEach(([coin, amount]) => {
    const parsedAmount = parseFloat(amount) || 0;
    if (parsedAmount <= 0) return;

    const coinKey = coin.toLowerCase();
    const price = currentPrices[coinKey]?.price || currentPrices[coin]?.price || 0;
    const value = parsedAmount * price;

    totalCryptoValue += value;
    assetBreakdown.push({
      symbol: coin.toUpperCase(),
      coinKey,
      amount: parsedAmount,
      price,
      value
    });
  });

  const parsedCash = parseFloat(cashBalance) || 0;
  const totalPortfolioValue = totalCryptoValue + parsedCash;

  // Handle unfunded / empty portfolio
  if (totalPortfolioValue <= 0 || assetBreakdown.length === 0) {
    return {
      score: parsedCash > 0 ? 5 : 0,
      tier: parsedCash > 0 ? "Ultra Safe (100% Cash)" : "Unfunded",
      color: "text-emerald-400",
      borderColor: "border-emerald-500/30",
      bgGradient: "from-emerald-950/30 to-gray-900",
      gaugeColor: "#10b981",
      totalPortfolioValue,
      totalCryptoValue,
      cashBalance: parsedCash,
      cashWeight: totalPortfolioValue > 0 ? 1 : 0,
      concentrationScore: 0,
      volatilityScore: 0,
      drawdownScore: 0,
      hhi: 0,
      portfolioVolatility: "0.0%",
      portfolioDrawdown: "0.0%",
      dominantAsset: null,
      assetBreakdown: [],
      insights: parsedCash > 0 
        ? ["Your portfolio is 100% in CCoins cash. Add crypto positions to start trading."]
        : ["No active positions or balance detected. Deposit or trade to assess real-time risk."]
    };
  }

  // 2. Asset Concentration Risk (HHI)
  let hhi = 0;
  let dominantAsset = null;
  let dominantWeight = 0;

  assetBreakdown.forEach((asset) => {
    const weight = asset.value / totalPortfolioValue;
    asset.weight = weight;
    hhi += Math.pow(weight, 2);

    if (weight > dominantWeight) {
      dominantWeight = weight;
      dominantAsset = {
        symbol: asset.symbol,
        weight: (weight * 100).toFixed(1) + "%",
        value: asset.value
      };
    }
  });

  const cashWeight = parsedCash / totalPortfolioValue;
  // Concentration score (0-100)
  // Higher HHI means higher concentration; cash buffer naturally dampens concentration risk
  const concentrationScore = Math.min(100, Math.max(0, Math.round(hhi * 100)));

  // 3. Volatility Risk Calculation
  let portfolioVolatility = 0;
  assetBreakdown.forEach((asset) => {
    const klines = historicalKlines[asset.coinKey] || historicalKlines[asset.symbol.toLowerCase()] || [];
    const vol = calculateAssetVolatility(klines);
    asset.volatility = vol;
    // Cash has 0 volatility
    portfolioVolatility += asset.weight * vol;
  });

  // Benchmark: 120% annualized volatility corresponds to score of 100
  const volatilityScore = Math.min(100, Math.max(0, Math.round((portfolioVolatility / 1.20) * 100)));

  // 4. Maximum Drawdown Risk Calculation
  let portfolioDrawdown = 0;
  assetBreakdown.forEach((asset) => {
    const klines = historicalKlines[asset.coinKey] || historicalKlines[asset.symbol.toLowerCase()] || [];
    const mdd = calculateAssetMaxDrawdown(klines);
    asset.maxDrawdown = mdd;
    portfolioDrawdown += asset.weight * mdd;
  });

  // Benchmark: 60% historical drawdown corresponds to score of 100
  const drawdownScore = Math.min(100, Math.max(0, Math.round((portfolioDrawdown / 0.60) * 100)));

  // 5. Composite Risk Score (0-100)
  // Weights: Concentration (35%), Volatility (40%), Drawdown (25%)
  const rawScore = (concentrationScore * 0.35) + (volatilityScore * 0.40) + (drawdownScore * 0.25);
  const score = Math.min(100, Math.max(1, Math.round(rawScore)));

  // 6. Tiering & Aesthetics
  let tier = "Low Risk";
  let color = "text-emerald-400";
  let borderColor = "border-emerald-500/30";
  let bgGradient = "from-emerald-950/30 to-gray-900";
  let gaugeColor = "#34d399"; // emerald-400

  if (score > 80) {
    tier = "Extreme Risk";
    color = "text-rose-500";
    borderColor = "border-rose-500/40";
    bgGradient = "from-rose-950/40 to-gray-900";
    gaugeColor = "#f43f5e"; // rose-500
  } else if (score > 60) {
    tier = "High Risk";
    color = "text-amber-500";
    borderColor = "border-amber-500/40";
    bgGradient = "from-amber-950/35 to-gray-900";
    gaugeColor = "#f59e0b"; // amber-500
  } else if (score > 30) {
    tier = "Moderate Risk";
    color = "text-yellow-400";
    borderColor = "border-yellow-500/30";
    bgGradient = "from-yellow-950/25 to-gray-900";
    gaugeColor = "#facc15"; // yellow-400
  }

  // 7. Dynamic Actionable Insights
  const insights = [];
  if (dominantWeight >= 0.65) {
    insights.push(`Overconcentrated: ${(dominantWeight * 100).toFixed(0)}% of your portfolio is in ${dominantAsset?.symbol}. Spreading capital reduces downside shocks.`);
  } else if (dominantWeight >= 0.45) {
    insights.push(`Noticeable tilt: ${dominantAsset?.symbol} holds ${(dominantWeight * 100).toFixed(0)}% of assets. Monitor this token's volatility closely.`);
  }

  if (portfolioVolatility > 0.85) {
    insights.push(`Hyper-volatile: Current asset mix carries ${(portfolioVolatility * 100).toFixed(1)}% annualized volatility. Expect sharp value swings.`);
  } else if (portfolioVolatility > 0.55) {
    insights.push(`Moderate market exposure: Portfolio swings remain in typical crypto ranges (~${(portfolioVolatility * 100).toFixed(0)}% annualized).`);
  }

  if (portfolioDrawdown > 0.40) {
    insights.push(`Elevated drawdown history: Key holdings previously dipped ${(portfolioDrawdown * 100).toFixed(0)}% from local highs.`);
  }

  if (cashWeight > 0.35) {
    insights.push(`Strong liquidity cushion: ${(cashWeight * 100).toFixed(0)}% held in cash dampens market pullbacks.`);
  }

  if (insights.length === 0) {
    insights.push("Well-diversified asset allocation with healthy volatility and stable drawdown parameters.");
  }

  return {
    score,
    tier,
    color,
    borderColor,
    bgGradient,
    gaugeColor,
    totalPortfolioValue,
    totalCryptoValue,
    cashBalance: parsedCash,
    cashWeight: (cashWeight * 100).toFixed(1) + "%",
    concentrationScore,
    volatilityScore,
    drawdownScore,
    hhi: hhi.toFixed(3),
    portfolioVolatility: (portfolioVolatility * 100).toFixed(1) + "%",
    portfolioDrawdown: (portfolioDrawdown * 100).toFixed(1) + "%",
    dominantAsset,
    assetBreakdown: assetBreakdown.sort((a, b) => b.value - a.value),
    insights
  };
};
