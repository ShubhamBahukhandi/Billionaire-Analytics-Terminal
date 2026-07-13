import React from "react";
import { Link } from "wouter";
import { useListNews } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, ArrowUpRight } from "lucide-react";

export default function News() {
  const { data: news, isLoading } = useListNews({ limit: 50 });

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Market News</h1>
        <p className="text-muted-foreground mt-1">Real-time financial intelligence feed.</p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-6 space-y-3">
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))
        ) : (
          news?.map((item) => (
            <Card key={item.id} className="border-border/50 bg-card/50 hover:bg-card transition-colors duration-200">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-sm bg-muted text-muted-foreground uppercase tracking-wider">
                        {item.source}
                      </span>
                      {item.stockSymbol && (
                        <Link href={`/stocks/${item.stockSymbol}`}>
                          <Badge variant="outline" className="text-xs cursor-pointer hover:bg-primary/20 hover:text-primary border-primary/20 transition-colors">
                            {item.stockSymbol}
                          </Badge>
                        </Link>
                      )}
                      <Badge 
                        variant={item.sentiment === 'POSITIVE' ? 'success' : item.sentiment === 'NEGATIVE' ? 'destructive' : 'secondary'}
                        className="text-[10px] px-1.5 py-0 h-4 uppercase"
                      >
                        {item.sentiment}
                      </Badge>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-foreground leading-snug">
                      {item.headline}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.summary}
                    </p>
                  </div>
                  
                  <div className="shrink-0 flex items-center sm:items-end flex-row sm:flex-col justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1 font-mono bg-background/50 px-2 py-1 rounded">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{new Date(item.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
        
        {!isLoading && news?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No news items found.
          </div>
        )}
      </div>
    </div>
  );
}
