import { Button } from "@/components/button";
import { cn } from "@/lib/utils";
import { Menu, Sparkles } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

type SiteLayoutProps = {
  children: ReactNode;
};

type NavItem = {
  to: string;
  label: string;
};

const navItems: NavItem[] = [
  { to: "/", label: "Home" },
  { to: "/analyzer", label: "Analyzer" },
];

const NavItemLink = ({ item }: { item: NavItem }) => (
  <NavLink
    to={item.to}
    className={({ isActive }) =>
      cn(
        "rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300",
        isActive
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
          : "text-foreground/75 hover:bg-white/70 hover:text-foreground"
      )
    }
  >
    {item.label}
  </NavLink>
);

const SiteFooter = () => {
  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <footer className="mt-20 border-t border-white/50 bg-white/45 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-base font-semibold text-foreground">Kidney Stone AI Platform</p>
          <p className="text-sm text-muted-foreground">
            Minimal interface. Strong clinical signal. Enterprise-grade readiness.
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Kidney stone CT screening interface</span>
          <span aria-hidden="true">•</span>
          <span>{year}</span>
        </div>
      </div>
    </footer>
  );
};

export const SiteLayout = ({ children }: SiteLayoutProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="liquid-orb liquid-orb-a" aria-hidden="true" />
      <div className="liquid-orb liquid-orb-b" aria-hidden="true" />
      <div className="liquid-orb liquid-orb-c" aria-hidden="true" />

      <header className="sticky top-0 z-40 border-b border-white/40 bg-white/55 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <Link to="/" className="group inline-flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30">
              <Sparkles className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold uppercase tracking-[0.16em] text-foreground/60">
                Stone Intelligence
              </span>
              <span className="block text-lg font-semibold text-foreground">Clinical Signal Platform</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <NavItemLink key={item.to} item={item} />
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Button asChild className="rounded-full">
              <Link to="/analyzer">Open Analyzer</Link>
            </Button>
          </div>

          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/40 bg-white/75 md:hidden"
            onClick={() => setMenuOpen((current) => !current)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {menuOpen ? (
          <div className="border-t border-white/40 bg-white/70 px-6 py-4 md:hidden">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <NavItemLink key={item.to} item={item} />
              ))}
            </div>
          </div>
        ) : null}
      </header>

      <main key={location.pathname} className="relative z-10 animate-rise-in">
        {children}
      </main>

      <SiteFooter />
    </div>
  );
};
