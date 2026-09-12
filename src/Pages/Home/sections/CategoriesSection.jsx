import { useRef, useState } from "react";
import { categoriesData } from "../../../data/categories";
import { pagesData } from "../../../data/pages";

const CategoriesSection = ({ selectedCategory, onSelectCategory }) => {
  const copy = pagesData.categories;
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
          {categoriesData.map(({ name, icon: Icon }) => {
            const isSelected = selectedCategory === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => {
                  if (wasDragged.current) {
                    wasDragged.current = false;
                    return;
                  }
                  onSelectCategory(name);
                }}
                className={`group flex shrink-0 items-center gap-3 rounded-2xl border-2 px-5 py-3 font-bold transition-all hover:scale-105 hover:shadow-lg ${isSelected
                    ? "border-primary-600 bg-primary-600 text-surface shadow-primary-200"
                    : "border-border bg-surface text-text hover:border-primary-300 hover:bg-primary-50"
                  }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${isSelected
                      ? "bg-white/20 text-surface"
                      : "bg-secondary-100 text-secondary-900 group-hover:bg-primary-100"
                    }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="whitespace-nowrap text-sm sm:text-base">{name}</span>
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