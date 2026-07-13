import React from "react";
import { useParams } from "wouter";
import { 
  useGetStock, 
  useGetStockMetrics, 
  useGetStockNews,
  useAddWatchlistItem 
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/utils";
import { 
  TrendingUp, TrendingDown, Star, Activity, 
  AlertTriangle, ShieldCheck, Clock, CheckCircle2,
  LineChart as LineChartIcon, PieChart, BarChart
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function StockDetail() {
  const { symbol } = useParams<{ symbol: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stock, isLoading: isLoadingStock } = useGetStock(symbol || "");
  const { data: metrics, isLoading: isLoadingMetrics } = useGetStockMetrics(symbol || "");
  const { data: news, isLoading: isLoadingNews } = useGetStockNews(symbol || "");

  const addWatchlistMutation = useAddWatchlistItem({
    mutation: {
      onSuccess: () => {
        toast({ title: `${symbol} added to watchlist` });
        queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
      },
      onError: () => toast({ title: "Failed to add to watchlist", variant: "destructive" })
    }
  });

  if (isLoadingStock) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-4">
          <Skeleton className="h-40 md:col-span-2 rounded-xl" />
          <Skeleton className="h-40 md:col-span-2 rounded-xl" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-96 md:col-span-2 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="p-6 lg:p-8 flex flex-col items-center justify-center h-64 text-center">
        <Activity className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
        <h2 className="text-xl font-bold">Stock not found</h2>
        <p className="text-muted-foreground">The symbol {symbol} could not be located.</p>
      </div>
    );
  }

  const getRecommendationDetails = (rec: string) => {
    switch (rec) {
      case 'BUY': return { 
        icon: TrendingUp, 
        color: "text-success", 
        bg: "bg-success/10 border-success/20",
        text: "Accumulate at current levels. Strong upside potential identified by AI models."
      };
      case 'HOLD': return { 
        icon: ShieldCheck, 
        color: "text-warning", 
        bg: "bg-warning/10 border-warning/20",
        text: "Maintain existing positions. Risk/reward is balanced at current valuation."
      };
      case 'AVOID': return { 
        icon: AlertTriangle, 
        color: "text-destructive", 
        bg: "bg-destructive/10 border-destructive/20",
        text: "Capital preservation advised. Deteriorating fundamentals or extreme overvaluation."
      };
      default: return { icon: Activity, color: "text-muted-foreground", bg: "bg-muted", text: "" };
    }
  };

  const recDetails = getRecommendationDetails(stock.recommendation);
  const RecIcon = recDetails.icon;

  const scoreIndicatorColor = (score: number) => {
    if (score >= 80) return "bg-success";
    if (score >= 60) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">{stock.symbol}</h1>
            <Badge variant="outline" className="text-xs bg-muted/50 border-border/50 uppercase tracking-widest">{stock.exchange}</Badge>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">{stock.sector}</Badge>
          </div>
          <p className="text-lg text-muted-foreground">{stock.name}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            className="border-primary/50 text-primary hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={() => addWatchlistMutation.mutate({ data: { symbol: stock.symbol } })}
            disabled={addWatchlistMutation.isPending}
          >
            <Star className="mr-2 h-4 w-4" /> 
            {addWatchlistMutation.isPending ? "Adding..." : "Add to Watchlist"}
          </Button>
        </div>
      </div>

      {/* Top Row Cards */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Price Card */}
        <Card className="md:col-span-5 bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Live Price</div>
                <div className="text-4xl font-bold font-mono tracking-tight flex items-baseline">
                  {formatCurrency(stock.price)}
                  <span className={`ml-3 text-lg font-medium flex items-center ${stock.changePercent >= 0 ? "text-success" : "text-destructive"}`}>
                    {stock.changePercent >= 0 ? <TrendingUp className="h-5 w-5 mr-1" /> : <TrendingDown className="h-5 w-5 mr-1" />}
                    {stock.changePercent >= 0 ? "+" : ""}{formatCurrency(stock.change)} ({formatPercentage(stock.changePercent)})
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border/50">
              <div>
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Day Range</div>
                <div className="font-mono text-sm font-medium flex items-center justify-between">
                  <span>{formatNumber(stock.dayLow)}</span>
                  <div className="h-1 flex-1 mx-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary/50 w-1/2 ml-1/4"></div>
                  </div>
                  <span>{formatNumber(stock.dayHigh)}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Volume</div>
                <div className="font-mono text-sm font-medium">{formatNumber(stock.volume)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Prev Close</div>
                <div className="font-mono text-sm font-medium">{formatCurrency(stock.previousClose)}</div>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Market Cap</div>
                <div className="font-mono text-sm font-medium">₹{formatNumber(stock.marketCapCr)} Cr</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendation Card */}
        <Card className={`md:col-span-7 border ${recDetails.bg} backdrop-blur-sm relative overflow-hidden`}>
          <div className="absolute right-0 top-0 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
            <RecIcon className="h-64 w-64" />
          </div>
          <CardContent className="p-6 relative z-10 flex h-full items-center">
            <div className="flex-1 flex items-center gap-8">
              <div className="text-center shrink-0">
                <div className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">AI Conviction Score</div>
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/20" />
                    <circle 
                      cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="8" fill="transparent" 
                      strokeDasharray="276" strokeDashoffset={276 - (276 * stock.aiScore) / 100} 
                      className={`${recDetails.color} transition-all duration-1000 ease-out`} 
                    />
                  </svg>
                  <span className={`absolute text-3xl font-bold font-mono ${recDetails.color}`}>{stock.aiScore}</span>
                </div>
              </div>
              <div className="flex-1 border-l border-border/50 pl-8">
                <div className="flex items-center space-x-3 mb-2">
                  <RecIcon className={`h-8 w-8 ${recDetails.color}`} />
                  <span className={`text-3xl font-bold tracking-tight uppercase ${recDetails.color}`}>{stock.recommendation}</span>
                </div>
                <p className="text-foreground/80 leading-relaxed text-lg">
                  {recDetails.text}
                </p>
                <div className="mt-4 flex gap-4">
                  <Badge variant="outline" className="bg-background/50 backdrop-blur">Institutional Grade Analysis</Badge>
                  <div className="text-xs text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" /> Updated recently
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column - Chart & Metrics */}
        <div className="space-y-6 lg:col-span-8">
          {/* Chart Placeholder */}
          <Card className="border-border/50 bg-card/50 overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <LineChartIcon className="mr-2 h-5 w-5 text-primary" />
                  Technical View
                </CardTitle>
                <div className="flex gap-2">
                  {['1D', '1W', '1M', '3M', '1Y', '5Y'].map(tf => (
                    <Badge key={tf} variant={tf === '1M' ? 'default' : 'secondary'} className="cursor-pointer rounded-sm px-2">
                      {tf}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[400px] w-full bg-[#0B0E14] relative border-b-2 border-primary/20">
                {/* Fake Chart Grid */}
                <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-10 pointer-events-none">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className="border-r border-b border-white"></div>
                  ))}
                </div>
                {/* Fake Chart Element */}
                <div className="absolute inset-0 flex items-end justify-between px-4 pb-8 pt-12 space-x-1 opacity-80">
                  {Array.from({ length: 60 }).map((_, i) => {
                    const isUp = Math.random() > 0.4;
                    const height = 20 + Math.random() * 60;
                    return (
                      <div key={i} className="relative flex-1 flex justify-center group cursor-crosshair hover:bg-white/5">
                        <div 
                          className={`w-[2px] absolute ${isUp ? 'bg-[#26a69a]' : 'bg-[#ef5350]'}`}
                          style={{ height: `${height + 20}%`, bottom: `${Math.random() * 20}%` }}
                        ></div>
                        <div 
                          className={`w-full max-w-[8px] absolute rounded-[1px] ${isUp ? 'bg-[#26a69a]' : 'bg-[#ef5350]'}`}
                          style={{ height: `${height}%`, bottom: `${Math.random() * 20 + 10}%` }}
                        ></div>
                      </div>
                    );
                  })}
                </div>
                <div className="absolute bottom-2 left-4 text-xs text-white/40 font-mono">Interactive Chart disabled in preview</div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Metrics */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center">
                <PieChart className="mr-2 h-5 w-5 text-primary" />
                Key Financial Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingMetrics ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : metrics ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Revenue</div>
                      <div className="font-mono font-medium text-lg flex items-center">
                        ₹{formatNumber(metrics.revenueCr)} Cr
                        <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-sm ${metrics.revenueGrowthYoyPercent >= 0 ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>
                          {formatPercentage(metrics.revenueGrowthYoyPercent)} YoY
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Net Profit</div>
                      <div className="font-mono font-medium text-lg flex items-center">
                        ₹{formatNumber(metrics.netProfitCr)} Cr
                        <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-sm ${metrics.profitGrowthYoyPercent >= 0 ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>
                          {formatPercentage(metrics.profitGrowthYoyPercent)} YoY
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">EPS (TTM)</div>
                      <div className="font-mono font-medium text-lg">₹{formatNumber(metrics.epsInr)}</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">P/E Ratio</div>
                      <div className="font-mono font-medium text-lg">{formatNumber(metrics.peRatio)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">P/B Ratio</div>
                      <div className="font-mono font-medium text-lg">{formatNumber(metrics.pbRatio)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Debt to Equity</div>
                      <div className="font-mono font-medium text-lg">{formatNumber(metrics.debtToEquity)}</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">ROE</div>
                      <div className="font-mono font-medium text-lg">{formatPercentage(metrics.roePercent)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">ROCE</div>
                      <div className="font-mono font-medium text-lg">{formatPercentage(metrics.rocePercent)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Promoter Holding</div>
                      <div className="font-mono font-medium text-lg">{formatPercentage(metrics.promoterHoldingPercent)}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground py-4 text-center">Metrics unavailable</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sub-scores & News */}
        <div className="space-y-6 lg:col-span-4">
          {/* Sub Scores */}
          <Card className="border-border/50 bg-card/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center">
                <BarChart className="mr-2 h-5 w-5 text-primary" />
                Factor Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <div className="font-medium">Business Quality</div>
                    <div className="text-xs text-muted-foreground">Moat, margins, and market share</div>
                  </div>
                  <div className={`font-bold font-mono ${scoreIndicatorColor(stock.businessQualityScore).replace('bg-', 'text-')}`}>
                    {stock.businessQualityScore}
                  </div>
                </div>
                <Progress value={stock.businessQualityScore} indicatorColor={scoreIndicatorColor(stock.businessQualityScore)} className="h-2 bg-muted" />
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <div className="font-medium">Financial Health</div>
                    <div className="text-xs text-muted-foreground">Balance sheet strength, cash flow</div>
                  </div>
                  <div className={`font-bold font-mono ${scoreIndicatorColor(stock.financialHealthScore).replace('bg-', 'text-')}`}>
                    {stock.financialHealthScore}
                  </div>
                </div>
                <Progress value={stock.financialHealthScore} indicatorColor={scoreIndicatorColor(stock.financialHealthScore)} className="h-2 bg-muted" />
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <div className="font-medium">Growth</div>
                    <div className="text-xs text-muted-foreground">Historical & projected earnings</div>
                  </div>
                  <div className={`font-bold font-mono ${scoreIndicatorColor(stock.growthScore).replace('bg-', 'text-')}`}>
                    {stock.growthScore}
                  </div>
                </div>
                <Progress value={stock.growthScore} indicatorColor={scoreIndicatorColor(stock.growthScore)} className="h-2 bg-muted" />
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <div className="font-medium">Valuation</div>
                    <div className="text-xs text-muted-foreground">Price relative to intrinsic value</div>
                  </div>
                  <div className={`font-bold font-mono ${scoreIndicatorColor(stock.valuationScore).replace('bg-', 'text-')}`}>
                    {stock.valuationScore}
                  </div>
                </div>
                <Progress value={stock.valuationScore} indicatorColor={scoreIndicatorColor(stock.valuationScore)} className="h-2 bg-muted" />
              </div>

              <div className="pt-4 border-t border-border/50">
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center text-muted-foreground">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    <span className="font-medium text-foreground">Risk Profile</span>
                  </div>
                  <div className={`font-bold font-mono ${stock.riskScore > 70 ? 'text-destructive' : stock.riskScore > 40 ? 'text-warning' : 'text-success'}`}>
                    {stock.riskScore}
                  </div>
                </div>
                <Progress 
                  value={stock.riskScore} 
                  indicatorColor={stock.riskScore > 70 ? 'bg-destructive' : stock.riskScore > 40 ? 'bg-warning' : 'bg-success'} 
                  className="h-2 bg-muted" 
                />
              </div>
            </CardContent>
          </Card>

          {/* News Feed */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center">
                <Clock className="mr-2 h-5 w-5 text-primary" />
                Latest Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingNews ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : news && news.length > 0 ? (
                <div className="space-y-5">
                  {news.map(item => (
                    <div key={item.id} className="group cursor-pointer">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground uppercase">
                          {item.source}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center">
                          {new Date(item.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        <div className="ml-auto flex items-center">
                          <Badge 
                            variant={item.sentiment === 'POSITIVE' ? 'success' : item.sentiment === 'NEGATIVE' ? 'destructive' : 'secondary'}
                            className="text-[9px] px-1 h-3.5 uppercase"
                          >
                            {item.sentiment}
                          </Badge>
                        </div>
                      </div>
                      <h4 className="text-sm font-medium text-foreground leading-snug group-hover:text-primary transition-colors">
                        {item.headline}
                      </h4>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground text-sm text-center py-6">No recent news found for this asset.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
