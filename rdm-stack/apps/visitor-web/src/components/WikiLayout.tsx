import { ReactNode } from "react";
import { WikiSidebar } from "./WikiSidebar";
import { WikiSearch } from "./WikiSearch";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";

interface WikiLayoutProps {
  children: ReactNode;
}

export function WikiLayout({ children }: WikiLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <WikiSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-30 px-4 gap-3">
            <SidebarTrigger className="text-muted-foreground hover:text-primary">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <div className="flex items-center gap-2">
              <span className="text-primary font-bold text-lg tracking-tight">TAMV</span>
              <span className="text-muted-foreground text-sm">MD‑X4™ Wiki</span>
            </div>
            <div className="ml-auto">
              <WikiSearch />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
