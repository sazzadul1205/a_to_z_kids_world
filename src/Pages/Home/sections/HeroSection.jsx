import { Sparkles, MessageCircle, ArrowRight, Smile } from "lucide-react";
import { whatsappUrl } from "../../../lib/whatsapp";
import { pagesData } from "../../../data/pages";

const HeroSection = () => {
  const hero = pagesData.hero;

  return (
    <section className="relative overflow-hidden bg-linear-to-br from-primary-100 via-surface to-accent-100 py-16 md:py-24">
      <div className="absolute -left-20 top-10 h-60 w-60 rounded-full bg-accent-200/40 blur-3xl" />
      <div className="absolute -bottom-20 right-10 h-80 w-80 rounded-full bg-primary-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-surface/80 px-4 py-2 text-sm font-bold text-primary-700 shadow-sm backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              {hero.badge}
            </div>
            <h1 className="text-4xl font-black leading-tight text-text sm:text-5xl lg:text-6xl">
              {hero.title} <br />
              {hero.subtitle} <span className="text-primary-600">{hero.highlight}</span>
            </h1>
            <p className="mt-4 max-w-md text-lg text-text-muted">{hero.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-secondary-900 px-6 py-3 font-bold text-surface shadow-md transition hover:-translate-y-1 hover:bg-secondary-1000"
              >
                <MessageCircle className="h-5 w-5" /> Chat with us
              </a>
              <a
                href="#products"
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 font-bold text-surface shadow-md transition hover:-translate-y-1 hover:bg-primary-700"
              >
                Shop now <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="relative flex justify-center md:justify-end">
            <div className="relative w-full max-w-md rounded-4xl bg-secondary-200 p-4 shadow-xl">
              <div className="absolute -right-2 -top-4 flex items-center gap-2 rounded-2xl bg-accent-600 px-4 py-2 text-sm font-black text-text shadow-md">
                <Smile className="h-5 w-5" /> {hero.imageBadge}
              </div>
              <img
                src={hero.image}
                alt={hero.imageAlt}
                className="h-64 w-full rounded-2xl object-cover sm:h-80"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;