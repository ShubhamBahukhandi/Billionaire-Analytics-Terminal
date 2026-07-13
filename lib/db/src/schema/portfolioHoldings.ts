import { date, integer, pgTable, real, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { stocksTable } from "./stocks";

export const portfolioHoldingsTable = pgTable("portfolio_holdings", {
  id: serial("id").primaryKey(),
  symbol: text("symbol")
    .notNull()
    .references(() => stocksTable.symbol, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull(),
  avgBuyPrice: real("avg_buy_price").notNull(),
  buyDate: date("buy_date", { mode: "string" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPortfolioHoldingSchema = createInsertSchema(portfolioHoldingsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertPortfolioHolding = z.infer<typeof insertPortfolioHoldingSchema>;
export type PortfolioHolding = typeof portfolioHoldingsTable.$inferSelect;
