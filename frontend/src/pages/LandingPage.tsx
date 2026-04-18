import { Button } from "@/components/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import {
  FEATURED_SOLUTIONS,
  HOW_WE_DO_STEPS,
  PROBLEM_BLOCKS,
  SOLUTIONS_COUNT,
  WHAT_WE_DO_BLOCKS,
} from "@/content/siteContent";
import { ArrowRight, CheckCircle2, ShieldCheck, Workflow } from "lucide-react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <SiteLayout>
      <section className="mx-auto mt-10 w-full max-w-7xl px-6 md:mt-16">
        <div className="glass-card relative overflow-hidden rounded-[2rem] p-8 md:p-12">
          <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-primary/20 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-cyan-200/50 blur-3xl" aria-hidden="true" />

          <div className="relative z-10 max-w-3xl space-y-6">
            <p className="eyebrow">Landing Narrative</p>
            <h1 className="display-title text-balance">
              From screening uncertainty to confident stone-focused care orchestration.
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              This landing experience is designed for high-stakes demos: clear hero, concrete problem framing,
              credible operating model, and direct paths into solution pages.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="rounded-full px-7">
                <Link to="/solutions/live-demo-lab">
                  Start Demo Flow
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full bg-white/80 px-7">
                <Link to="/solutions">Explore {SOLUTIONS_COUNT} Pages</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-16 w-full max-w-7xl px-6">
        <div className="section-title-wrap">
          <p className="eyebrow">The Problem</p>
          <h2 className="section-title">Clinical urgency and operational scale rarely move together.</h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {PROBLEM_BLOCKS.map((problem) => (
            <article key={problem.title} className="glass-card rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-foreground">{problem.title}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">{problem.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 w-full max-w-7xl px-6">
        <div className="section-title-wrap">
          <p className="eyebrow">What We Do</p>
          <h2 className="section-title">Turn probabilistic AI output into dependable action language.</h2>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {WHAT_WE_DO_BLOCKS.map((item) => (
            <article key={item.title} className="glass-card rounded-3xl p-6">
              <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
                Core capability
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 w-full max-w-7xl px-6">
        <div className="section-title-wrap">
          <p className="eyebrow">How We Do It</p>
          <h2 className="section-title">Three operational layers keep the system production oriented.</h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {HOW_WE_DO_STEPS.map((step) => (
            <article key={step.title} className="glass-card rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">{step.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 w-full max-w-7xl px-6">
        <div className="grid gap-5 lg:grid-cols-3">
          <article className="glass-card rounded-3xl p-6">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h3 className="mt-4 text-xl font-semibold text-foreground">Governance Confidence</h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Deterministic endpoint behavior, explicit thresholds, and readiness checks strengthen operational trust.
            </p>
          </article>
          <article className="glass-card rounded-3xl p-6">
            <Workflow className="h-6 w-6 text-primary" />
            <h3 className="mt-4 text-xl font-semibold text-foreground">Workflow Compatibility</h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Stone versus non-stone decisioning keeps integration simpler while preserving transparent context.
            </p>
          </article>
          <article className="glass-card rounded-3xl p-6">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            <h3 className="mt-4 text-xl font-semibold text-foreground">Demo Reliability</h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Production-style serving and smoke-tested behavior make stakeholder demos smoother and more credible.
            </p>
          </article>
        </div>
      </section>

      <section className="mx-auto mt-16 w-full max-w-7xl px-6 pb-8">
        <div className="glass-card rounded-3xl p-8 md:p-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Continue The Story</p>
              <h2 className="section-title">Jump into focused pages by clinical or operational context.</h2>
            </div>
            <Button asChild variant="outline" className="rounded-full bg-white/80">
              <Link to="/solutions">Open full page index</Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {FEATURED_SOLUTIONS.map((page) => (
              <article key={page.slug} className="rounded-2xl border border-white/45 bg-white/65 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">{page.category}</p>
                <h3 className="mt-2 text-lg font-semibold text-foreground">{page.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{page.summary}</p>
                <Button asChild variant="link" className="mt-3 h-auto p-0 text-primary">
                  <Link to={`/solutions/${page.slug}`}>
                    Explore detail
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </article>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default LandingPage;
