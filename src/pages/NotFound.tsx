import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <pre className="inline-block text-left text-sm leading-tight text-ink-muted">
{`
    Try to find your way back to shore, but beware of the treacherous waves and hidden dangers lurking in the depths.
`}
      </pre>
      <h1 className="mb-2 mt-5 text-5xl font-bold">404</h1>
      <p className="text-lg text-ink-muted">This penguin got lost at sea 🐧</p>
      <p className="mb-8 mt-1 text-sm text-ink-muted/80">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/overview" className="text-ice-bright hover:underline">
        ← Back to shore
      </Link>
    </div>
  );
}
