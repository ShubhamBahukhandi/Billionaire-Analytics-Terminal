import { pgTable, real, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { stocksTable } from "./stocks";

export const financialMetricsTable = pgTable("financial_metrics", {
  symbol: text("symbol")
    .primaryKey()
    .references(() => stocksTable.symbol, { onDelete: "cascade" }),
  revenueCr: real("revenue_cr").notNull(),
  revenueGrowthYoyPercent: real("revenue_growth_yoy_percent").notNull(),
  netProfitCr: real("net_profit_cr").notNull(),
  profitGrowthYoyPercent: real("profit_growth_yoy_percent").notNull(),
  epsInr: real("eps_inr").notNull(),
  peRatio: real("pe_ratio").notNull(),
  pbRatio: real("pb_ratio").notNull(),
  roePercent: real("roe_percent").notNull(),
  rocePercent: real("roce_percent").notNull(),
  debtToEquity: real("debt_to_equity").notNull(),
  dividendYieldPercent: real("dividend_yield_percent").notNull(),
  promoterHoldingPercent: real("promoter_holding_percent").notNull(),
});

export const insertFinancialMetricsSchema = createInsertSchema(financialMetricsTable);
export type InsertFinancialMetrics = z.infer<typeof insertFinancialMetricsSchema>;
export type FinancialMetrics = typeof financialMetricsTable.$inferSelect;
