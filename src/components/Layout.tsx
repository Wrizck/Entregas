import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/src/utils";
import {
  LayoutDashboard, Truck, Users, BarChart2,
  Settings as SettingsIcon, Package, Menu, ArrowLeft, Clock,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { AnimatePresence, motion } from "motion/react";

import DashboardPage from "@/src/pages/Dashboard";
import DeliveriesPage from "@/src/pages/Deliveries";
import CustomersPage from "@/src/pages/Customers";
import FinancialReportPage from "@/src/pages/FinancialReport";
import PendingPage from "@/src/pages/Pending";
import SettingsPage from "@/src/pages/Settings";

const navItems = [
  { name: "Dashboard",             page: "Dashboard",       icon: LayoutDashboard },
  { name: "Entregas",              page: "Deliveries",      icon: Truck },
  { name: "Clientes",              page: "Customers",       icon: Users },
  { name: "Pendentes",             page: "Pending",         icon: Clock },
  { name: "Relatório Financeiro",  page: "FinancialReport", icon: BarChart2 },
  { name: "Configurações",         page: "Settings",        icon: SettingsIcon },
];

const bottomNavItems = [
  { name: "Dashboard", page: "Dashboard",       icon: LayoutDashboard,  Component: DashboardPage },
  { name: "Entregas",  page: "Deliveries",      icon: Truck,            Component: DeliveriesPage },
  { name: "Pendentes", page: "Pending",         icon: Clock,            Component: PendingPage },
  { name: "Clientes",  page: "Customers",       icon: Users,            Component: CustomersPage },
  { name: "Config",    page: "Settings",        icon: SettingsIcon,     Component: SettingsPage },
];

export default function Layout({ children, currentPageName }: { children?: React.ReactNode, currentPageName: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Auto-sync system dark mode
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = (e: MediaQueryListEvent | MediaQueryList) => document.documentElement.classList.toggle("dark", e.matches);
    apply(mq);
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const isTabPage = bottomNavItems.some((i) => i.page === currentPageName);
  const currentNav = navItems.find((i) => i.page === currentPageName);

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar – desktop always visible, mobile slide-in */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-card border-r border-border
          transform transition-transform duration-300 ease-out flex flex-col shrink-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div
          className="p-6 border-b border-border"
          style={{ paddingTop: "max(1.5rem, calc(1.5rem + env(safe-area-inset-top)))" }}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-foreground text-lg leading-tight">CanaFlow</h1>
              <p className="text-xs text-muted-foreground">Controle de Cana</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-200 select-none
                  ${isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }
                `}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header
          className="shrink-0 sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <div className="flex items-center justify-between px-4 lg:px-8 h-14">
            {isTabPage ? (
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden select-none"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="select-none"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}

            <h2 className="text-base font-semibold text-foreground">
              {currentNav?.name || currentPageName}
            </h2>

            {/* Spacer to keep title centred */}
            <div className={isTabPage ? "w-9 lg:hidden" : "w-9"} />
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 relative overflow-hidden min-h-0">
          {/* Tab pages – always mounted; only the active one is visible */}
          {bottomNavItems.map(({ page: pageName, Component }) => (
            <div
              key={pageName}
              className="absolute inset-0 overflow-y-auto p-4 lg:p-8 pb-20 lg:pb-8"
              style={{ display: currentPageName === pageName ? "block" : "none" }}
            >
              <Component />
            </div>
          ))}

          {/* Sub-route (non-tab) pages render children with a slide animation */}
          {!isTabPage && (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentPageName}
                className="absolute inset-0 overflow-y-auto p-4 lg:p-8 pb-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* Bottom Navigation – mobile only */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex">
          {bottomNavItems.map((item) => {
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`
                  flex-1 flex flex-col items-center justify-center py-2 gap-0.5
                  select-none transition-colors duration-200
                  ${isActive ? "text-primary" : "text-muted-foreground"}
                `}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium leading-tight">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
