import { Candlestick, Asset } from '../types';

export const BINANCE_SYMBOLS: Record<string, string> = {
  'btc-usd': 'BTCUSDT',
  'eth-usd': 'ETHUSDT',
  'sol-usd': 'SOLUSDT',
  'xrp-usd': 'XRPUSDT'
};

export async function fetchHistoricalData(asset: Asset): Promise<Candlestick[]> {
  if (asset.category === 'crypto' && BINANCE_SYMBOLS[asset.id]) {
    try {
      const symbol = BINANCE_SYMBOLS[asset.id];
      const res = await fetch(`/api/klines?symbol=${symbol}`);
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Data is not an array');
      const realCandles = data.map((k: any) => ({
        time: k[0],
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4])
      }));
      
      // Pad with 6200 simulated candles to fill chart history completely
      const paddedCandles: Candlestick[] = [];
      let currentBasePrice = realCandles[0].open;
      const nowTs = realCandles[0].time;
      
      for (let i = 6200; i > 0; i--) {
        const volatility = asset.volatility;
        const trend = asset.trend;
        const change = (Math.random() - 0.5 + (trend * 0.1)) * volatility * currentBasePrice;
        
        const close = currentBasePrice;
        const open = currentBasePrice - change;
        const high = Math.max(open, close) + (Math.random() * volatility * 1.5 * currentBasePrice);
        const low = Math.min(open, close) - (Math.random() * volatility * 1.5 * currentBasePrice);

        paddedCandles.unshift({
          time: nowTs - i * 60000,
          open,
          high,
          low,
          close,
        });
        currentBasePrice = open;
      }
      
      return [...paddedCandles, ...realCandles];
    } catch (err) {
      console.warn(`Failed to fetch history for ${asset.id}, falling back to simulation.`);
    }
  }
  
  // Fallback for non-crypto or if API fails
  const candles: Candlestick[] = [];
  let currentBasePrice = asset.price;
  const nowTs = Date.now();
  const candleLengthSeconds = 60;

  for (let i = 7199; i >= 0; i--) {
    const volatility = asset.volatility;
    const trend = asset.trend;
    let change = 0;

    if (asset.category === 'otc') {
      const meanPrice = asset.price;
      const reversionForce = (meanPrice - currentBasePrice) * 0.012;
      change = ((Math.random() - 0.5) * volatility * currentBasePrice) + reversionForce;
    } else if (asset.category === 'stocks') {
      const trendPhase = Math.sin(i / 150) * 0.15;
      change = (Math.random() - 0.5 + trendPhase + (trend * 0.1)) * volatility * currentBasePrice;
    } else if (asset.category === 'commodities') {
      const cycle = Math.sin(i / 250) * 0.3;
      change = (Math.random() - 0.5 + cycle) * volatility * currentBasePrice;
    } else if (asset.category === 'indices') {
      const isPullback = Math.random() < 0.008;
      const multiplier = isPullback ? -4 : 1.1;
      change = (Math.random() - 0.35 + (trend * 0.05)) * volatility * multiplier * currentBasePrice;
    } else {
      change = (Math.random() - 0.5 + (trend * 0.1)) * volatility * currentBasePrice;
    }

    const close = currentBasePrice;
    const open = currentBasePrice - change;
    const high = Math.max(open, close) + (Math.random() * volatility * 1.5 * currentBasePrice);
    const low = Math.min(open, close) - (Math.random() * volatility * 1.5 * currentBasePrice);

    candles.unshift({
      time: nowTs - i * candleLengthSeconds * 1000,
      open,
      high,
      low,
      close,
    });
    currentBasePrice = open;
  }
  return candles;
}
