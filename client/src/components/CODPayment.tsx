import { Button } from "@/components/ui/button";
import { Banknote, CheckCircle } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface CODPaymentProps {
  amount: number;
  currency?: string;
  onConfirm?: () => void;
}

export function CODPayment({ amount, currency = "EGP", onConfirm }: CODPaymentProps) {
  const { formatPrice } = useCurrency();
  
  return (
    <div className="space-y-4">
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <Banknote className="w-5 h-5 text-green-600" />
          <span className="font-semibold text-green-900">Cash on Delivery</span>
        </div>
        
        <div className="space-y-2 text-sm text-green-700">
          <p className="font-medium">Payment Instructions:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Pay <span className="font-bold">{formatPrice(amount, currency as any)}</span> in cash when you receive your order</li>
            <li>Make sure to have exact change ready</li>
            <li>Payment is collected by our delivery partner</li>
            <li>You can inspect the product before payment</li>
          </ul>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">No prepayment required</p>
            <p>Your order will be confirmed immediately. Pay when you receive the product at your doorstep.</p>
          </div>
        </div>
      </div>

      <Button
        onClick={onConfirm}
        size="lg"
        className="w-full"
      >
        <Banknote className="w-4 h-4 mr-2" />
        Confirm Order (Pay on Delivery)
      </Button>

      <p className="text-xs text-center text-gray-500">
        Free delivery • 7-day return policy
      </p>
    </div>
  );
}
