import { useRef, useState } from "react";
import { ALL_TOYS_ICON, iconForCategoryName, toneForIndex } from "../../../lib/presentation";
import { useLanguage } from "../../../context/language/useLanguage";
import { ALL_TOYS } from "../../../lib/catalog";

const CategoriesSection = ({ categories = [], selectedCategory, onSelectCategory, status = "ready" }) => {
  const { pages, t, categoryLabel } = useLanguage();
  const copy = pages.categories;
  const scrollerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, scrollLeft: 0 });
  const wasDragged = useRef(false);

  const handlePointerDown = (event) => {
    if (!scrollerRef.current) return;
    setIsDragging(true);
    wasDragged.current = false;
    dragStart.current = { x: event.clientX, scrollLeft: scrollerRef.current.scrollLeft };
  };

  const handlePointerMove = (event) => {
    if (!isDragging || !scrollerRef.current) return;
    const distance = event.clientX - dragStart.current.x;
    if (Math.abs(distance) > 5) wasDragged.current = true;
    scrollerRef.current.scrollLeft = dragStart.current.scrollLeft - distance;
  };

  const handlePointerUp = () => setIsDragging(false);

  // "All toys" is a client-side pseudo-category; the API has no equivalent.
  // `name` stays the English identifier because it drives the URL, the selected
  // comparison and the icon lookup, while `label` is what the visitor reads.
  const chips = [
    { key: "all-toys", name: ALL_TOYS, label: t("categories.allToys") },
    ...categories.map((category) => ({
      key: String(category._id),
      name: category.name,
      label: categoryLabel(category.name),
    })),
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-primary-600">
            {copy.eyebrow}
          </p>
          <h2 className="mt-2 text-3xl font-black text-text">{copy.title}</h2>
        </div>
        <p className="max-w-xs text-sm text-text-muted">{copy.description}</p>
      </div>

      <div
        ref={scrollerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative overflow-x-auto rounded-3xl border border-border bg-surface/50 py-4 backdrop-blur-sm scrollbar-none [&::-webkit-scrollbar]:hidden ${isDragging ? "cursor-grabbing select-none" : "cursor-grab"
          }`}
      >
        <div className="flex w-max gap-4 px-4">
          {chips.map((chip, index) => {
            const isSelected = selectedCategory === chip.name;
            const Icon =
              chip.key === "all-toys" ? ALL_TOYS_ICON : iconForCategoryName(chip.name);
            return (
              <button
                key={chip.key}
                type="button"
                disabled={status === "loading"}
                onClick={() => {
                  if (wasDragged.current) {
                    wasDragged.current = false;
                    return;
                  }
                  onSelectCategory(chip.name);
                }}
                className={`group flex shrink-0 items-center gap-3 rounded-2xl border-2 px-5 py-3 font-bold transition-all hover:scale-105 hover:shadow-lg disabled:cursor-wait ${isSelected
                    ? "border-brand-fill bg-brand-fill text-ink-on-brand shadow-black/30"
                    : "border-border bg-surface text-text hover:border-primary-300 hover:bg-primary-50"
                  }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${isSelected
                      ? "bg-white/20 text-ink-on-brand"
                      : toneForIndex(index)
                    }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="whitespace-nowrap text-sm sm:text-base">{chip.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <p className="mt-3 text-xs font-semibold text-text-muted">{copy.hint}</p>
    </section>
  );
};

export default CategoriesSection;
