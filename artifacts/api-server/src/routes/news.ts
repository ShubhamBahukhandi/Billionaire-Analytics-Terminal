import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, newsTable } from "@workspace/db";
import { ListNewsQueryParams, ListNewsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/news", async (req, res): Promise<void> => {
  const parsed = ListNewsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const rows = await db
    .select()
    .from(newsTable)
    .orderBy(desc(newsTable.publishedAt))
    .limit(parsed.data.limit);

  res.json(ListNewsResponse.parse(rows));
});

export default router;
