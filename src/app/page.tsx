import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";

function CheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8l4 4 6-6" />
    </svg>
  );
}

function ArrowRight({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

function StepCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="premium-card card-lift p-8 flex flex-col items-start gap-5">
      <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-background border border-border text-heading">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-heading mb-2">{title}</h3>
        <p className="text-sm text-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function PricingCard({
  tier,
  price,
  period,
  features,
}: {
  tier: string;
  price: string;
  period?: string;
  features: string[];
}) {
  return (
    <div className="premium-card card-lift p-8 lg:p-12">
      <h3 className="text-xl font-semibold text-heading">{tier}</h3>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="font-serif text-4xl font-medium text-heading">{price}</span>
        {period && (
          <span className="text-sm text-muted-foreground">{period}</span>
        )}
      </div>
      <ul className="mt-8 space-y-4">
        {features.map((f) => (
          <li
            key={f}
            className="flex items-start gap-3 text-sm text-foreground"
          >
            <CheckIcon className="w-4 h-4 text-accent mt-0.5 shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      <Link
        href="/signup"
        className="mt-10 flex w-full justify-center rounded-full border border-border py-3.5 text-sm font-semibold text-heading hover:bg-background transition-colors"
      >
        Get started
      </Link>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <section className="relative min-h-screen flex flex-col bg-background overflow-hidden">
        <div className="hero-abstract-visual pointer-events-none" aria-hidden="true" />
        <div className="hero-visual-fade" aria-hidden="true" />

        <SiteNav />

        <div className="relative z-10 flex-1 flex flex-col items-center justify-start px-6 pb-32 pt-16 lg:pt-20 text-center">
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/95 border border-border px-4 py-1.5 text-xs font-medium text-heading shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
              Free tier includes commercial use
            </span>
          </div>

          <h1 className="font-serif animate-fade-in-up-1 mt-10 max-w-4xl text-5xl sm:text-6xl lg:text-7xl font-medium leading-[1.1] tracking-tight text-heading">
            Know when it&apos;s down.
            <br />
            <em className="italic font-normal">Not hours later.</em>
          </h1>

          <p className="animate-fade-in-up-2 mt-8 max-w-2xl text-lg sm:text-xl text-foreground leading-relaxed">
            Uptime monitoring built for solo developers — simple to set up, free
            even once you&apos;re making money.
          </p>

          <div className="animate-fade-in-up-3 mt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/signup" className="btn-primary px-8 py-4 text-base">
              Start monitoring free &rarr;
            </Link>
            <Link
              href="#how-it-works"
              className="group flex items-center text-base font-semibold text-heading hover:text-accent transition-colors"
            >
              See how it works
              <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        <div className="animate-fade-in-up-4 absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="flex items-center gap-1.5 rounded-full bg-white/90 border border-border backdrop-blur-sm animate-bounce-down text-heading px-4 py-2 text-xs font-medium shadow-sm">
            Scroll
            <svg
              viewBox="0 0 16 16"
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 6l4 4 4-4" />
            </svg>
          </div>
        </div>
      </section>

      <main className="flex-1 bg-background relative z-20">
        <section id="how-it-works" className="py-28 lg:py-36 bg-surface">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="font-serif text-center text-3xl sm:text-4xl font-medium text-heading tracking-tight mb-16 lg:mb-20">
              How it works
            </h2>
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              <StepCard
                title="Add your project's URL"
                description="Paste your endpoint. No SDKs, no complex configuration."
                icon={
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                  </svg>
                }
              />
              <StepCard
                title="We check it automatically, every few minutes"
                description="Your site gets checked around the clock — no cron jobs to manage."
                icon={
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                }
              />
              <StepCard
                title="Get a clear email the moment something breaks"
                description="Plain-language alerts tell you exactly what happened and when."
                icon={
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                }
              />
            </div>
          </div>
        </section>

        <section id="why" className="py-28 lg:py-36 bg-background">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-heading tracking-tight mb-14">
              Why DownAlert
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="premium-card p-8">
                <h3 className="text-lg font-semibold text-heading mb-2">
                  Free tier, no commercial-use catch
                </h3>
                <p className="text-foreground leading-relaxed">
                  Most tools ban commercial use on free plans. We don&apos;t. Use it even after your side project starts making money.
                </p>
              </div>
              <div className="premium-card p-8">
                <h3 className="text-lg font-semibold text-heading mb-2">
                  Built only for solo developers
                </h3>
                <p className="text-foreground leading-relaxed">
                  Everything else is priced and designed for teams with on-call rotations. DownAlert is just for you.
                </p>
              </div>
              <div className="premium-card p-8 sm:col-span-2">
                <h3 className="text-lg font-semibold text-heading mb-2">
                  Plain-language alerts, not just a status code
                </h3>
                <p className="text-foreground leading-relaxed">
                  You&apos;ll know exactly what happened and when — not just a status code dumped into your inbox.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-28 lg:py-36 bg-surface border-y border-border">
          <div className="mx-auto max-w-4xl px-6">
            <div className="text-center mb-16 lg:mb-20">
              <h2 className="font-serif text-3xl sm:text-4xl font-medium text-heading tracking-tight">
                Simple pricing
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <PricingCard
                tier="Free"
                price="$0"
                features={[
                  "Up to 3 monitors",
                  "Checks every 5 minutes",
                  "Email alerts",
                  "Commercial use included",
                ]}
              />
              <PricingCard
                tier="Pro"
                price="$9"
                period="/month"
                features={[
                  "Up to 20 monitors",
                  "Checks every 60 seconds",
                  "Email + webhook alerts",
                  "90-day incident history",
                ]}
              />
            </div>
          </div>
        </section>

        <section className="py-32 lg:py-40 bg-background">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="font-serif text-4xl lg:text-5xl font-medium text-heading tracking-tight leading-[1.15]">
              Stop finding out from your users. Start monitoring free.
            </h2>
            <div className="mt-10">
              <Link href="/signup" className="btn-primary px-10 py-5 text-lg">
                Start monitoring free
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
