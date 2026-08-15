import { SiteFooter } from "./site-footer";
import { SiteNav } from "./site-nav";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col bg-background overflow-hidden">
      <div className="page-subtle-visual pointer-events-none" aria-hidden="true" />
      <div className="page-subtle-fade pointer-events-none" aria-hidden="true" />
      <SiteNav />
      <main className="relative z-10 flex-1 flex flex-col">{children}</main>
      <SiteFooter />
    </div>
  );
}
