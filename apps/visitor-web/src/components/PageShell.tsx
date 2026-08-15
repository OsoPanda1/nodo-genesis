import type { ReactNode } from "react";

export function PageShell({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="min-h-screen w-full">
      {title && (
        <div className="container mx-auto px-4 py-6">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        </div>
      )}
      <main className="container mx-auto px-4">{children}</main>
    </div>
  );
}
