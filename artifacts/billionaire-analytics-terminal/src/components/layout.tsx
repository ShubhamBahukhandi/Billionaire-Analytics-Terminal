import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useListStocks } from "@workspace/api-client-react";
import {
  LineChart,
  Wallet,
  Star,
  Newspaper,
  Search,
  Terminal,
  ChevronRight,
  TrendingUp,
  Activity,
  Menu,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchResults, isLoading: isSearchLoading } = useListStocks(
    { query: debouncedQuery, limit: 10 },
    { query: { enabled: debouncedQuery.length > 1 } }
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const navItems = [
    { href: "/", label: "Dashboard", icon: Activity },
    { href: "/portfolio", label: "Portfolio", icon: Wallet },
    { href: "/watchlist", label: "Watchlist", icon: Star },
    { href: "/news", label: "Market News", icon: Newspaper },
  ];

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary/30">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-sidebar transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center px-6 border-b border-border">
          <Terminal className="h-6 w-6 text-primary mr-3" />
          <span className="text-lg font-bold tracking-tight text-sidebar-foreground">
            Billionaire<span className="text-primary">Terminal</span>
          </span>
        </div>
        
        <div className="px-4 py-6">
          <div className="mb-4 px-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Platform
          </div>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const active = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`flex cursor-pointer items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? "bg-sidebar-accent text-primary"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={`mr-3 h-4 w-4 ${
                        active ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 lg:px-8">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden mr-2"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              className="relative h-9 w-full justify-start rounded-md bg-muted/50 text-sm text-muted-foreground sm:pr-12 md:w-64 lg:w-80"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="mr-2 h-4 w-4" />
              <span className="hidden lg:inline-flex">Search symbols or companies...</span>
              <span className="inline-flex lg:hidden">Search...</span>
              <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse"></span>
              <span className="hidden sm:inline-block">NSE/BSE Connected</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background/50">
          {children}
        </main>
      </div>

      {/* Global Search Dialog */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput
          placeholder="Search for a stock..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          {isSearchLoading && <CommandEmpty>Searching markets...</CommandEmpty>}
          {!isSearchLoading && debouncedQuery.length > 0 && searchResults?.length === 0 && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}
          
          {searchResults && searchResults.length > 0 && (
            <CommandGroup heading="Stocks">
              {searchResults.map((stock) => (
                <CommandItem
                  key={stock.symbol}
                  value={`${stock.symbol} ${stock.name}`}
                  onSelect={() => {
                    setLocation(`/stocks/${stock.symbol}`);
                    setSearchOpen(false);
                  }}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground">{stock.symbol}</span>
                    <span className="text-xs text-muted-foreground">{stock.name}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-mono text-sm">{stock.price.toFixed(2)}</span>
                    <span
                      className={`text-xs font-mono ${
                        stock.changePercent >= 0 ? "text-success" : "text-destructive"
                      }`}
                    >
                      {stock.changePercent >= 0 ? "+" : ""}
                      {stock.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </div>
  );
}
