import Link from "next/link";

/* ─────────────────────────────────────────────
   Dashboard mock component for the hero
   ───────────────────────────────────────────── */
function DashboardMock() {
  const monitors = [
    {
      name: "api.myproject.io",
      status: "up" as const,
      responseTime: "142ms",
      uptime: "99.98%",
    },
    {
      name: "myproject.io",
      status: "up" as const,
      responseTime: "89ms",
      uptime: "100%",
    },
    {
      name: "staging.myproject.io",
      status: "down" as const,
      responseTime: "—",
      uptime: "97.2%",
    },
  ];

  // 24 bars representing uptime checks over the last 24 hours
  const uptimeBars = [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 0.97, 1, 1, 1, 1, 1, 1, 0, 0.5, 1, 1, 1, 1,
    1, 1,
  ];

  return (
    <div className="w-full max-w-md mx-auto lg:mx-0">
      <div className="animate-float">
      <div className="rounded-xl border border-border bg-surface p-1 shadow-2xl shadow-black/40">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          <span className="ml-2 text-xs text-muted font-mono">
            devpulse / monitors
          </span>
        </div>

        {/* Monitor rows */}
        <div className="p-3 space-y-2">
          {monitors.map((m) => (
            <div
              key={m.name}
              className="flex items-center justify-between rounded-lg bg-surface-raised px-4 py-3 border border-border-subtle"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase ${
                    m.status === "up"
                      ? "bg-accent-muted text-accent"
                      : "bg-danger-muted text-danger"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      m.status === "up"
                        ? "bg-accent animate-pulse-dot"
                        : "bg-danger"
                    }`}
                  />
                  {m.status}
                </span>
                <span className="font-mono text-sm text-foreground truncate">
                  {m.name}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                <span>{m.responseTime}</span>
                <span className="hidden sm:inline">{m.uptime}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Uptime bar chart */}
        <div className="px-4 pb-4">
          <div className="flex items-end gap-[3px] h-8">
            {uptimeBars.map((val, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm animate-bar-grow"
                style={{
                  height: `${val * 100}%`,
                  backgroundColor:
                    val === 1
                      ? "var(--accent)"
                      : val === 0
                      ? "var(--danger)"
                      : "#f59e0b",
                  opacity: 0.7,
                  animationDelay: `${i * 40}ms`,
                }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1.5 text-[10px] text-muted">
            <span>24h ago</span>
            <span>now</span>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Step card for "How it works"
   ───────────────────────────────────────────── */
function StepCard({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="card-hover group relative rounded-xl border border-border-subtle bg-surface p-6 lg:p-8">
      <div className="flex items-start gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-muted text-accent font-mono text-sm font-bold">
          {number}
        </span>
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1.5">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Differentiator card for "What makes it different"
   ───────────────────────────────────────────── */
function DiffCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="card-hover rounded-xl border border-border-subtle bg-surface p-6 lg:p-8">
      <div className="flex items-start gap-4">
        <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-muted">
          <svg
            viewBox="0 0 12 12"
            className="w-3 h-3 text-accent"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 6l3 3 5-5" />
          </svg>
        </span>
        <div>
          <h3 className="text-base font-semibold text-foreground mb-1">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Pricing card
   ───────────────────────────────────────────── */
function PricingCard({
  tier,
  price,
  label,
  features,
  highlighted,
}: {
  tier: string;
  price: string;
  label: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <div
      className={`card-hover relative rounded-xl border p-8 lg:p-10 ${
        highlighted
          ? "border-accent/30 bg-accent-glow"
          : "border-border-subtle bg-surface"
      }`}
    >
      {highlighted && (
        <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-0.5 text-xs font-semibold text-background">
          Most popular
        </span>
      )}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-foreground">{tier}</h3>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-4xl font-bold text-foreground">{price}</span>
          {price !== "Free" && (
            <span className="text-sm text-muted-foreground">/month</span>
          )}
        </div>
        <p className="mt-2 text-sm text-accent font-medium">{label}</p>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
            <svg
              viewBox="0 0 12 12"
              className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 6l3 3 5-5" />
            </svg>
            {f}
          </li>
        ))}
      </ul>
      <Link
        href="/signup"
        className={`block w-full text-center rounded-lg py-3 text-sm font-semibold transition-colors ${
          highlighted
            ? "bg-accent text-background hover:bg-accent-hover cta-glow"
            : "border border-border bg-surface-raised text-foreground hover:bg-surface hover:border-accent/30"
        }`}
      >
        {highlighted ? "Start monitoring free" : "Get started"}
      </Link>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Logo
   ───────────────────────────────────────────── */
function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <div className="relative flex items-center justify-center w-8 h-8">
        <div className="absolute inset-0 rounded-lg bg-accent/10 group-hover:bg-accent/15 transition-colors" />
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 text-accent relative z-10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      </div>
      <span className="font-semibold text-lg tracking-tight text-foreground">
        DevPulse
      </span>
    </Link>
  );
}

/* ═════════════════════════════════════════════
   Main landing page
   ═════════════════════════════════════════════ */
export default function Home() {
  return (
    <>
      {/* ─── Nav ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border-subtle">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <Logo />
          <div className="flex items-center gap-4">
            <Link
              href="/signup"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-background hover:bg-accent-hover transition-colors cta-glow"
            >
              Start monitoring free
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* ─── 1. Hero ─── */}
        <section
          id="hero"
          className="hero-gradient relative pt-32 pb-20 lg:pt-44 lg:pb-32"
        >
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16">
              {/* Copy */}
              <div className="flex-1 max-w-2xl">
                <h1 className="animate-fade-in-up text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight text-foreground">
                  Know the moment your project goes down.{" "}
                  <span className="text-muted">Not hours later.</span>
                </h1>
                <p className="animate-fade-in-up-delay-1 mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl">
                  Uptime monitoring built for solo developers — simple to set
                  up, and free to use even once you&apos;re making money.
                </p>
                <div className="animate-fade-in-up-delay-2 mt-10 flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center rounded-lg bg-accent px-6 py-3.5 text-base font-semibold text-background hover:bg-accent-hover transition-colors cta-glow"
                  >
                    Start monitoring free
                    <svg
                      viewBox="0 0 16 16"
                      className="w-4 h-4 ml-2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 8h10M9 4l4 4-4 4" />
                    </svg>
                  </Link>
                  <span className="self-center text-sm text-muted">
                    No credit card required
                  </span>
                </div>
              </div>

              {/* Dashboard mock */}
              <div className="mt-12 lg:mt-0 flex-1">
                <DashboardMock />
              </div>
            </div>
          </div>
        </section>

        {/* ─── 2. The problem ─── */}
        <section id="problem" className="py-20 lg:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <div className="section-divider mb-16" />
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                You already know how this goes
              </h2>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                You ship a project. It goes down. You find out from a user —
                hours later — not from a tool. By then, real people already
                hit a broken page.
              </p>
            </div>
          </div>
        </section>

        {/* ─── 3. Why existing tools don't fit ─── */}
        <section id="why" className="py-20 lg:py-28 bg-surface/50">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl mx-auto text-center mb-14">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                Why existing tools don&apos;t fit
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <div className="rounded-xl border border-border-subtle bg-surface p-6 lg:p-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger-muted mb-4">
                  <svg
                    viewBox="0 0 16 16"
                    className="w-5 h-5 text-danger"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M8 3v5M8 11h.01" />
                    <circle cx="8" cy="8" r="7" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  Free plans with fine print
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Popular free monitoring tools stopped allowing commercial use
                  in 2024. If your side project makes any money, you&apos;re
                  in violation.
                </p>
              </div>
              <div className="rounded-xl border border-border-subtle bg-surface p-6 lg:p-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger-muted mb-4">
                  <svg
                    viewBox="0 0 16 16"
                    className="w-5 h-5 text-danger"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 4h8v8H4z" />
                    <path d="M1 1h4v4H1zM11 1h4v4H1zM1 11h4v4H1zM11 11h4v4h-4z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  Built for teams, not you
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Everything else is priced and designed for teams with
                  on-call rotations, incident management, and dashboards
                  you&apos;ll never need. You&apos;re one person, shipping
                  alone.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 4. How it works ─── */}
        <section id="how-it-works" className="py-20 lg:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl mx-auto text-center mb-14">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                How it works
              </h2>
              <p className="mt-4 text-muted-foreground">
                Three steps. Under a minute.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <StepCard
                number={1}
                title="Add your URL"
                description="Paste your project's URL. That's all the setup there is."
              />
              <StepCard
                number={2}
                title="We check it automatically"
                description="Your endpoint gets checked every few minutes, around the clock, from multiple locations."
              />
              <StepCard
                number={3}
                title="Get a clear email alert"
                description="The moment something breaks, you get a plain-language email — not a status code with no context."
              />
            </div>
          </div>
        </section>

        {/* ─── 5. What makes it different ─── */}
        <section id="different" className="py-20 lg:py-28 bg-surface/50">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl mx-auto text-center mb-14">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                What makes it different
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <DiffCard
                title="Free tier, no commercial-use catch"
                description="Use it even after your project starts making money. No sudden policy changes, no gotchas."
              />
              <DiffCard
                title="Built only for solo developers"
                description="No bloated team features, no on-call rotations, no role-based access. Just monitoring."
              />
              <DiffCard
                title="Clear, plain-language alerts"
                description="You'll know exactly what happened and when — not just a status code dumped into your inbox."
              />
            </div>
          </div>
        </section>

        {/* ─── 6. Pricing ─── */}
        <section id="pricing" className="py-20 lg:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl mx-auto text-center mb-14">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                Simple pricing
              </h2>
              <p className="mt-4 text-muted-foreground">
                Start free. Upgrade only when you need more.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              <PricingCard
                tier="Free"
                price="Free"
                label="Free forever, commercial use included."
                highlighted={true}
                features={[
                  "Up to 3 monitors",
                  "Checks every 5 minutes",
                  "Email alerts",
                  "24-hour incident history",
                  "No credit card required",
                ]}
              />
              <PricingCard
                tier="Pro"
                price="$9"
                label="For when your projects grow."
                features={[
                  "Up to 20 monitors",
                  "Checks every 60 seconds",
                  "Email + webhook alerts",
                  "90-day incident history",
                  "Response time graphs",
                  "Priority support",
                ]}
              />
            </div>
          </div>
        </section>

        {/* ─── 7. Final CTA ─── */}
        <section id="final-cta" className="py-20 lg:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <div className="section-divider mb-16" />
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight leading-tight">
                Stop finding out from your users.{" "}
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
                  className="inline-flex items-center justify-center rounded-lg bg-accent px-8 py-4 text-base font-semibold text-background hover:bg-accent-hover transition-colors cta-glow"
                >
                  Start monitoring free
                  <svg
                    viewBox="0 0 16 16"
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ─── 8. Footer ─── */}
      <footer className="border-t border-border-subtle py-10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <Logo />
            <div className="flex items-center gap-6 text-sm text-muted">
              <Link
                href="#how-it-works"
                className="hover:text-foreground transition-colors"
              >
                How it works
              </Link>
              <Link
                href="#pricing"
                className="hover:text-foreground transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="mailto:hello@devpulse.dev"
                className="hover:text-foreground transition-colors"
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
