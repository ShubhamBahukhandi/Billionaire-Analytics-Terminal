import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, newsTable, stocksTable } from "@workspace/db";
import { GetDashboardSummaryResponse } from "@workspace/api-zod";
import { withChangeMany } from "../lib/stockAggregates";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const allStocks = await db.select().from(stocksTable);
  const withChange = withChangeMany(allStocks);

  const topGainers = [...withChange]
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 5);

  const topLosers = [...withChange]
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, 5);

  const mostActive = [...withChange]
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5);

  const latestNews = await db
    .select()
    .from(newsTable)
    .orderBy(desc(newsTable.publishedAt))
    .limit(8);

  res.json(
    GetDashboardSummaryResponse.parse({
      topGainers,
      topLosers,
      mostActive,
      latestNews,
    }),
  );
});

export default router;
