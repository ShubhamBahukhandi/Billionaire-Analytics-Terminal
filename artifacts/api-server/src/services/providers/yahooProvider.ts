import yahooFinance from "yahoo-finance2";

export async function getQuote(symbol: string) {
  try {
    const quote: any = await yahooFinance.quote(symbol);

    return {
      symbol: quote.symbol,
      name: quote.shortName,
      price: quote.regularMarketPrice,
      previousClose: quote.regularMarketPreviousClose,
      open: quote.regularMarketOpen,
      high: quote.regularMarketDayHigh,
      low: quote.regularMarketDayLow,
      volume: quote.regularMarketVolume,
      marketCap: quote.marketCap,
      currency: quote.currency,
    };
  } catch (error) {
    console.error("Yahoo Finance Error:", error);
    throw error;
  }
}

export async function getHistoricalPrices(symbol: string) {
  const result: any = await yahooFinance.chart(symbol, {
    period1: "6mo",
    interval: "1d",
  });

  return result.quotes
    .filter((q: any) => q.close != null)
    .map((q: any) => q.close as number);
}
