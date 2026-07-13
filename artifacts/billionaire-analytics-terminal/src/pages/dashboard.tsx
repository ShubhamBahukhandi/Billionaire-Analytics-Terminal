import React from "react";
import { Link } from "wouter";
import { useGetDashboardSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { ArrowUpRight, TrendingUp, TrendingDown, Activity, Clock } from "lucide-react";

export default function Dashboard() {
  const { data: summary, isLoading } = useGetDashboardSummary();

  if (isLoading || !summary) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  const renderStockTable = (stocks: any[]) => (
    <Table>
      <TableHeader>
        <TableRow className="border-border/50 hover:bg-transparent">
          <TableHead className="w-[100px]">Symbol</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="text-right">Change</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stocks.map((stock) => (
          <TableRow key={stock.symbol} className="border-border/50 cursor-pointer hover:bg-muted/50">
            <TableCell>
              <Link href={`/stocks/${stock.symbol}`} className="font-semibold text-foreground hover:text-primary transition-colors">
                {stock.symbol}
              </Link>
            </TableCell>
            <TableCell className="text-right font-mono text-xs">
              {formatCurrency(stock.price)}
            </TableCell>
            <TableCell className="text-right">
              <Badge 
                variant={stock.changePercent >= 0 ? "success" : "destructive"}
                className="font-mono text-xs px-1.5 py-0 rounded-sm"
              >
                {formatPercentage(stock.changePercent)}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Market Pulse</h1>
          <p className="text-muted-foreground mt-1">Live NSE/BSE analytics and movers.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Top Gainers */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-success">
              <TrendingUp className="mr-2 h-5 w-5" />
              Top Gainers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {renderStockTable(summary.topGainers)}
          </CardContent>
        </Card>

        {/* Top Losers */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-destructive">
              <TrendingDown className="mr-2 h-5 w-5" />
              Top Losers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {renderStockTable(summary.topLosers)}
          </CardContent>
        </Card>

        {/* Most Active */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-primary">
              <Activity className="mr-2 h-5 w-5" />
              Most Active
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {renderStockTable(summary.mostActive)}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>Latest Market News</CardTitle>
              <CardDescription>Real-time feed from top financial sources</CardDescription>
            </div>
            <Link href="/news" className="text-sm font-medium text-primary hover:underline flex items-center">
              View all <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border/50">
              {summary.latestNews.slice(0, 5).map((news) => (
                <div key={news.id} className="py-4 first:pt-0 last:pb-0 group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-sm bg-muted text-muted-foreground uppercase tracking-wider">
                        {news.source}
                      </span>
                      {news.stockSymbol && (
                        <Link href={`/stocks/${news.stockSymbol}`}>
                          <Badge variant="outline" className="text-xs cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors">
                            {news.stockSymbol}
                          </Badge>
                        </Link>
                      )}
                      <Badge 
                        variant={news.sentiment === 'POSITIVE' ? 'success' : news.sentiment === 'NEGATIVE' ? 'destructive' : 'secondary'}
                        className="text-[10px] px-1.5 py-0 h-4 uppercase"
                      >
                        {news.sentiment}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      {new Date(news.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {news.headline}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {news.summary}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
