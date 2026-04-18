import { Button } from "@/components/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <SiteLayout>
      <section className="mx-auto mt-16 w-full max-w-4xl px-6 pb-8">
        <article className="glass-card rounded-3xl p-10 text-center">
          <p className="eyebrow">404</p>
          <h1 className="display-title mt-3">Page not found</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            The page you are looking for is not in this experience map. Return to home or open the solutions hub.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild className="rounded-full">
              <Link to="/">Go to home</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full bg-white/80">
              <Link to="/solutions">
                <ArrowLeft className="h-4 w-4" />
                Open solutions
              </Link>
            </Button>
          </div>
        </article>
      </section>
    </SiteLayout>
  );
};

export default NotFoundPage;
