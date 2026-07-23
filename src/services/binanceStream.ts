export type PriceUpdateCallback = (assetId: string, price: number) => void;

class BinanceStream {
  private ws: WebSocket | null = null;
  private callbacks: PriceUpdateCallback[] = [];
  private symbolToId: Record<string, string> = {
    'BTCUSDT': 'btc-usd',
    'ETHUSDT': 'eth-usd',
    'SOLUSDT': 'sol-usd',
    'XRPUSDT': 'xrp-usd'
  };

  connect() {
    if (this.ws) return;
    const streams = Object.keys(this.symbolToId).map(s => `${s.toLowerCase()}@trade`).join('/');
    this.ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

    this.ws.onmessage = (event) => {
      const raw = JSON.parse(event.data);
      const data = raw.data ? raw.data : raw;
      if (data && data.s && data.p) {
        const symbol = data.s;
        const price = parseFloat(data.p);
        const assetId = this.symbolToId[symbol];
        if (assetId) {
          this.callbacks.forEach(cb => cb(assetId, price));
        }
      }
    };

    this.ws.onclose = () => {
      this.ws = null;
      setTimeout(() => this.connect(), 3000);
    };
  }

  subscribe(cb: PriceUpdateCallback) {
    this.callbacks.push(cb);
    if (!this.ws) this.connect();
    return () => {
      this.callbacks = this.callbacks.filter(c => c !== cb);
    };
  }
}

export const binanceStream = new BinanceStream();
