import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);

  const ADMIN_PIN = "2725";
  const MAX_FAILED_ATTEMPTS = 5;
  const LOCK_DURATION = 15 * 60 * 1000; // 15 minutes
  const REMEMBER_ME_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

  // Check if account is locked
  useEffect(() => {
    const lockTime = localStorage.getItem("admin_lock_time");
    if (lockTime) {
      const remainingTime = parseInt(lockTime) - Date.now();
      if (remainingTime > 0) {
        setIsLocked(true);
        setLockTimeRemaining(Math.ceil(remainingTime / 1000));
      } else {
        localStorage.removeItem("admin_lock_time");
        localStorage.removeItem("admin_failed_attempts");
        setFailedAttempts(0);
      }
    } else {
      const attempts = localStorage.getItem("admin_failed_attempts");
      setFailedAttempts(attempts ? parseInt(attempts) : 0);
    }
  }, []);

  // Update lock timer
  useEffect(() => {
    if (!isLocked) return;
    
    const interval = setInterval(() => {
      setLockTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsLocked(false);
          localStorage.removeItem("admin_lock_time");
          localStorage.removeItem("admin_failed_attempts");
          setFailedAttempts(0);
          toast.success("تم فتح الحساب. يمكنك محاولة الدخول مرة أخرى.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLocked]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      toast.error(`الحساب مقفول. حاول بعد ${lockTimeRemaining} ثانية`);
      return;
    }

    setIsLoading(true);
    
    try {
      if (pin === ADMIN_PIN) {
        toast.success("تم تسجيل الدخول بنجاح!");
        
        const now = Date.now();
        localStorage.setItem("admin_session", "true");
        localStorage.setItem("admin_pin_verified", "true");
        localStorage.setItem("admin_login_time", now.toString());
        
        // Clear failed attempts on successful login
        localStorage.removeItem("admin_failed_attempts");
        localStorage.removeItem("admin_lock_time");
        
        if (rememberMe) {
          const expiryTime = now + REMEMBER_ME_DURATION;
          localStorage.setItem("admin_remember_me", "true");
          localStorage.setItem("admin_session_expiry", expiryTime.toString());
        } else {
          localStorage.removeItem("admin_remember_me");
          localStorage.removeItem("admin_session_expiry");
        }
        
        setLocation("/admin");
      } else {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        localStorage.setItem("admin_failed_attempts", newAttempts.toString());
        
        if (newAttempts >= MAX_FAILED_ATTEMPTS) {
          const lockTime = Date.now() + LOCK_DURATION;
          localStorage.setItem("admin_lock_time", lockTime.toString());
          setIsLocked(true);
          setLockTimeRemaining(Math.ceil(LOCK_DURATION / 1000));
          toast.error("تم قفل الحساب بسبب محاولات دخول فاشلة متعددة. حاول بعد 15 دقيقة.");
        } else {
          const remaining = MAX_FAILED_ATTEMPTS - newAttempts;
          toast.error(`رمز الدخول غير صحيح. محاولات متبقية: ${remaining}`);
        }
        
        setPin("");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-amber-50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">Admin Login</h1>
            <p className="text-gray-600">CurlyEllie Dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رمز الدخول
              </label>
              <Input
                type="password"
                placeholder="أدخل رمز الدخول"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                required
                disabled={isLoading || isLocked}
                className="w-full text-center text-2xl tracking-widest"
                maxLength={4}
              />
              {failedAttempts > 0 && !isLocked && (
                <p className="text-xs text-red-600 mt-2">
                  محاولات متبقية: {MAX_FAILED_ATTEMPTS - failedAttempts}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={isLoading || isLocked}
              />
              <label htmlFor="remember" className="text-sm font-medium text-gray-700 cursor-pointer">
                تذكرني لمدة 30 يوم
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading || pin.length !== 4 || isLocked}
              className="w-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-semibold py-2 rounded-lg transition-all disabled:opacity-50"
            >
              {isLoading ? "جاري الدخول..." : isLocked ? `مقفول (${lockTimeRemaining}ث)` : "دخول"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              منطقة محمية. الموظفون المصرح لهم فقط.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
