import { trpc } from "@/lib/trpc";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Bell, Mail, ShoppingBag, Megaphone } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, Redirect } from "wouter";

export default function NotificationSettings() {
  const { user, loading } = useAuth();
  const { data: preferences, isLoading } = trpc.notifications.getPreferences.useQuery(undefined, {
    enabled: !!user,
  });
  // Logo now handled by shared Logo component

  const updatePreferencesMutation = trpc.notifications.updatePreferences.useMutation({
    onSuccess: () => {
      toast.success("Notification preferences updated");
    },
    onError: (error) => {
      toast.error(`Failed to update preferences: ${error.message}`);
    },
  });

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/" />;
  }

  const handleToggle = (field: string, value: boolean) => {
    if (!preferences) return;
    updatePreferencesMutation.mutate({
      emailOrderConfirmation: preferences.emailOrderConfirmation,
      emailOrderStatus: preferences.emailOrderStatus,
      emailPromotions: preferences.emailPromotions,
      inAppNotifications: preferences.inAppNotifications,
      [field]: value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <Link href="/">
              <a className="flex items-center">
                <Logo className="h-36 w-auto" alt="Curly Ellie" />
              </a>
            </Link>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Notification Settings</h1>
          <p className="text-muted-foreground">
            Manage how you receive notifications from Curly Ellie
          </p>
        </div>

        <div className="space-y-6">
          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-rose-600" />
                <CardTitle>Email Notifications</CardTitle>
              </div>
              <CardDescription>
                Choose which email notifications you'd like to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-order-confirmation" className="text-base font-medium">
                    Order Confirmations
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive an email when you place an order
                  </p>
                </div>
                <Switch
                  id="email-order-confirmation"
                  checked={preferences?.emailOrderConfirmation ?? true}
                  onCheckedChange={(checked) => handleToggle("emailOrderConfirmation", checked)}
                  disabled={updatePreferencesMutation.isPending}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-order-status" className="text-base font-medium">
                    Order Status Updates
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when your order status changes
                  </p>
                </div>
                <Switch
                  id="email-order-status"
                  checked={preferences?.emailOrderStatus ?? true}
                  onCheckedChange={(checked) => handleToggle("emailOrderStatus", checked)}
                  disabled={updatePreferencesMutation.isPending}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-promotions" className="text-base font-medium">
                    Promotions & Updates
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive emails about new products and special offers
                  </p>
                </div>
                <Switch
                  id="email-promotions"
                  checked={preferences?.emailPromotions ?? true}
                  onCheckedChange={(checked) => handleToggle("emailPromotions", checked)}
                  disabled={updatePreferencesMutation.isPending}
                />
              </div>
            </CardContent>
          </Card>

          {/* In-App Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-rose-600" />
                <CardTitle>In-App Notifications</CardTitle>
              </div>
              <CardDescription>
                Control notifications you see when using the website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="in-app-notifications" className="text-base font-medium">
                    Enable In-App Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Show notifications in the notification center
                  </p>
                </div>
                <Switch
                  id="in-app-notifications"
                  checked={preferences?.inAppNotifications ?? true}
                  onCheckedChange={(checked) => handleToggle("inAppNotifications", checked)}
                  disabled={updatePreferencesMutation.isPending}
                />
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">About Notifications</h4>
                  <p className="text-sm text-blue-800">
                    We'll always send important notifications about your orders and account security, 
                    regardless of your preferences. You can manage promotional emails separately.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
