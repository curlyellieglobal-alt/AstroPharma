// Currency types and utilities for multi-currency support

export type Currency = "USD" | "EGP" | "EUR" | "GBP" | "SAR" | "AED";

export const CURRENCIES: Currency[] = ["USD", "EGP", "EUR", "GBP", "SAR", "AED"];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  EGP: "EGP",
  EUR: "€",
  GBP: "£",
  SAR: "SAR",
  AED: "AED",
};

export const CURRENCY_NAMES: Record<Currency, string> = {
  USD: "US Dollar",
  EGP: "Egyptian Pound",
  EUR: "Euro",
  GBP: "British Pound",
  SAR: "Saudi Riyal",
  AED: "UAE Dirham",
};

// Exchange rates relative to USD (1 USD = X currency)
export const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  EGP: 49.50,
  EUR: 0.92,
  GBP: 0.79,
  SAR: 3.75,
  AED: 3.67,
};

/**
 * Convert price from one currency to another
 */
export function convertPrice(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to USD first
  const amountInUSD = amount / EXCHANGE_RATES[fromCurrency];
  
  // Then convert to target currency
  const convertedAmount = amountInUSD * EXCHANGE_RATES[toCurrency];
  
  return convertedAmount;
}

/**
 * Format price with currency symbol
 */
export function formatPrice(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  const formatted = amount.toFixed(2);
  
  // For currencies with symbol prefix (USD, EUR, GBP)
  if (currency === "USD" || currency === "EUR" || currency === "GBP") {
    return `${symbol}${formatted}`;
  }
  
  // For currencies with symbol suffix (EGP, SAR, AED)
  return `${formatted} ${symbol}`;
}
