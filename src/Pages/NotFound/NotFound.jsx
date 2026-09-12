import { Link } from "react-router";
import { Home as HomeIcon } from "lucide-react";
import { pagesData } from "../../data/pages";

const NotFound = () => {
  const nf = pagesData.notFound;
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-6 text-8xl">
        <span className="inline-block animate-bounce">{nf.mascot}</span>
        <span className="absolute -right-6 -top-4 animate-pulse text-4xl">{nf.marker}</span>
      </div>
      <h1 className="text-5xl font-black text-primary-600">{nf.code}</h1>
      <h2 className="mt-2 text-3xl font-bold text-text">{nf.title}</h2>
      <p className="mt-2 max-w-md text-text-muted">{nf.message}</p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 font-bold text-surface shadow transition hover:bg-primary-700"
      >
        <HomeIcon className="h-5 w-5" /> {nf.ctaLabel}
      </Link>
      <div className="mt-8 flex gap-4 text-4xl opacity-30">
        {nf.decorations.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
    </div>
  );
};

export default NotFound;