import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface OtpVerificationModalProps {
  isOpen: boolean;
  phoneNumber: string;
  onVerified: (otp: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function OtpVerificationModal({
  isOpen,
  phoneNumber,
  onVerified,
  onCancel,
  isLoading = false,
}: OtpVerificationModalProps) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Auto-focus and format OTP input
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setError('');
  };

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      // Simulate verification (in real app, call API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mark as verified
      setIsVerified(true);
      
      // Call the callback after showing success
      setTimeout(() => {
        onVerified(otp);
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = () => {
    setOtp('');
    setError('');
    setResendCountdown(60);
    // In real app, call API to resend OTP
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {isVerified ? 'Phone Verified ✓' : 'Verify Your Phone Number'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Phone Number Display */}
          <div className="text-center text-sm text-muted-foreground">
            We sent a verification code to
            <br />
            <span className="font-semibold text-foreground">{phoneNumber}</span>
          </div>

          {/* Success State */}
          {isVerified && (
            <div className="flex flex-col items-center gap-3 py-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="text-sm text-green-600 font-medium">
                Your phone number has been verified successfully!
              </p>
            </div>
          )}

          {/* OTP Input */}
          {!isVerified && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Verification Code</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  value={otp}
                  onChange={handleOtpChange}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-mono"
                  disabled={isVerifying || isLoading}
                />
                <p className="text-xs text-muted-foreground text-center">
                  Enter the 6-digit code sent to your phone
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Resend Option */}
              <div className="text-center text-sm">
                {resendCountdown > 0 ? (
                  <p className="text-muted-foreground">
                    Resend code in <span className="font-semibold">{resendCountdown}s</span>
                  </p>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={isVerifying || isLoading}
                    className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                  >
                    Didn't receive the code? Resend
                  </button>
                )}
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            {!isVerified && (
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isVerifying || isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={handleVerify}
              disabled={otp.length !== 6 || isVerifying || isLoading || isVerified}
              className="flex-1"
            >
              {isVerifying || isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : isVerified ? (
                'Verified ✓'
              ) : (
                'Verify Code'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
