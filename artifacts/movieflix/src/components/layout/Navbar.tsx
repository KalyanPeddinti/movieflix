import { Link } from "wouter";

export function Navbar() {
  return (
    <header className="fixed top-0 z-50 w-full bg-gradient-to-b from-black/80 to-transparent">
      <div className="container mx-auto px-4 md:px-8 flex items-center h-20">
        <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105" data-testid="link-home">
          <span className="text-3xl font-bold text-primary tracking-tight">MovieFlix</span>
        </Link>
      </div>
    </header>
  );
}
