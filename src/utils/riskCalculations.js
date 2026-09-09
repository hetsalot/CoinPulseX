/**
 * Portfolio Risk Calculation Engine
 * 
 * Performs dynamic multi-factor risk assessment on the user's real portfolio holdings:
 * 1. Concentration Risk: Herfindahl-Hirschman Index (HHI)
 * 2. Volatility Risk: 30-day annualized standard deviation of daily returns
 * 3. Max Drawdown Risk: Peak-to-trough historical drop
 * 4. Liquidity Buffer: Cash (CCoins) weighting
 */

/**
 * Calculates sample standard deviation
 */
const calculateStdDev = (values) => {
  if (!values || values.length < 2) return 0;
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    (values.length - 1);
  return Math.sqrt(variance);
};

/**
 * Calculates annualized volatility from daily closing prices
 * Vol = std_dev(daily_returns) * sqrt(365)
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
 * Evaluates the real portfolio and generates composite risk metrics and actionable insights
 * 
 * @param {Object} params
 * @param {Object} params.holdings - Map of coin symbol to amount (e.g. { BTC: 0.5, ETH: 2 })
 * @param {number} params.cashBalance - User cash / CCoins balance
 * @param {Object} params.currentPrices - Map of coin symbol to price object (e.g. { BTC: { price: 95000 } })
 * @param {Object} params.historicalKlines - Map of coin symbol to array of 30-day daily closing prices
 * @returns {Object} Comprehensive risk metrics object
 */
