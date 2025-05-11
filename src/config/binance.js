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
