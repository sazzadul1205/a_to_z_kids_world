import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "../context/language/useLanguage";

// The basket can refuse a toy (sold out, or already holding every unit in
// stock). That answer used to be silent, so the shopper saw the product dialog
// close with no idea what happened. This turns the addToCart verdict into a
// short-lived message.
export function useCartNotice(timeout = 3200) {
  const [notice, setNotice] = useState(null);
  const { t } = useLanguage();

  const dismiss = useCallback(() => setNotice(null), []);

  const report = useCallback(
    (result, product) => {
      if (result?.added) {
        setNotice({ tone: "ok", text: t("notice.added", { name: product.name }) });
        return true;
      }
      setNotice({
        tone: "warn",
        text:
          result?.reason === "stock-limit"
            ? t("notice.allInStock", { name: product.name })
            : t("notice.outOfStock", { name: product?.name ?? t("notice.outOfStockFallback") }),
      });
      return false;
    },
    [t],
  );

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(dismiss, timeout);
    return () => clearTimeout(timer);
  }, [notice, dismiss, timeout]);

  return { notice, report, dismiss };
}