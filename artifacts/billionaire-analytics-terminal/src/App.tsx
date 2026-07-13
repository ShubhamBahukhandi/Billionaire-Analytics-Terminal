import React from "react";
import { Route, Switch, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/layout";

import Dashboard from "@/pages/dashboard";
import Watchlist from "@/pages/watchlist";
import Portfolio from "@/pages/portfolio";
import News from "@/pages/news";
import StockDetail from "@/pages/stock-detail";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60000,
    },
  },
});

function NotFound() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-4">
      <h1 className="text-4xl font-bold tracking-tight">404</h1>
      <p className="text-muted-foreground">Resource not found</p>
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/watchlist" component={Watchlist} />
        <Route path="/portfolio" component={Portfolio} />
        <Route path="/news" component={News} />
        <Route path="/stocks/:symbol" component={StockDetail} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