export const computePortfolioRisk = ({
  holdings = {},
  cashBalance = 0,
  currentPrices = {},
  historicalKlines = {},
}) => {
  const assetBreakdown = [];
  let totalCryptoValue = 0;

  // 1. Calculate market value for each asset in real holdings
  Object.entries(holdings).forEach(([coin, amount]) => {
    const parsedAmount = parseFloat(amount) || 0;
    if (parsedAmount <= 0) return;

    const coinKey = coin.toUpperCase();
    const price =
      currentPrices[coinKey]?.price ||
      currentPrices[coin.toLowerCase()]?.price ||
      0;
    const value = parsedAmount * price;

    totalCryptoValue += value;
    assetBreakdown.push({
      symbol: coinKey,
      coinKey,
      amount: parsedAmount,
      price,
      value,
    });
  });

  const parsedCash = parseFloat(cashBalance) || 0;
  const totalPortfolioValue = totalCryptoValue + parsedCash;

  // Handle unfunded or pure cash portfolio
  if (totalPortfolioValue <= 0 || assetBreakdown.length === 0) {
    return {
      score: parsedCash > 0 ? 5 : 0,
      tier: parsedCash > 0 ? "Low Risk (100% Cash)" : "Unfunded",
      color: "text-emerald-400",
      borderColor: "border-emerald-500/30",
      bgGradient: "from-emerald-950/20 to-slate-900/60",
      gaugeColor: "#34d399",
      totalPortfolioValue,
      totalCryptoValue,
      cashBalance: parsedCash,
      cashWeight: totalPortfolioValue > 0 ? "100.0%" : "0.0%",
      concentrationScore: 0,
      volatilityScore: 0,
      drawdownScore: 0,
      hhi: "0.000",
      portfolioVolatility: "0.0%",
      portfolioDrawdown: "0.0%",
      dominantAsset: null,
      assetBreakdown: [],
      insights:
        parsedCash > 0
          ? ["Your portfolio is 100% in CCoins cash. Open crypto positions to assess market exposure."]
          : ["No active positions or balance detected. Start trading to view live risk calculations."],
    };
  }

  // 2. Asset Concentration Risk (HHI)
  let hhi = 0;
  let dominantAsset = null;
  let dominantWeight = 0;

  assetBreakdown.forEach((asset) => {
    const weight = totalPortfolioValue > 0 ? asset.value / totalPortfolioValue : 0;
    asset.weight = weight;
    hhi += Math.pow(weight, 2);

    if (weight > dominantWeight) {
      dominantWeight = weight;
      dominantAsset = {
        symbol: asset.symbol,
        weight: (weight * 100).toFixed(1) + "%",
        value: asset.value,
      };
    }
  });

  const cashWeight = totalPortfolioValue > 0 ? parsedCash / totalPortfolioValue : 0;
  // Concentration score (0-100)
  const concentrationScore = Math.min(100, Math.max(0, Math.round(hhi * 100)));

  // 3. Volatility Risk Calculation
  let portfolioVolatility = 0;
  assetBreakdown.forEach((asset) => {
    const klines =
      historicalKlines[asset.coinKey] ||
      historicalKlines[asset.symbol] ||
      historicalKlines[asset.symbol.toLowerCase()] ||
      [];
    const vol = calculateAssetVolatility(klines);
    asset.volatility = vol;
    // Cash has 0 volatility
    portfolioVolatility += asset.weight * vol;
  });

  // Benchmark: 120% annualized volatility corresponds to score of 100
  const volatilityScore = Math.min(
    100,
    Math.max(0, Math.round((portfolioVolatility / 1.2) * 100))
  );

  // 4. Maximum Drawdown Risk Calculation
  let portfolioDrawdown = 0;
  assetBreakdown.forEach((asset) => {
    const klines =
      historicalKlines[asset.coinKey] ||
      historicalKlines[asset.symbol] ||
      historicalKlines[asset.symbol.toLowerCase()] ||
      [];
    const mdd = calculateAssetMaxDrawdown(klines);
    asset.maxDrawdown = mdd;
    portfolioDrawdown += asset.weight * mdd;
  });

  // Benchmark: 60% historical drawdown corresponds to score of 100
  const drawdownScore = Math.min(
    100,
    Math.max(0, Math.round((portfolioDrawdown / 0.6) * 100))
  );

  // 5. Composite Risk Score (0-100)
  // Weights: Concentration (35%), Volatility (40%), Drawdown (25%)
  const rawScore =
    concentrationScore * 0.35 +
    volatilityScore * 0.4 +
    drawdownScore * 0.25;
  const score = Math.min(100, Math.max(1, Math.round(rawScore)));

  // 6. Tiering
  let tier = "Low Risk";
  let color = "text-emerald-400";
  let borderColor = "border-emerald-500/30";
  let bgGradient = "from-emerald-950/25 to-slate-900/60";
  let gaugeColor = "#34d399"; // emerald-400

  if (score > 80) {
    tier = "High Risk";
    color = "text-rose-400";
    borderColor = "border-rose-500/35";
    bgGradient = "from-rose-950/30 to-slate-900/60";
    gaugeColor = "#fb7185"; // rose-400
  } else if (score > 55) {
    tier = "Elevated Risk";
    color = "text-amber-400";
    borderColor = "border-amber-500/35";
    bgGradient = "from-amber-950/30 to-slate-900/60";
    gaugeColor = "#fbbf24"; // amber-400
  } else if (score > 30) {
    tier = "Moderate Risk";
    color = "text-cyan-400";
    borderColor = "border-cyan-500/30";
    bgGradient = "from-cyan-950/25 to-slate-900/60";
    gaugeColor = "#22d3ee"; // cyan-400
  }

  // 7. Dynamic Actionable Insights
  const insights = [];
  if (dominantWeight >= 0.65) {
    insights.push(
      `Overconcentrated: ${(dominantWeight * 100).toFixed(0)}% of your portfolio is in ${dominantAsset?.symbol}. Spreading capital across assets reduces drawdown risk.`
    );
  } else if (dominantWeight >= 0.4) {
    insights.push(
      `Top asset tilt: ${dominantAsset?.symbol} represents ${(dominantWeight * 100).toFixed(0)}% of your portfolio.`
    );
  }

  if (portfolioVolatility > 0.8) {
    insights.push(
      `High volatility: Current holdings carry ${(portfolioVolatility * 100).toFixed(1)}% annualized price fluctuation.`
    );
  } else if (portfolioVolatility > 0.4) {
    insights.push(
      `Balanced volatility: Market swings are in typical crypto range (~${(portfolioVolatility * 100).toFixed(0)}% annualized).`
    );
  }

  if (portfolioDrawdown > 0.35) {
    insights.push(
      `Historical drawdown exposure: Key holdings dipped ${(portfolioDrawdown * 100).toFixed(0)}% in the past 30 days.`
    );
  }

  if (cashWeight > 0.3) {
    insights.push(
      `Cash cushion: ${(cashWeight * 100).toFixed(0)}% held in CCoins cash provides downside protection.`
    );
  }

  if (insights.length === 0) {
    insights.push(
      "Well-distributed asset allocation with healthy volatility and stable drawdown parameters."
    );
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
    insights,
  };
};
