import React from "react";
import { Link } from "wouter";
import { useListWatchlist, useRemoveWatchlistItem } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { Trash2, TrendingUp, AlertTriangle, ShieldCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Watchlist() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: watchlist, isLoading } = useListWatchlist();
  
  const removeMutation = useRemoveWatchlistItem({
    mutation: {
      onSuccess: () => {
        toast({ title: "Removed from watchlist" });
        queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
      },
      onError: () => {
        toast({ title: "Error removing item", variant: "destructive" });
      }
    }
  });

  const getRecommendationBadge = (rec: string) => {
    switch (rec) {
      case 'BUY': return <Badge variant="success" className="font-bold"><TrendingUp className="w-3 h-3 mr-1"/> BUY</Badge>;
      case 'HOLD': return <Badge variant="warning" className="font-bold"><ShieldCheck className="w-3 h-3 mr-1"/> HOLD</Badge>;
      case 'AVOID': return <Badge variant="destructive" className="font-bold"><AlertTriangle className="w-3 h-3 mr-1"/> AVOID</Badge>;
      default: return <Badge variant="secondary">{rec}</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success font-bold";
    if (score >= 60) return "text-warning font-bold";
    return "text-destructive font-bold";
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Watchlist</h1>
        <p className="text-muted-foreground mt-1">Tracked assets and AI recommendations.</p>
      </div>

      <div className="border border-border/50 rounded-lg bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Change</TableHead>
              <TableHead className="text-center">AI Score</TableHead>
              <TableHead className="text-center">Recommendation</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-10 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : watchlist?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  Your watchlist is empty. Search for a stock to add it.
                </TableCell>
              </TableRow>
            ) : (
              watchlist?.map((item) => (
                <TableRow key={item.id} className="group">
                  <TableCell>
                    <Link href={`/stocks/${item.symbol}`} className="font-bold text-foreground hover:text-primary transition-colors">
                      {item.symbol}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground truncate max-w-[200px]">
                    {item.name}
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    {formatCurrency(item.price)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge 
                      variant={item.changePercent >= 0 ? "success" : "destructive"}
                      className="font-mono text-xs px-1.5 py-0.5 rounded-sm"
                    >
                      {formatPercentage(item.changePercent)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    <span className={getScoreColor(item.aiScore)}>{item.aiScore}</span>
                    <span className="text-muted-foreground text-xs">/100</span>
                  </TableCell>
                  <TableCell className="text-center">
                    {getRecommendationBadge(item.recommendation)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeMutation.mutate({ symbol: item.symbol })}
                      disabled={removeMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
