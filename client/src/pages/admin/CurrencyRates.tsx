import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const CURRENCIES = ["USD", "EGP", "EUR", "GBP", "SAR", "AED"];

export function CurrencyRatesPage() {
  const [rates, setRates] = useState<Record<string, number>>({});
  const { data: currencyRates = [], isLoading, refetch } = trpc.currencyRates.getAll.useQuery();
  const updateMutation = trpc.currencyRates.update.useMutation();

  // Initialize rates from fetched data
  useState(() => {
    const initialRates: Record<string, number> = {};
    currencyRates.forEach((rate) => {
      initialRates[rate.currency] = parseFloat(rate.rate as string);
    });
    setRates(initialRates);
  });

  const handleRateChange = (currency: string, value: string) => {
    setRates({
      ...rates,
      [currency]: parseFloat(value) || 0,
    });
  };

  const handleSave = async (currency: string) => {
    const rate = rates[currency];
    if (!rate || rate <= 0) {
      toast.error("Please enter a valid rate");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        currency,
        rate,
      });
      toast.success(`${currency} rate updated successfully`);
      refetch();
    } catch (error) {
      toast.error(`Failed to update ${currency} rate`);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading currency rates...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Currency Exchange Rates</h1>
        <p className="text-gray-600">
          Manage exchange rates for all supported currencies (relative to USD)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CURRENCIES.map((currency) => {
          const currentRate = currencyRates.find((r) => r.currency === currency);
          const rate = rates[currency] || parseFloat(currentRate?.rate as string) || 1;

          return (
            <Card key={currency} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {currency} Exchange Rate
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">1 USD =</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={rate}
                      onChange={(e) => handleRateChange(currency, e.target.value)}
                      className="flex-1"
                    />
                    <span className="text-gray-600">{currency}</span>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  {currentRate && (
                    <p>
                      Last updated:{" "}
                      {new Date(currentRate.updatedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <Button
                  onClick={() => handleSave(currency)}
                  disabled={updateMutation.isPending}
                  className="w-full"
                >
                  Save Rate
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Tip</h3>
        <p className="text-blue-800 text-sm">
          These exchange rates are used to automatically convert product prices when customers switch currencies on the frontend. Update these rates regularly to reflect current market conditions.
        </p>
      </Card>
    </div>
  );
}
