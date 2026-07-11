import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { SearchBar } from "@/components/search/SearchBar";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Browse", href: "/browse" },
];

function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!user) {
    return (
      <div className="flex items-center gap-3 ml-auto">
        <Link
          href="/login"
          className="text-sm font-medium text-white/70 hover:text-white transition-colors"
          data-testid="link-login"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2 rounded transition-colors"
          data-testid="link-signup"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 group"
        data-testid="btn-user-menu"
        aria-expanded={open}
        aria-label="User menu"
      >
        <div className="w-9 h-9 rounded bg-primary flex items-center justify-center text-white text-sm font-bold select-none transition-opacity group-hover:opacity-80">
          {initials}
        </div>
        <svg
          className={`w-3 h-3 text-white/60 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-52 bg-zinc-900 border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-white text-sm font-medium truncate">{user.name}</p>
            <p className="text-white/50 text-xs truncate">{user.email}</p>
          </div>
          <button
            onClick={() => {
              logout();
              setOpen(false);
              navigate("/login");
            }}
            className="w-full text-left px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            data-testid="btn-logout"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const [location] = useLocation();

  return (
    <header className="fixed top-0 z-50 w-full bg-gradient-to-b from-black/80 to-transparent">
      <div className="container mx-auto px-4 md:px-8 flex items-center gap-6 h-20">
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

        <div className="flex items-center gap-3 ml-auto">
          <SearchBar />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
