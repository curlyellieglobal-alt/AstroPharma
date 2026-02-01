/**
 * Currency Pricing System
 * Manages product prices for different currencies
 */

import { getDb } from "./db";
import { products } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// In-memory cache for currency exchange rates
const CURRENCY_RATES: Record<string, number> = {
  USD: 1.0,
  EGP: 30.5,  // 1 USD = 30.5 EGP (approximate)
  EUR: 0.92,  // 1 USD = 0.92 EUR (approximate)
  GBP: 0.79,  // 1 USD = 0.79 GBP (approximate)
  SAR: 3.75,  // 1 USD = 3.75 SAR (approximate)
  AED: 3.67,  // 1 USD = 3.67 AED (approximate)
};

export type Currency = "USD" | "EGP" | "EUR" | "GBP" | "SAR" | "AED";

/**
 * Convert price from one currency to another
 * @param price - The price in the source currency
 * @param fromCurrency - The source currency
 * @param toCurrency - The target currency
 * @returns The converted price
 */
export function convertCurrency(
  price: number,
  fromCurrency: Currency = "USD",
  toCurrency: Currency = "USD"
): number {
  if (fromCurrency === toCurrency) return price;
  
  // Convert to USD first, then to target currency
  const priceInUSD = price / (CURRENCY_RATES[fromCurrency] || 1);
  const priceInTarget = priceInUSD * (CURRENCY_RATES[toCurrency] || 1);
  
  return Math.round(priceInTarget * 100) / 100; // Round to 2 decimal places
}

/**
 * Get product price in a specific currency
 * @param productId - The product ID
 * @param currency - The target currency
 * @returns The price in the specified currency
 */
export async function getProductPriceInCurrency(
  productId: number,
  currency: Currency = "EGP"
): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  const product = await db
    .select({ price: products.price, currency: products.currency })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!product || product.length === 0) return null;

  const productPrice = parseFloat(product[0].price as any);
  const productCurrency = product[0].currency as Currency;

  return convertCurrency(productPrice, productCurrency, currency);
}

/**
 * Format price with currency symbol
 * @param price - The price to format
 * @param currency - The currency
 * @returns Formatted price string
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

  const symbol = symbols[currency] || currency;
  return `${symbol}${price.toFixed(2)}`;
}

/**
 * Update currency exchange rates
 * @param rates - New exchange rates
 */
export function updateCurrencyRates(rates: Partial<Record<Currency, number>>): void {
  Object.assign(CURRENCY_RATES, rates);
}

/**
 * Get all available currencies
 */
export const AVAILABLE_CURRENCIES: Currency[] = ["USD", "EGP", "EUR", "GBP", "SAR", "AED"];
