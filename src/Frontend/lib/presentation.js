import { Brain, Cpu, Gamepad2, Palette, Puzzle, Rocket, Sparkles, ToyBrick } from "lucide-react";

// Backend Category.icon is a string (emoji or short code). The storefront keeps
// the original line-icon look by matching on category name instead.
const ICONS_BY_NAME = {
  "building blocks": Puzzle,
  "arts & crafts": Palette,
  "outdoor play": Rocket,
  "stem toys": Cpu,
  "board games": Gamepad2,
  "plush friends": ToyBrick,
  puzzles: Brain,
};

export const ALL_TOYS_ICON = Sparkles;

export function iconForCategoryName(name) {
  return ICONS_BY_NAME[String(name ?? "").trim().toLowerCase()] ?? ToyBrick;
}

// Fixed class strings only: Tailwind cannot see dynamically built class names.
export const TONES = ["bg-accent-100", "bg-secondary-100", "bg-primary-100"];

export function toneForIndex(index) {
  return TONES[((index % TONES.length) + TONES.length) % TONES.length];
}

export function starsForRating(rating) {
  const rounded = Math.round(Number(rating) || 0);
  return [1, 2, 3, 4, 5].map((position) => position <= rounded);
}