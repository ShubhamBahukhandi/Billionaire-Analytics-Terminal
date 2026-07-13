import { integer, pgTable, real, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const stocksTable = pgTable("stocks", {
  symbol: text("symbol").primaryKey(),
  name: text("name").notNull(),
  exchange: text("exchange").notNull(), // NSE | BSE
  sector: text("sector").notNull(),
  price: real("price").notNull(),
  previousClose: real("previous_close").notNull(),
  dayHigh: real("day_high").notNull(),
  dayLow: real("day_low").notNull(),
  volume: integer("volume").notNull(),
  marketCapCr: real("market_cap_cr").notNull(),
  aiScore: integer("ai_score").notNull(),
  recommendation: text("recommendation").notNull(), // BUY | HOLD | AVOID
  businessQualityScore: integer("business_quality_score").notNull(),
  financialHealthScore: integer("financial_health_score").notNull(),
  growthScore: integer("growth_score").notNull(),
  valuationScore: integer("valuation_score").notNull(),
  riskScore: integer("risk_score").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertStockSchema = createInsertSchema(stocksTable);
export type InsertStock = z.infer<typeof insertStockSchema>;
export type Stock = typeof stocksTable.$inferSelect;
