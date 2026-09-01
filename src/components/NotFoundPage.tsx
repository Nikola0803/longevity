import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background-800 text-foreground-100 flex flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-[48px] text-foreground-100 mb-3">404</h1>
      <p className="text-foreground-400 text-[15px] mb-8">Page not found.</p>
      <Link
        to="/"
        className="h-11 px-6 rounded-md bg-primary-500 text-background-900 text-[13px] font-semibold hover:bg-primary-400 transition-all cursor-pointer inline-flex items-center justify-center"
      >
        Back to Home
      </Link>
    </div>
  );
}
