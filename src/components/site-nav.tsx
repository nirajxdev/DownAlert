import Link from "next/link";
import { Logo } from "./logo";

export function SiteNav() {
  return (
    <div className="relative z-20 w-full px-6 pt-6 flex justify-center">
      <nav className="nav-pill flex items-center justify-between w-full max-w-4xl rounded-full bg-white/90 px-4 py-2">
        <div className="flex items-center pl-1">
          <Logo />
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-foreground font-medium">
          <Link href="/#how-it-works" className="hover:text-heading transition-colors">
            Home
          </Link>
          <Link href="/#pricing" className="hover:text-heading transition-colors">
            Pricing
          </Link>
          <Link href="#" className="hover:text-heading transition-colors">
            Docs
          </Link>
          <Link href="#" className="hover:text-heading transition-colors">
            Login
          </Link>
        </div>

        <Link
          href="/signup"
          className="btn-primary px-5 py-2.5 text-sm"
        >
          Get started
        </Link>
      </nav>
    </div>
  );
}
