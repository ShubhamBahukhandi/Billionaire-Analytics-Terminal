import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { stocksTable } from "./stocks";

export const newsTable = pgTable("news", {
  id: serial("id").primaryKey(),
  stockSymbol: text("stock_symbol").references(() => stocksTable.symbol, {
    onDelete: "set null",
  }),
  headline: text("headline").notNull(),
  summary: text("summary").notNull(),
  source: text("source").notNull(),
  sentiment: text("sentiment").notNull(), // POSITIVE | NEGATIVE | NEUTRAL
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
});

export const insertNewsSchema = createInsertSchema(newsTable).omit({ id: true });
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type News = typeof newsTable.$inferSelect;
