import { getQuote, getHistoricalPrices } from "./providers/yahooProvider";

import { calculateIndicators } from "./indicatorService";

export async function getLiveStock(symbol: string) {
  const quote = await getQuote(symbol);

  const prices = await getHistoricalPrices(symbol);

  const indicators = calculateIndicators(prices);

  const previousClose = quote.previousClose ?? quote.price ?? 0;
  const currentPrice = quote.price ?? 0;

  const change = currentPrice - previousClose;

  const changePercent =
    previousClose === 0 ? 0 : (change / previousClose) * 100;

  return {
    ...quote,
    change,
    changePercent,
    indicators,
  };
}
