import { Button } from "@/components/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SOLUTION_PAGES, type SolutionPage as SolutionPageType } from "@/content/siteContent";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

type SolutionPageProps = {
  page: SolutionPageType;
};

const SolutionPage = ({ page }: SolutionPageProps) => {
  const pageIndex = SOLUTION_PAGES.findIndex((candidate) => candidate.slug === page.slug);
  const previousPage = pageIndex > 0 ? SOLUTION_PAGES[pageIndex - 1] : null;
  const nextPage = pageIndex < SOLUTION_PAGES.length - 1 ? SOLUTION_PAGES[pageIndex + 1] : null;

  return (
    <SiteLayout>
      <section className="mx-auto mt-10 w-full max-w-7xl px-6 md:mt-14">
        <div className="glass-card rounded-[2rem] p-8 md:p-10">
          <p className="eyebrow">{page.category}</p>
          <h1 className="display-title mt-3 max-w-4xl text-balance">{page.title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">{page.summary}</p>

          <div className="mt-8 rounded-2xl border border-white/45 bg-white/70 p-5">
            <h2 className="text-base font-semibold text-foreground">Problem statement</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{page.problemStatement}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-12 w-full max-w-7xl px-6">
        <div className="grid gap-5 lg:grid-cols-2">
          <article className="glass-card rounded-3xl p-6">
            <h2 className="section-title">What We Do</h2>
            <ul className="mt-4 space-y-3">
              {page.whatWeDo.map((item) => (
                <li key={item} className="rounded-2xl border border-white/45 bg-white/65 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="glass-card rounded-3xl p-6">
            <h2 className="section-title">How We Do It</h2>
            <ul className="mt-4 space-y-3">
              {page.howWeDo.map((item) => (
                <li key={item} className="rounded-2xl border border-white/45 bg-white/65 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="mx-auto mt-12 w-full max-w-7xl px-6 pb-8">
        <article className="glass-card rounded-3xl p-6 md:p-8">
          <h2 className="section-title">Expected Outcomes</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {page.outcomes.map((outcome) => (
              <p key={outcome} className="rounded-2xl border border-white/45 bg-white/65 px-4 py-3 text-sm font-medium text-foreground">
                {outcome}
              </p>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <Button asChild variant="outline" className="rounded-full bg-white/80">
              <Link to="/solutions">
                <ArrowLeft className="h-4 w-4" />
                Back to solutions
              </Link>
            </Button>

            <div className="flex flex-wrap gap-3">
              {previousPage ? (
                <Button asChild variant="outline" className="rounded-full bg-white/80">
                  <Link to={`/solutions/${previousPage.slug}`}>
                    <ArrowLeft className="h-4 w-4" />
                    {previousPage.title}
                  </Link>
                </Button>
              ) : null}

              {nextPage ? (
                <Button asChild className="rounded-full">
                  <Link to={`/solutions/${nextPage.slug}`}>
                    {nextPage.title}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
        </article>
      </section>
    </SiteLayout>
  );
};

export default SolutionPage;
