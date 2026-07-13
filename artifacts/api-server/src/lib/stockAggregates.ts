import type { Stock } from "@workspace/db";

export interface StockWithChange extends Stock {
  change: number;
  changePercent: number;
}

export function withChange(stock: Stock): StockWithChange {
  const change = stock.price - stock.previousClose;
  const changePercent =
    stock.previousClose === 0 ? 0 : (change / stock.previousClose) * 100;
  return { ...stock, change, changePercent };
}

export function withChangeMany(stocks: Stock[]): StockWithChange[] {
  return stocks.map(withChange);
}
