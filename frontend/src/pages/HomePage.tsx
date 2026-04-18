import { Button } from "@/components/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import {
  FEATURED_SOLUTIONS,
  HOW_WE_DO_STEPS,
  PROBLEM_BLOCKS,
  SITE_METRICS,
  SOLUTIONS_COUNT,
  WHAT_WE_DO_BLOCKS,
} from "@/content/siteContent";
import { ArrowRight, Compass, Layers, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <SiteLayout>
      <section className="mx-auto mt-10 w-full max-w-7xl px-6 md:mt-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <p className="eyebrow">Stone Detection Experience Platform</p>
            <h1 className="display-title max-w-2xl text-balance">
              Minimal interface, strong clinical signal, enterprise-ready storytelling.
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Build trust quickly with a landing experience that explains the problem, demonstrates the solution,
              and guides stakeholders through 34 focused workflow pages.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="rounded-full px-7">
                <Link to="/landing">
                  Start Landing Narrative
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full bg-white/75 px-7">
                <Link to="/solutions">Explore All Solutions</Link>
              </Button>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 md:p-8">
            <h2 className="text-xl font-semibold text-foreground">Signal At A Glance</h2>
            <div className="mt-5 grid grid-cols-2 gap-4">
              {SITE_METRICS.map((metric) => (
                <article key={metric.label} className="rounded-2xl border border-white/45 bg-white/70 p-4">
                  <p className="text-2xl font-semibold text-foreground">{metric.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{metric.label}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-16 w-full max-w-7xl px-6">
        <div className="section-title-wrap">
          <p className="eyebrow">Problem We Solve</p>
          <h2 className="section-title">Operational drag and clinical uncertainty in stone workflows.</h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {PROBLEM_BLOCKS.map((block) => (
            <article key={block.title} className="glass-card rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-foreground">{block.title}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">{block.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 w-full max-w-7xl px-6">
        <div className="section-title-wrap">
          <p className="eyebrow">What We Do</p>
          <h2 className="section-title">Translate model output into decisions teams can act on immediately.</h2>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {WHAT_WE_DO_BLOCKS.map((block) => (
            <article key={block.title} className="glass-card rounded-3xl p-6">
              <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
                Capability
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{block.title}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">{block.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 w-full max-w-7xl px-6">
        <div className="section-title-wrap">
          <p className="eyebrow">How We Do It</p>
          <h2 className="section-title">A deterministic path from upload to decision-ready output.</h2>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {HOW_WE_DO_STEPS.map((step) => (
            <article key={step.title} className="glass-card rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">{step.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 w-full max-w-7xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Multi-Page Product Story</p>
            <h2 className="section-title">{SOLUTIONS_COUNT} focused pages, one consistent design language.</h2>
          </div>
          <Button asChild variant="outline" className="rounded-full bg-white/80">
            <Link to="/solutions">
              View all pages
              <Compass className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {FEATURED_SOLUTIONS.map((page) => (
            <article key={page.slug} className="glass-card rounded-3xl p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary/90">{page.category}</p>
              <h3 className="mt-3 text-xl font-semibold text-foreground">{page.title}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">{page.summary}</p>
              <Button asChild variant="link" className="mt-4 h-auto p-0 text-primary">
                <Link to={`/solutions/${page.slug}`}>
                  Open page
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 w-full max-w-7xl px-6 pb-8">
        <div className="glass-card rounded-3xl p-8 md:p-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow">Ready for Demo</p>
              <h2 className="section-title">Present a cleaner story than a plain dashboard.</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                Lead your supervisor through narrative context, workflow depth, and production-ready confidence signals.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="rounded-full">
                <Link to="/solutions/live-demo-lab">
                  Open Demo Lab
                  <Sparkles className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full bg-white/80">
                <Link to="/analyzer">
                  Launch Analyzer
                  <Layers className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default HomePage;
