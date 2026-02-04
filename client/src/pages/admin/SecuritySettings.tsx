import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock } from "lucide-react";

export default function SecuritySettings() {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const ADMIN_PIN = "2725";

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Verify current PIN
      if (currentPin !== ADMIN_PIN) {
        toast.error("رمز الدخول الحالي غير صحيح");
        setCurrentPin("");
        return;
      }

      // Validate new PIN
      if (newPin.length !== 4) {
        toast.error("الرمز الجديد يجب أن يكون 4 أرقام");
        return;
      }

      if (newPin !== confirmPin) {
        toast.error("الرموز الجديدة غير متطابقة");
        return;
      }

      if (newPin === currentPin) {
        toast.error("الرمز الجديد يجب أن يكون مختلفاً عن الرمز الحالي");
        return;
      }

      // In a real app, this would be sent to the server
      // For now, we'll just show a message
      toast.success("تم تحديث الرمز بنجاح!");
      toast.info("ملاحظة: في التطبيق الحقيقي، سيتم حفظ الرمز الجديد على الخادم");

      // Clear form
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">إعدادات الأمان</h1>
        <p className="text-muted-foreground">إدارة رمز دخول الداشبورد</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">تغيير رمز الدخول</h2>
        </div>

        <form onSubmit={handleChangePin} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الرمز الحالي
            </label>
            <Input
              type="password"
              placeholder="أدخل الرمز الحالي"
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              disabled={isLoading}
              className="text-center text-2xl tracking-widest"
              maxLength={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الرمز الجديد
            </label>
            <Input
              type="password"
              placeholder="أدخل الرمز الجديد"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              disabled={isLoading}
              className="text-center text-2xl tracking-widest"
              maxLength={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تأكيد الرمز الجديد
            </label>
            <Input
              type="password"
              placeholder="أعد إدخال الرمز الجديد"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              disabled={isLoading}
              className="text-center text-2xl tracking-widest"
              maxLength={4}
            />
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={isLoading || !currentPin || !newPin || !confirmPin}
              className="w-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700"
            >
              {isLoading ? "جاري التحديث..." : "تحديث الرمز"}
            </Button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>ملاحظة:</strong> يجب أن يكون الرمز 4 أرقام. تأكد من حفظ الرمز الجديد في مكان آمن.
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">معلومات الأمان</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">آخر تسجيل دخول:</span>
            <span className="font-medium">
              {localStorage.getItem("admin_login_time")
                ? new Date(parseInt(localStorage.getItem("admin_login_time") || "0")).toLocaleString("ar-EG")
                : "غير متوفر"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">حالة "تذكرني":</span>
            <span className="font-medium">
              {localStorage.getItem("admin_remember_me") ? "مفعل (30 يوم)" : "معطل"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">محاولات الدخول الفاشلة:</span>
            <span className="font-medium">
              {localStorage.getItem("admin_failed_attempts") || "0"}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
