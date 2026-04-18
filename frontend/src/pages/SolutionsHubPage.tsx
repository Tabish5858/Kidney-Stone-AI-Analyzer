import { Button } from "@/components/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SOLUTION_PAGES } from "@/content/siteContent";
import { ArrowRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const categories = ["All", ...Array.from(new Set(SOLUTION_PAGES.map((page) => page.category)))];

const SolutionsHubPage = () => {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredPages = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return SOLUTION_PAGES.filter((page) => {
      const categoryMatch = activeCategory === "All" || page.category === activeCategory;
      const queryMatch =
        normalizedQuery.length === 0 ||
        page.title.toLowerCase().includes(normalizedQuery) ||
        page.summary.toLowerCase().includes(normalizedQuery) ||
        page.problemStatement.toLowerCase().includes(normalizedQuery);

      return categoryMatch && queryMatch;
    });
  }, [activeCategory, query]);

  return (
    <SiteLayout>
      <section className="mx-auto mt-10 w-full max-w-7xl px-6 md:mt-14">
        <div className="section-title-wrap">
          <p className="eyebrow">Solution Library</p>
          <h1 className="display-title max-w-4xl text-balance">
            34 additional pages, each focused on one operational or clinical value thread.
          </h1>
          <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
            Use this hub to navigate structured pages that explain the problem, what we do, and how we do it.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <label className="glass-card flex items-center gap-3 rounded-2xl px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title, summary, or problem"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </label>

          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredPages.length}</span> of {SOLUTION_PAGES.length}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              type="button"
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300 ${category === activeCategory
                  ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/30"
                  : "border-white/45 bg-white/65 text-foreground hover:bg-white"
                }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-8 w-full max-w-7xl px-6 pb-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredPages.map((page) => (
            <article key={page.slug} className="glass-card rounded-3xl p-6">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">{page.category}</p>
                <span className="rounded-full bg-white/75 px-3 py-1 text-xs text-muted-foreground">/{page.slug}</span>
              </div>
              <h2 className="mt-3 text-xl font-semibold text-foreground">{page.title}</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{page.summary}</p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{page.problemStatement}</p>
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
    </SiteLayout>
  );
};

export default SolutionsHubPage;
