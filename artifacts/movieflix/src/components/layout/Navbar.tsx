import { Link, useLocation } from "wouter";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Movies", href: "/#trending" },
  { label: "Top Rated", href: "/#top-rated" },
  { label: "New & Now", href: "/#now-playing" },
];

export function Navbar() {
  const [location] = useLocation();

  return (
    <header className="fixed top-0 z-50 w-full bg-gradient-to-b from-black/80 to-transparent">
      <div className="container mx-auto px-4 md:px-8 flex items-center gap-8 h-20">
        <Link
          href="/"
          className="flex items-center gap-2 transition-transform hover:scale-105 shrink-0"
          data-testid="link-home"
        >
          <span className="text-3xl font-bold text-primary tracking-tight">MovieFlix</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6" data-testid="nav-links">
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition-colors hover:text-white ${
                location === href ? "text-white" : "text-white/60"
              }`}
              data-testid={`link-nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
