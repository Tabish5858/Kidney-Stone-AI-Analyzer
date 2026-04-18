import { Button } from "@/components/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ArrowRight, ShieldCheck, Stethoscope, UploadCloud } from "lucide-react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <SiteLayout>
      <section className="mx-auto mt-10 w-full max-w-7xl px-6 md:mt-14">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-5">
            <p className="eyebrow">Kidney Stone CT Screening</p>
            <h1 className="display-title max-w-3xl text-balance">Upload one scan and get a clear stone signal.</h1>
            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
              This interface is intentionally minimal: a focused analyzer page, deterministic output, and no extra narrative overhead.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="rounded-full px-7">
                <Link to="/analyzer">
                  Open Analyzer
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <article className="glass-card rounded-3xl p-6 md:p-8">
            <h2 className="text-xl font-semibold text-foreground">What You Get</h2>
            <div className="mt-5 space-y-3">
              <div className="flex items-start gap-3 rounded-2xl border border-white/45 bg-white/70 p-4">
                <UploadCloud className="mt-0.5 h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">Fast image upload with clear file validation.</p>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-white/45 bg-white/70 p-4">
                <Stethoscope className="mt-0.5 h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">Stone vs non-stone decision with probability and threshold.</p>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-white/45 bg-white/70 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">Stable API-backed behavior for demos and local testing.</p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto mt-12 w-full max-w-7xl px-6 pb-8">
        <div className="glass-card rounded-3xl p-6 md:p-8">
          <h2 className="section-title">Workflow</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            1. Open analyzer. 2. Upload CT image. 3. Run detection. 4. Read stone signal and confidence context.
          </p>
          <Button asChild variant="outline" className="mt-5 rounded-full bg-white/80">
            <Link to="/analyzer">Go to analyzer</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
};

export default HomePage;
