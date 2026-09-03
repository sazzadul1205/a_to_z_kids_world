import { Send, Sparkles } from 'lucide-react';

const NewsletterSection = () => {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-secondary-100 p-8 shadow-inner md:p-12">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-500 text-text shadow-md">
            <Sparkles className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-black text-text">Join the A to Z Kids Club</h2>
          <p className="mt-2 text-text-muted">
            Get 10% off your first order and be the first to know about new arrivals and special offers.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-text placeholder:text-text-muted focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
            />
            <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3 font-bold text-surface transition hover:bg-primary-700">
              Subscribe <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;