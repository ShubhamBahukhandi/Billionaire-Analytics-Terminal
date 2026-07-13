import React, { useState } from "react";
import { Link } from "wouter";
import { 
  useListPortfolioHoldings, 
  useGetPortfolioSummary,
  useAddPortfolioHolding,
  useUpdatePortfolioHolding,
  useDeletePortfolioHolding
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/utils";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, PieChart, TrendingUp, TrendingDown, Plus, Pencil, Trash2 } from "lucide-react";

export default function Portfolio() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: holdings, isLoading: isLoadingHoldings } = useListPortfolioHoldings();
  const { data: summary, isLoading: isLoadingSummary } = useGetPortfolioSummary();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({ symbol: "", quantity: "", avgBuyPrice: "", buyDate: new Date().toISOString().split('T')[0] });

  const addMutation = useAddPortfolioHolding({
    mutation: {
      onSuccess: () => {
        toast({ title: "Holding added" });
        setIsAddOpen(false);
        setFormData({ symbol: "", quantity: "", avgBuyPrice: "", buyDate: new Date().toISOString().split('T')[0] });
        queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
        queryClient.invalidateQueries({ queryKey: ["/api/portfolio/summary"] }); // hypothetical
      },
      onError: () => toast({ title: "Failed to add holding", variant: "destructive" })
    }
  });

  const deleteMutation = useDeletePortfolioHolding({
    mutation: {
      onSuccess: () => {
        toast({ title: "Holding removed" });
        queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      },
      onError: () => toast({ title: "Failed to remove", variant: "destructive" })
    }
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.symbol || !formData.quantity || !formData.avgBuyPrice) return;
    
    addMutation.mutate({
      data: {
        symbol: formData.symbol.toUpperCase(),
        quantity: Number(formData.quantity),
        avgBuyPrice: Number(formData.avgBuyPrice),
        buyDate: new Date(formData.buyDate).toISOString()
      }
    });
  };

  const pnlColor = (val: number) => {
    if (val > 0) return "text-success";
    if (val < 0) return "text-destructive";
    return "text-muted-foreground";
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Portfolio</h1>
          <p className="text-muted-foreground mt-1">Manage and track your holdings.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-md shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Add Holding
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Holding</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="symbol">Stock Symbol</Label>
                <Input 
                  id="symbol" 
                  placeholder="e.g. RELIANCE" 
                  value={formData.symbol}
                  onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input 
                    id="quantity" 
                    type="number" 
                    min="1" 
                    placeholder="100" 
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Avg Buy Price</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    placeholder="2500.00" 
                    value={formData.avgBuyPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, avgBuyPrice: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Buy Date</Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={formData.buyDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, buyDate: e.target.value }))}
                  required
                />
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" disabled={addMutation.isPending} className="w-full">
                  {addMutation.isPending ? "Adding..." : "Add Holding"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Value</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-2xl font-bold font-mono">
                {summary ? formatCurrency(summary.currentValue) : '₹0.00'}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Invested</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-2xl font-bold font-mono">
                {summary ? formatCurrency(summary.totalInvested) : '₹0.00'}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total P&L</CardTitle>
            {summary && summary.totalPnl >= 0 ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? <Skeleton className="h-8 w-32" /> : (
              <div className={`text-2xl font-bold font-mono flex items-baseline gap-2 ${summary ? pnlColor(summary.totalPnl) : ''}`}>
                {summary ? formatCurrency(summary.totalPnl) : '₹0.00'}
                {summary && (
                  <span className="text-sm font-medium">
                    ({formatPercentage(summary.totalPnlPercent)})
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-primary">Holdings Count</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? <Skeleton className="h-8 w-12" /> : (
              <div className="text-2xl font-bold font-mono text-foreground">
                {summary?.holdingsCount || 0}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Holdings Table */}
      <div className="border border-border/50 rounded-lg bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Avg Price</TableHead>
              <TableHead className="text-right">LTP</TableHead>
              <TableHead className="text-right">Inv. Value</TableHead>
              <TableHead className="text-right">Cur. Value</TableHead>
              <TableHead className="text-right">P&L</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingHoldings ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : holdings?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-48 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <Wallet className="h-10 w-10 text-muted-foreground/30" />
                    <p>No holdings added yet.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              holdings?.map((holding) => (
                <TableRow key={holding.id} className="group hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <div>
                      <Link href={`/stocks/${holding.symbol}`} className="font-bold text-foreground hover:text-primary transition-colors">
                        {holding.symbol}
                      </Link>
                      <div className="text-xs text-muted-foreground truncate max-w-[150px]">{holding.name}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">{formatNumber(holding.quantity)}</TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">{formatCurrency(holding.avgBuyPrice)}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(holding.currentPrice)}</TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">{formatCurrency(holding.investedValue)}</TableCell>
                  <TableCell className="text-right font-mono font-medium">{formatCurrency(holding.currentValue)}</TableCell>
                  <TableCell className="text-right">
                    <div className={`font-mono font-medium ${pnlColor(holding.pnl)}`}>
                      {formatCurrency(holding.pnl)}
                      <div className="text-xs">{formatPercentage(holding.pnlPercent)}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (confirm(`Remove ${holding.symbol} from portfolio?`)) {
                            deleteMutation.mutate({ id: holding.id });
                          }
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
