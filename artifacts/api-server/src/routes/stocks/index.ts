import { Router, type IRouter } from "express";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import {
  db,
  financialMetricsTable,
  newsTable,
  stocksTable,
} from "@workspace/db";
import {
  GetStockMetricsParams,
  GetStockMetricsResponse,
  GetStockNewsParams,
  GetStockNewsResponse,
  GetStockParams,
  GetStockResponse,
  ListStocksQueryParams,
  ListStocksResponse,
} from "@workspace/api-zod";
import { withChange, withChangeMany } from "../../lib/stockAggregates";
import { getLiveStock } from "../../services/marketService";
const router: IRouter = Router();

router.get("/stocks", async (req, res): Promise<void> => {
  const parsed = ListStocksQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { query, limit } = parsed.data;

  const rows = query
    ? await db
        .select()
        .from(stocksTable)
        .where(
          or(
            ilike(stocksTable.symbol, `%${query}%`),
            ilike(stocksTable.name, `%${query}%`),
          ),
        )
        .orderBy(desc(stocksTable.marketCapCr))
        .limit(limit)
    : await db
        .select()
        .from(stocksTable)
        .orderBy(desc(stocksTable.marketCapCr))
        .limit(limit);

  res.json(ListStocksResponse.parse(withChangeMany(rows)));
});

router.get("/stocks/:symbol", async (req, res): Promise<void> => {
  const params = GetStockParams.safeParse(req.params);

  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  try {
    const symbol = `${params.data.symbol.toUpperCase()}.NS`;

    const liveStock = await getLiveStock(symbol);

    res.json(liveStock);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to fetch live market data",
    });
  }
});

router.get("/stocks/:symbol/metrics", async (req, res): Promise<void> => {
  const params = GetStockMetricsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [metrics] = await db
    .select()
    .from(financialMetricsTable)
    .where(eq(financialMetricsTable.symbol, params.data.symbol.toUpperCase()));

  if (!metrics) {
    res.status(404).json({ error: "Metrics not found" });
    return;
  }

  res.json(GetStockMetricsResponse.parse(metrics));
});

router.get("/stocks/:symbol/news", async (req, res): Promise<void> => {
  const params = GetStockNewsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const rows = await db
    .select()
    .from(newsTable)
    .where(eq(newsTable.stockSymbol, params.data.symbol.toUpperCase()))
    .orderBy(desc(newsTable.publishedAt));

  res.json(GetStockNewsResponse.parse(rows));
});

export default router;
