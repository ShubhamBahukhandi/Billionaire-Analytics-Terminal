import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, portfolioHoldingsTable, stocksTable } from "@workspace/db";
import {
  AddPortfolioHoldingBody,
  AddPortfolioHoldingResponse,
  DeletePortfolioHoldingParams,
  GetPortfolioSummaryResponse,
  ListPortfolioHoldingsResponse,
  UpdatePortfolioHoldingBody,
  UpdatePortfolioHoldingParams,
  UpdatePortfolioHoldingResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function loadHoldingsWithStocks() {
  const rows = await db
    .select({ holding: portfolioHoldingsTable, stock: stocksTable })
    .from(portfolioHoldingsTable)
    .innerJoin(stocksTable, eq(portfolioHoldingsTable.symbol, stocksTable.symbol))
    .orderBy(desc(portfolioHoldingsTable.createdAt));

  return rows.map(({ holding, stock }) => {
    const investedValue = holding.quantity * holding.avgBuyPrice;
    const currentValue = holding.quantity * stock.price;
    const pnl = currentValue - investedValue;
    const pnlPercent = investedValue === 0 ? 0 : (pnl / investedValue) * 100;

    return {
      id: holding.id,
      symbol: stock.symbol,
      name: stock.name,
      quantity: holding.quantity,
      avgBuyPrice: holding.avgBuyPrice,
      currentPrice: stock.price,
      investedValue,
      currentValue,
      pnl,
      pnlPercent,
      buyDate: holding.buyDate,
    };
  });
}

router.get("/portfolio", async (_req, res): Promise<void> => {
  const holdings = await loadHoldingsWithStocks();
  res.json(ListPortfolioHoldingsResponse.parse(holdings));
});

router.get("/portfolio/summary", async (_req, res): Promise<void> => {
  const holdings = await loadHoldingsWithStocks();

  const totalInvested = holdings.reduce((sum, h) => sum + h.investedValue, 0);
  const currentValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalPnl = currentValue - totalInvested;
  const totalPnlPercent = totalInvested === 0 ? 0 : (totalPnl / totalInvested) * 100;

  res.json(
    GetPortfolioSummaryResponse.parse({
      totalInvested,
      currentValue,
      totalPnl,
      totalPnlPercent,
      holdingsCount: holdings.length,
    }),
  );
});

router.post("/portfolio", async (req, res): Promise<void> => {
  const parsed = AddPortfolioHoldingBody.safeParse(req.body);
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

  const [holding] = await db
    .insert(portfolioHoldingsTable)
    .values({
      symbol,
      quantity: parsed.data.quantity,
      avgBuyPrice: parsed.data.avgBuyPrice,
      buyDate: parsed.data.buyDate,
    })
    .returning();

  const investedValue = holding.quantity * holding.avgBuyPrice;
  const currentValue = holding.quantity * stock.price;
  const pnl = currentValue - investedValue;
  const pnlPercent = investedValue === 0 ? 0 : (pnl / investedValue) * 100;

  res.status(201).json(
    AddPortfolioHoldingResponse.parse({
      id: holding.id,
      symbol: stock.symbol,
      name: stock.name,
      quantity: holding.quantity,
      avgBuyPrice: holding.avgBuyPrice,
      currentPrice: stock.price,
      investedValue,
      currentValue,
      pnl,
      pnlPercent,
      buyDate: holding.buyDate,
    }),
  );
});

router.patch("/portfolio/:id", async (req, res): Promise<void> => {
  const params = UpdatePortfolioHoldingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdatePortfolioHoldingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [holding] = await db
    .update(portfolioHoldingsTable)
    .set(parsed.data)
    .where(eq(portfolioHoldingsTable.id, params.data.id))
    .returning();

  if (!holding) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const [stock] = await db
    .select()
    .from(stocksTable)
    .where(eq(stocksTable.symbol, holding.symbol));

  if (!stock) {
    res.status(404).json({ error: "Stock not found" });
    return;
  }

  const investedValue = holding.quantity * holding.avgBuyPrice;
  const currentValue = holding.quantity * stock.price;
  const pnl = currentValue - investedValue;
  const pnlPercent = investedValue === 0 ? 0 : (pnl / investedValue) * 100;

  res.json(
    UpdatePortfolioHoldingResponse.parse({
      id: holding.id,
      symbol: stock.symbol,
      name: stock.name,
      quantity: holding.quantity,
      avgBuyPrice: holding.avgBuyPrice,
      currentPrice: stock.price,
      investedValue,
      currentValue,
      pnl,
      pnlPercent,
      buyDate: holding.buyDate,
    }),
  );
});

router.delete("/portfolio/:id", async (req, res): Promise<void> => {
  const params = DeletePortfolioHoldingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(portfolioHoldingsTable)
    .where(eq(portfolioHoldingsTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
