import { useContext } from "react";
import { ReviewContext } from "./review-context";

export function useReview() {
  const context = useContext(ReviewContext);
  if (!context) throw new Error("useReview must be used inside ReviewProvider");
  return context;
}
