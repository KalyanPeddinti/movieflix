import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 tracking-tighter">404</h1>
        <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-md">
          Lost your way? We couldn't find the page you're looking for.
        </p>
        <Link 
          href="/" 
          className="px-8 py-4 bg-primary text-white font-semibold rounded hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        >
          MovieFlix Home
        </Link>
      </div>
    </div>
  );
}
