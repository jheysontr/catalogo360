/** Centralized currency utilities */

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  BOB: "Bs",
  ARS: "$",
  MXN: "$",
  CLP: "$",
  COP: "$",
  PEN: "S/",
  UYU: "$U",
  BRL: "R$",
  PYG: "₲",
  GBP: "£",
};

export const getCurrencySymbol = (code: string): string =>
  CURRENCY_SYMBOLS[code] || code;

export const formatCurrency = (amount: number, currencyCode: string = "BOB"): string => {
  const sym = getCurrencySymbol(currencyCode);
  return `${sym} ${amount.toFixed(2)}`;
};

export const formatCurrencyShort = (amount: number, currencyCode: string = "BOB"): string => {
  const sym = getCurrencySymbol(currencyCode);
  if (amount >= 1000) return `${sym} ${(amount / 1000).toFixed(1)}k`;
  return `${sym} ${amount.toFixed(0)}`;
};
