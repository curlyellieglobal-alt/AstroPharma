import { useCurrency, CURRENCIES } from "@/contexts/CurrencyContext";
import { CURRENCY_SYMBOLS, CURRENCY_NAMES, type Currency } from "@shared/currency";

// Country flag emojis for each currency
const CURRENCY_FLAGS: Record<Currency, string> = {
  USD: "🇺🇸",
  EGP: "🇪🇬",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  SAR: "🇸🇦",
  AED: "🇦🇪",
};
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();

  return (
    <Select value={currency} onValueChange={(value) => setCurrency(value as Currency)}>
      <SelectTrigger className="w-[140px]">
        <SelectValue>
          <span className="flex items-center gap-2">
            <span>{CURRENCY_FLAGS[currency]}</span>
            <span>{CURRENCY_SYMBOLS[currency]} {currency}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {CURRENCIES.map((curr) => (
          <SelectItem key={curr} value={curr}>
            <span className="flex items-center gap-2">
              <span>{CURRENCY_FLAGS[curr]}</span>
              <span>{CURRENCY_SYMBOLS[curr]} {curr} - {CURRENCY_NAMES[curr]}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
