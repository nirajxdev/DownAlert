import Link from "next/link";

/* ═══════════════════════════════════════════════
   DevPulse — Minimal landing page (light, hero-first)
   ═══════════════════════════════════════════════ */

/* ─── Shared SVG icons ─── */
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

/* ─── Logo ─── */
function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <svg
        viewBox="0 0 24 24"
        className={`w-5 h-5 ${light ? "text-heading" : "text-accent"}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
      <span
        className={`font-semibold text-lg tracking-tight ${
          light ? "text-heading" : "text-heading"
        }`}
      >
        DevPulse
      </span>
    </Link>
  );
}

/* ─── Step card ─── */
function StepCard({
  number,
  title,
  description,
  icon,
}: {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="card-lift text-center p-8 rounded-2xl border border-border bg-white">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent-light text-accent mb-5">
        {icon}
      </div>
      <div className="text-xs font-mono text-muted mb-2 tracking-wider uppercase">
        Step {number}
      </div>
      <h3 className="text-lg font-semibold text-heading mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

/* ─── Pricing card ─── */
function PricingCard({
  tier,
  price,
  period,
  badge,
  features,
  primary,
}: {
  tier: string;
  price: string;
  period?: string;
  badge?: string;
  features: string[];
  primary?: boolean;
}) {
  return (
    <div
      className={`card-lift relative rounded-2xl border p-8 lg:p-10 ${
        primary ? "border-accent bg-white shadow-md" : "border-border bg-white"
      }`}
    >
      {badge && (
        <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
          {badge}
        </span>
      )}
      <h3 className="text-lg font-semibold text-heading">{tier}</h3>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-bold text-heading">{price}</span>
        {period && (
          <span className="text-sm text-muted-foreground">{period}</span>
        )}
      </div>
      <ul className="mt-8 space-y-3">
        {features.map((f) => (
          <li
            key={f}
            className="flex items-start gap-2.5 text-sm text-muted-foreground"
          >
            <CheckIcon className="w-4 h-4 text-accent mt-0.5 shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      <Link
        href="/signup"
        className={`mt-8 block w-full text-center rounded-full py-3 text-sm font-semibold transition-all ${
          primary
            ? "bg-heading text-white hover:bg-heading/90"
            : "border border-border text-heading hover:bg-surface"
        }`}
      >
        {primary ? "Start monitoring free" : "Get started"}
      </Link>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Page
   ═══════════════════════════════════════════════ */
export default function Home() {
  return (
    <>
      {/* ────────────────────────────────────────
          HERO (full-bleed mesh gradient)
          ──────────────────────────────────────── */}
      <section className="hero-mesh relative min-h-screen flex flex-col">
        {/* Mesh blob + dot grid */}
        <div className="hero-mesh-blob" />
        <div className="dot-grid" />

        {/* Nav — transparent, over hero */}
        <nav className="relative z-20 w-full">
          <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-5">
            <Logo />

            {/* Nav links — hidden on mobile */}
            <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground font-medium">
              <Link
                href="#how-it-works"
                className="hover:text-heading transition-colors"
              >
                Home
              </Link>
              <Link
                href="#pricing"
                className="hover:text-heading transition-colors"
              >
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
              className="rounded-full bg-heading text-white px-5 py-2.5 text-sm font-semibold hover:bg-heading/90 transition-colors"
            >
              Get started
            </Link>
          </div>
        </nav>

        {/* Hero content — centered */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-24 text-center">
          {/* Badge pill */}
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 backdrop-blur-sm border border-border/60 px-4 py-1.5 text-xs font-medium text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Free tier includes commercial use
            </span>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up-1 mt-8 max-w-3xl text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight text-heading">
            Know when it&apos;s down.
            <br />
            <span className="text-muted">Not hours later.</span>
          </h1>

          {/* Subheadline */}
          <p className="animate-fade-in-up-2 mt-6 max-w-xl text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Uptime monitoring built for solo developers — simple to set up, free
            even once you&apos;re making money.
          </p>

          {/* CTA row */}
          <div className="animate-fade-in-up-3 mt-10 flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-heading text-white px-7 py-3.5 text-base font-semibold hover:bg-heading/90 transition-colors shadow-lg shadow-heading/10"
            >
              Start monitoring free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground hover:text-heading transition-colors"
            >
              See how it works
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="animate-fade-in-up-4 absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="flex flex-col items-center gap-1.5 text-muted">
            <span className="text-[11px] font-medium tracking-wider uppercase">
              Scroll
            </span>
            <svg
              viewBox="0 0 16 16"
              className="w-4 h-4 animate-bounce-down"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 6l4 4 4-4" />
            </svg>
          </div>
        </div>
      </section>

      <main className="flex-1">
        {/* ────────────────────────────────────────
            HOW IT WORKS — 3 steps
            ──────────────────────────────────────── */}
        <section id="how-it-works" className="py-24 lg:py-32">
          <div className="mx-auto max-w-5xl px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-heading tracking-tight">
                How it works
              </h2>
              <p className="mt-4 text-muted-foreground text-lg">
                Three steps. Under a minute.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <StepCard
                number={1}
                title="Add your URL"
                description="Paste your project's URL. That's all the setup there is."
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                  </svg>
                }
              />
              <StepCard
                number={2}
                title="We check it automatically"
                description="Your endpoint gets checked every few minutes, around the clock."
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                }
              />
              <StepCard
                number={3}
                title="Get a clear email"
                description="The moment something breaks, you get a plain-language email — not a status code."
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                }
              />
            </div>
          </div>
        </section>

        {/* ────────────────────────────────────────
            WHY DEVPULSE — 3 points
            ──────────────────────────────────────── */}
        <section id="why" className="py-24 lg:py-32 bg-surface">
          <div className="mx-auto max-w-3xl px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-heading tracking-tight">
                Why DevPulse
              </h2>
            </div>

            <div className="space-y-8">
              {[
                {
                  title: "Free tier, no commercial-use catch",
                  desc: "Use it even after your project starts making money. No sudden policy changes, no gotchas in the fine print.",
                },
                {
                  title: "Built only for solo developers",
                  desc: "No bloated team dashboard, no on-call rotations, no role-based access. Just monitoring for one person shipping alone.",
                },
                {
                  title: "Plain-language alerts",
                  desc: "You'll know exactly what happened and when — not just a status code dumped into your inbox.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-border"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-light">
                    <CheckIcon className="w-3.5 h-3.5 text-accent" />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-heading">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ────────────────────────────────────────
            PRICING — 2 tiers
            ──────────────────────────────────────── */}
        <section id="pricing" className="py-24 lg:py-32">
          <div className="mx-auto max-w-4xl px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-heading tracking-tight">
                Simple pricing
              </h2>
              <p className="mt-4 text-muted-foreground text-lg">
                Start free. Upgrade when you need more.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              <PricingCard
                tier="Free"
                price="$0"
                badge="Free forever"
                primary
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
                  "Response time graphs",
                ]}
              />
            </div>
          </div>
        </section>

        {/* ────────────────────────────────────────
            FINAL CTA
            ──────────────────────────────────────── */}
        <section className="py-24 lg:py-32 bg-surface">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-heading tracking-tight leading-tight">
              Stop finding out from your users.
              <br className="hidden sm:block" />
              Start monitoring free.
            </h2>
            <p className="mt-6 text-muted-foreground text-lg">
              Takes under a minute. No credit card, no commercial-use
              restrictions.
            </p>
            <div className="mt-10">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-heading text-white px-8 py-4 text-base font-semibold hover:bg-heading/90 transition-colors shadow-lg shadow-heading/10"
              >
                Start monitoring free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ────────────────────────────────────────
          FOOTER
          ──────────────────────────────────────── */}
      <footer className="border-t border-border py-10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <Logo />
            <div className="flex items-center gap-6 text-sm text-muted">
              <Link
                href="#pricing"
                className="hover:text-heading transition-colors"
              >
                Pricing
              </Link>
              <Link href="#" className="hover:text-heading transition-colors">
                Docs
              </Link>
              <Link
                href="mailto:hello@devpulse.dev"
                className="hover:text-heading transition-colors"
              >
                Contact
              </Link>
            </div>
            <p className="text-xs text-muted">
              &copy; {new Date().getFullYear()} DevPulse
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
