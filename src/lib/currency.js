export const toBDTAmount = (value) =>
  Number(String(value).replace(/[^0-9.-]/g, "")) || 0;

// The taka sign is a symbol rather than a digit, so it stays literal; the digits
// themselves come from Intl, which renders Bengali numerals for bn-BD and Latin
// ones for en-BD.
const TAKA = "৳";

export const formatBDT = (amount, locale = "en-BD") =>
  `${TAKA}${toBDTAmount(amount).toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;