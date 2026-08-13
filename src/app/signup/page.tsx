import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { LogoIcon } from "@/components/logo";

export default function SignupPage() {
  return (
    <PageShell>
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 lg:py-28">
        <div className="premium-card max-w-md w-full p-10 lg:p-12 text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-heading text-white mx-auto mb-8">
            <LogoIcon className="w-5 h-5" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-heading tracking-tight">
            Coming soon
          </h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            DownAlert is not open for signups yet. We&apos;re building it right
            now. Check back soon.
          </p>
          <Link
            href="/"
            className="btn-primary mt-10 px-8 py-3.5 text-sm gap-2"
          >
            <svg
              viewBox="0 0 16 16"
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 8H3M7 4L3 8l4 4" />
            </svg>
            Back to home
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
