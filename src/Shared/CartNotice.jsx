import { AlertTriangle, Check, X } from "lucide-react";
import { useLanguage } from "../context/language/useLanguage";

export default function CartNotice({ notice, onDismiss }) {
  const { t } = useLanguage();
  if (!notice) return null;

  const isWarn = notice.tone === "warn";

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4"
    >
      <div
        className={`flex max-w-md items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold shadow-xl ${
          isWarn
            ? "bg-accent-900 text-ink-bright"
            : "bg-brand-fill-alt text-ink-on-brand"
        }`}
      >
        {isWarn ? (
          <AlertTriangle className="h-5 w-5 shrink-0" />
        ) : (
          <Check className="h-5 w-5 shrink-0" />
        )}
        <span className="flex-1">{notice.text}</span>
        <button
          type="button"
          onClick={onDismiss}
          aria-label={t("notice.dismiss")}
          className="rounded-full p-1 transition hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
