import { RSI, EMA, SMA, MACD, BollingerBands } from "technicalindicators";

export function calculateIndicators(prices: number[]) {
  if (prices.length < 50) {
    throw new Error("Not enough historical data");
  }

  const rsi = RSI.calculate({
    values: prices,
    period: 14,
  });

  const ema20 = EMA.calculate({
    values: prices,
    period: 20,
  });

  const ema50 = EMA.calculate({
    values: prices,
    period: 50,
  });

  const sma20 = SMA.calculate({
    values: prices,
    period: 20,
  });

  const macd = MACD.calculate({
    values: prices,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  });

  const bollinger = BollingerBands.calculate({
    values: prices,
    period: 20,
    stdDev: 2,
  });

  return {
    rsi: rsi.at(-1),
    ema20: ema20.at(-1),
    ema50: ema50.at(-1),
    sma20: sma20.at(-1),
    macd: macd.at(-1),
    bollinger: bollinger.at(-1),
  };
}
