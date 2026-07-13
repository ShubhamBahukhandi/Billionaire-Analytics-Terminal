import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, stocksTable, watchlistTable } from "@workspace/db";
import {
  AddWatchlistItemBody,
  AddWatchlistItemResponse,
  ListWatchlistResponse,
  RemoveWatchlistItemParams,
} from "@workspace/api-zod";
import { withChange } from "../lib/stockAggregates";

const router: IRouter = Router();

router.get("/watchlist", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: watchlistTable.id,
      addedAt: watchlistTable.addedAt,
      stock: stocksTable,
    })
    .from(watchlistTable)
    .innerJoin(stocksTable, eq(watchlistTable.symbol, stocksTable.symbol))
    .orderBy(desc(watchlistTable.addedAt));

  const data = rows.map((row) => {
    const stock = withChange(row.stock);
    return {
      id: row.id,
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price,
      changePercent: stock.changePercent,
      aiScore: stock.aiScore,
      recommendation: stock.recommendation,
      addedAt: row.addedAt,
    };
  });

  res.json(ListWatchlistResponse.parse(data));
});

router.post("/watchlist", async (req, res): Promise<void> => {
  const parsed = AddWatchlistItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const symbol = parsed.data.symbol.toUpperCase();

  const [stock] = await db
    .select()
    .from(stocksTable)
    .where(eq(stocksTable.symbol, symbol));

  if (!stock) {
    res.status(404).json({ error: "Stock not found" });
    return;
  }

  const [existing] = await db
    .select()
    .from(watchlistTable)
    .where(eq(watchlistTable.symbol, symbol));

  if (existing) {
    res.status(409).json({ error: "Already in watchlist" });
    return;
  }

  const [item] = await db
    .insert(watchlistTable)
    .values({ symbol })
    .returning();

  const changed = withChange(stock);
  res.status(201).json(
    AddWatchlistItemResponse.parse({
      id: item.id,
      symbol: changed.symbol,
      name: changed.name,
      price: changed.price,
      changePercent: changed.changePercent,
      aiScore: changed.aiScore,
      recommendation: changed.recommendation,
      addedAt: item.addedAt,
    }),
  );
});

router.delete("/watchlist/:symbol", async (req, res): Promise<void> => {
  const params = RemoveWatchlistItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(watchlistTable)
    .where(eq(watchlistTable.symbol, params.data.symbol.toUpperCase()))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
