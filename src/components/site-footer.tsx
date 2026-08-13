import Link from "next/link";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-border py-12 bg-surface text-center sm:text-left">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <Logo />
          <div className="flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="/#pricing" className="hover:text-heading transition-colors">
              Pricing
            </Link>
            <Link href="#" className="hover:text-heading transition-colors">
              Docs
            </Link>
            <Link
              href="mailto:hello@downalert.dev"
              className="hover:text-heading transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
