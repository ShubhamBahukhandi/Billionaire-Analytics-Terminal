import { pgTable, serial, text, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { stocksTable } from "./stocks";

export const watchlistTable = pgTable(
  "watchlist",
  {
    id: serial("id").primaryKey(),
    symbol: text("symbol")
      .notNull()
      .references(() => stocksTable.symbol, { onDelete: "cascade" }),
    addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.symbol)],
);

export const insertWatchlistSchema = createInsertSchema(watchlistTable).omit({
  id: true,
  addedAt: true,
});
export type InsertWatchlist = z.infer<typeof insertWatchlistSchema>;
export type Watchlist = typeof watchlistTable.$inferSelect;
