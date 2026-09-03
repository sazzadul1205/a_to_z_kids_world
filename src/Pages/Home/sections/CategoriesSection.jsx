import { Sparkles, Puzzle, Palette, Rocket } from "lucide-react";

const categoriesData = [
  { name: "All toys", icon: Sparkles },
  { name: "Building blocks", icon: Puzzle },
  { name: "Arts & crafts", icon: Palette },
  { name: "Outdoor play", icon: Rocket },
];

const CategoriesSection = ({ selectedCategory, onSelectCategory }) => {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-primary-600">
            Pick a path
          </p>
          <h2 className="mt-2 text-3xl font-black text-text">
            What are we playing today?
          </h2>
        </div>
        <p className="max-w-xs text-sm text-text-muted">
          Choose a category and discover a small collection selected for happy,
          hands‑on learning.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {categoriesData.map(({ name, icon: Icon }) => {
          const isSelected = selectedCategory === name;
          return (
            <button
              key={name}
              type="button"
              onClick={() => onSelectCategory(name)}
              className={`group flex items-center gap-3 rounded-2xl border-2 p-4 text-left font-bold transition-all hover:-translate-y-1 hover:shadow-lg ${
                isSelected
                  ? "border-primary-600 bg-primary-600 text-surface shadow-primary-200"
                  : "border-border bg-surface text-text hover:border-primary-300 hover:bg-primary-50"
              }`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                  isSelected
                    ? "bg-white/20 text-surface"
                    : "bg-secondary-100 text-secondary-900 group-hover:bg-primary-100"
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-sm sm:text-base">{name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default CategoriesSection;
