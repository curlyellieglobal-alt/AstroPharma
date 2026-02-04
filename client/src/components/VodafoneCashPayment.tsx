import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, Smartphone, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface VodafoneCashPaymentProps {
  amount: number;
  onSuccess?: (receiptUrl: string) => void;
  onCancel?: () => void;
}

export function VodafoneCashPayment({
  amount,
  onSuccess,
  onCancel,
}: VodafoneCashPaymentProps) {
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setReceiptFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!receiptFile) {
      toast.error("Please select a receipt image");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", receiptFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setUploadedUrl(data.url);
      toast.success("Receipt uploaded successfully!");
      
      if (onSuccess) {
        onSuccess(data.url);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to upload receipt");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <Smartphone className="w-5 h-5 text-red-600" />
          <span className="font-semibold text-red-900">Vodafone Cash Payment</span>
        </div>
        
        <div className="space-y-2 text-sm text-red-700">
          <p className="font-medium">Payment Instructions:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Open Vodafone Cash app on your phone</li>
            <li>Send <span className="font-bold">${amount.toFixed(2)}</span> to: <span className="font-bold">01012345678</span></li>
            <li>Take a screenshot of the payment receipt</li>
            <li>Upload the receipt below</li>
          </ol>
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="receipt">Upload Payment Receipt *</Label>
        
        {!receiptPreview ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <Input
              id="receipt"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="receipt" className="cursor-pointer">
              <Upload className="w-12 h-36 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-1">
                Click to upload receipt image
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG up to 5MB
              </p>
            </label>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative rounded-lg overflow-hidden border border-gray-200">
              <img
                src={receiptPreview}
                alt="Receipt preview"
                className="w-full h-48 object-contain bg-gray-50"
              />
              {uploadedUrl && (
                <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Uploaded
                </div>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setReceiptFile(null);
                setReceiptPreview("");
                setUploadedUrl("");
              }}
              className="w-full"
            >
              Change Image
            </Button>
          </div>
        )}
      </div>

      <Button
        onClick={handleUpload}
        disabled={!receiptFile || isUploading || !!uploadedUrl}
        size="lg"
        className="w-full"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : uploadedUrl ? (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Receipt Uploaded
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Upload Receipt & Confirm Payment
          </>
        )}
      </Button>

      <p className="text-xs text-center text-gray-500">
        Your order will be processed after receipt verification
      </p>
    </div>
  );
}
