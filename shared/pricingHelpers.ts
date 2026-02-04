export type Currency = "USD" | "EGP" | "EUR" | "GBP" | "SAR" | "AED";

export interface ProductPricing {
  priceUSD?: number;
  priceEGP?: number;
  priceEUR?: number;
  priceGBP?: number;
  priceSAR?: number;
  priceAED?: number;
}

/**
 * Get the price for a specific currency
 * Returns the currency-specific price if available, otherwise returns undefined
 */
export function getPriceForCurrency(
  pricing: ProductPricing,
  currency: Currency
): number | undefined {
  const priceKey = `price${currency}` as keyof ProductPricing;
  return pricing[priceKey];
}

/**
 * Get all available currencies for a product
 */
export function getAvailableCurrencies(pricing: ProductPricing): Currency[] {
  const currencies: Currency[] = ["USD", "EGP", "EUR", "GBP", "SAR", "AED"];
  return currencies.filter((currency) => getPriceForCurrency(pricing, currency));
}

/**
 * Format price with currency symbol
 */
export function formatPriceWithCurrency(price: number, currency: Currency): string {
  const symbols: Record<Currency, string> = {
    USD: "$",
    EGP: "ج.م",
    EUR: "€",
    GBP: "£",
    SAR: "﷼",
    AED: "د.إ",
  };

  return `${symbols[currency]} ${price.toFixed(2)}`;
}
