export const getBinancePrice = async (symbol = "BTCUSDT") => {
  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
    const data = await res.json();
    
    return {
      price: parseFloat(data.lastPrice), // Price
      volume: parseFloat(data.volume), // 24hr trading volume
      marketCap: parseFloat(data.quoteVolume), // 24hr market cap 
    };
  } catch (err) {
    console.error("Binance price fetch error:", err);
    return null;
  }
};

// In-memory cache for historical klines (5-minute TTL) to prevent rate limits
const klinesCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Fetches daily closing prices for historical risk calculations
 * @param {string} symbol - e.g. "BTCUSDT"
 * @param {number} limit - Number of daily candles (default 30)
 * @returns {Promise<Array<number>>} Array of daily closing prices
 */
export const getBinanceHistoricalKlines = async (symbol = "BTCUSDT", limit = 30) => {
  const formattedSymbol = symbol.toUpperCase().endsWith("USDT") ? symbol.toUpperCase() : `${symbol.toUpperCase()}USDT`;
  const cacheKey = `${formattedSymbol}_${limit}`;
  const cached = klinesCache.get(cacheKey);

  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  try {
    const res = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${formattedSymbol}&interval=1d&limit=${limit}`
    );
    if (!res.ok) throw new Error(`Binance API error: ${res.status}`);
    const raw = await res.json();
    
    // Index 4 in Binance kline array is the closing price
    const closePrices = raw.map((entry) => parseFloat(entry[4]));
    klinesCache.set(cacheKey, { data: closePrices, timestamp: Date.now() });
    return closePrices;
  } catch (err) {
    console.warn(`Failed to fetch klines for ${formattedSymbol}:`, err);
    return [];
  }
};

