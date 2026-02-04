import React, { createContext, useContext, useState, useEffect } from "react";
import { CURRENCIES, type Currency, formatPrice as formatPriceUtil, convertPrice } from "@shared/currency";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (price: number, productCurrency?: Currency) => string;
  convertPrice: (price: number, fromCurrency: Currency, toCurrency: Currency) => number;
  getPriceForCurrency: (product: any, targetCurrency: Currency) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  // Load currency from localStorage or default to EGP
  const [currency, setCurrencyState] = useState<Currency>(() => {
    // Check if we're in browser environment
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("selectedCurrency");
        if (saved && CURRENCIES.includes(saved as Currency)) {
          return saved as Currency;
        }
      } catch (error) {
        console.error("Failed to load currency from localStorage:", error);
      }
    }
    return "EGP";
  });

  // Save currency to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("selectedCurrency", currency);
      } catch (error) {
        console.error("Failed to save currency to localStorage:", error);
      }
    }
  }, [currency]);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
  };

  const formatPrice = (price: number, productCurrency: Currency = "EGP") => {
    // Direct pricing - no conversion needed
    // The price passed is already in the target currency
    return formatPriceUtil(price, currency);
  };

  const getPriceForCurrency = (product: any, targetCurrency: Currency): number => {
    const priceKey = `price${targetCurrency}`;
    const price = product[priceKey];
    if (price !== null && price !== undefined && price !== '') {
      return typeof price === 'number' ? price : parseFloat(price as string);
    }
    return typeof product.price === 'number' ? product.price : parseFloat(product.price as string);
  };

  const value: CurrencyContextType = {
    currency,
    setCurrency,
    formatPrice,
    convertPrice,
    getPriceForCurrency,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return context;
}

// Export CURRENCIES for use in components
export { CURRENCIES };
