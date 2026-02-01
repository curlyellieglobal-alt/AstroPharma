import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// Initialize Stripe with publishable key
// User needs to provide their own Stripe publishable key
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder"
);

interface StripePaymentProps {
  amount: number;
  currency?: string;
  customerEmail?: string;
  orderId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function StripePayment({
  amount,
  currency = "usd",
  customerEmail,
  orderId,
  onSuccess,
  onCancel,
}: StripePaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const createCheckoutMutation = trpc.stripe.createCheckoutSession.useMutation({
    onSuccess: async (data) => {
      const stripe = await stripePromise;
      if (!stripe) {
        toast.error("Stripe failed to load");
        setIsProcessing(false);
        return;
      }

      // Redirect to Stripe Checkout URL
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      
      const error = { message: 'No checkout URL received' };

      if (error) {
        toast.error(error.message || "Payment failed");
        setIsProcessing(false);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create checkout session");
      setIsProcessing(false);
    },
  });

  const handlePayment = async () => {
    setIsProcessing(true);

    const baseUrl = window.location.origin;
    const successUrl = `${baseUrl}/payment-success${orderId ? `?orderId=${orderId}` : ""}`;
    const cancelUrl = `${baseUrl}/checkout`;

    await createCheckoutMutation.mutateAsync({
      amount,
      currency,
      successUrl,
      cancelUrl,
      customerEmail,
      orderId,
    });
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-blue-900">Secure Card Payment</span>
        </div>
        <p className="text-sm text-blue-700">
          You will be redirected to Stripe's secure payment page to complete your purchase.
        </p>
      </div>

      <Button
        onClick={handlePayment}
        disabled={isProcessing}
        size="lg"
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Pay ${amount.toFixed(2)} with Card
          </>
        )}
      </Button>

      <p className="text-xs text-center text-gray-500">
        Powered by Stripe • Secure SSL Encryption
      </p>
    </div>
  );
}
