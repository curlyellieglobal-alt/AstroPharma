import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EGP", name: "Egyptian Pound", symbol: "ج.م" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
];

interface CurrencyPrices {
  priceUSD?: number;
  priceEGP?: number;
  priceEUR?: number;
  priceGBP?: number;
  priceSAR?: number;
  priceAED?: number;
}

interface CurrencyPricingManagerProps {
  prices: CurrencyPrices;
  onChange: (prices: CurrencyPrices) => void;
}

export default function CurrencyPricingManager({
  prices,
  onChange,
}: CurrencyPricingManagerProps) {
  const handlePriceChange = (currency: string, value: string) => {
    const numValue = value ? parseFloat(value) : undefined;
    onChange({
      ...prices,
      [`price${currency}`]: numValue,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Currency-Specific Pricing</CardTitle>
        <CardDescription>
          Set prices for each currency independently. Leave empty to disable that currency.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CURRENCIES.map((currency) => (
            <div key={currency.code} className="space-y-2">
              <Label htmlFor={`price-${currency.code}`}>
                {currency.name} ({currency.symbol})
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-medium">{currency.symbol}</span>
                <Input
                  id={`price-${currency.code}`}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={
                    prices[`price${currency.code}` as keyof CurrencyPrices] || ""
                  }
                  onChange={(e) =>
                    handlePriceChange(currency.code, e.target.value)
                  }
                  className="flex-1"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
