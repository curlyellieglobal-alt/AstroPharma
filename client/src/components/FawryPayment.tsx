import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, Copy, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface FawryPaymentProps {
  amount: number;
  orderId?: string;
  onConfirm?: () => void;
}

export function FawryPayment({ amount, orderId, onConfirm }: FawryPaymentProps) {
  const [referenceNumber, setReferenceNumber] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Generate Fawry reference number (format: FWR + timestamp + random)
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    setReferenceNumber(`FWR${timestamp}${random}`);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(referenceNumber);
    setCopied(true);
    toast.success("Reference number copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <Wallet className="w-5 h-5 text-orange-600" />
          <span className="font-semibold text-orange-900">Fawry Payment</span>
        </div>
        
        <div className="space-y-2 text-sm text-orange-700">
          <p className="font-medium">Payment Instructions:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Visit any Fawry outlet or use Fawry app</li>
            <li>Provide the reference number below</li>
            <li>Pay <span className="font-bold">${amount.toFixed(2)}</span> in cash or card</li>
            <li>Keep your receipt for verification</li>
          </ol>
        </div>
      </div>

      <div className="bg-white border-2 border-orange-300 rounded-lg p-4">
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Fawry Reference Number
        </Label>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-4 py-3">
            <p className="text-2xl font-mono font-bold text-gray-900 tracking-wider text-center">
              {referenceNumber}
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopy}
            className="flex-shrink-0"
          >
            {copied ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Valid for 48 hours
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Order Confirmation</p>
            <p>Your order will be confirmed after payment verification. You'll receive a confirmation email within 24 hours.</p>
          </div>
        </div>
      </div>

      <Button
        onClick={onConfirm}
        size="lg"
        className="w-full"
      >
        <Wallet className="w-4 h-4 mr-2" />
        I've Completed the Payment
      </Button>

      <p className="text-xs text-center text-gray-500">
        Payment processed by Fawry • Secure & Trusted
      </p>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
