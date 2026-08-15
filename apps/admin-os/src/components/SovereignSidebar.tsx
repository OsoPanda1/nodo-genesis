import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Map,
  LayoutDashboard,
  Compass,
  Store,
  History,
  Activity,
  ChevronLeft,
  ChevronRight,
  Mountain,
} from "lucide-react";

interface SovereignSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "explorer", label: "Explorer", icon: Map },
  { id: "routes", label: "Rutas", icon: Compass },
  { id: "commerce", label: "Comercio", icon: Store },
  { id: "heritage", label: "Patrimonio", icon: History },
  { id: "telemetry", label: "Telemetría", icon: Activity },
];

export function SovereignSidebar({ activeView, onViewChange }: SovereignSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="fixed left-0 top-0 h-screen bg-sidebar z-50 flex flex-col border-r border-sidebar-border"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
          <Mountain className="w-4 h-4 text-accent-foreground" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="overflow-hidden"
            >
              <p className="text-sm font-semibold text-sidebar-accent-foreground font-display tracking-tight">RDM Digital</p>
              <p className="text-[10px] text-sidebar-foreground">OS v4.1</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors duration-100 text-sm ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </nav>

      {/* System Status */}
      <div className="px-4 py-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success status-live" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[11px] text-sidebar-foreground"
              >
                Sistema Online
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-sidebar border border-sidebar-border rounded-full flex items-center justify-center text-sidebar-foreground hover:text-sidebar-primary transition-colors"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.aside>
  );
}
