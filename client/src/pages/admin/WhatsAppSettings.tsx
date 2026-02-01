import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { MessageCircle, Save } from "lucide-react";

export default function WhatsAppSettings() {
  const [phone, setPhone] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [template, setTemplate] = useState("");
  const [notificationPhone, setNotificationPhone] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const { data: settings, refetch } = trpc.siteSettings.getAll.useQuery();
  const updateSetting = trpc.siteSettings.update.useMutation({
    onSuccess: () => {
      toast.success("WhatsApp settings updated successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update settings: ${error.message}`);
    },
  });

  useEffect(() => {
    if (settings) {
      const phoneSetting = settings.find(s => s.settingKey === 'whatsapp_phone');
      const enabledSetting = settings.find(s => s.settingKey === 'whatsapp_enabled');
      const templateSetting = settings.find(s => s.settingKey === 'whatsapp_message_template');
      const notificationPhoneSetting = settings.find(s => s.settingKey === 'whatsapp_notification_phone');
      const notificationsEnabledSetting = settings.find(s => s.settingKey === 'whatsapp_notifications_enabled');

      if (phoneSetting) setPhone(phoneSetting.settingValue || "");
      if (enabledSetting) setEnabled(enabledSetting.settingValue === 'true');
      if (templateSetting) setTemplate(templateSetting.settingValue || "");
      if (notificationPhoneSetting) setNotificationPhone(notificationPhoneSetting.settingValue || "");
      if (notificationsEnabledSetting) setNotificationsEnabled(notificationsEnabledSetting.settingValue === 'true');
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSetting.mutateAsync({ key: 'whatsapp_phone', value: phone });
      await updateSetting.mutateAsync({ key: 'whatsapp_enabled', value: enabled.toString() });
      await updateSetting.mutateAsync({ key: 'whatsapp_message_template', value: template });
      await updateSetting.mutateAsync({ key: 'whatsapp_notification_phone', value: notificationPhone });
      await updateSetting.mutateAsync({ key: 'whatsapp_notifications_enabled', value: notificationsEnabled.toString() });
    } catch (error) {
      console.error("Error updating WhatsApp settings:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MessageCircle className="w-8 h-8 text-green-600" />
          WhatsApp Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure WhatsApp integration for post-payment customer communication
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Business Configuration</CardTitle>
          <CardDescription>
            Set up automatic WhatsApp redirect after successful payment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="phone">WhatsApp Business Phone Number</Label>
            <Input
              id="phone"
              type="text"
              placeholder="+201234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Include country code (e.g., +20 for Egypt, +1 for USA)
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="enabled"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <Label htmlFor="enabled" className="cursor-pointer">
              Enable automatic WhatsApp redirect after payment
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template">Message Template</Label>
            <Textarea
              id="template"
              rows={6}
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              placeholder="Hello! Thank you for your order..."
            />
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-semibold">Available placeholders:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><code className="bg-gray-100 px-1 rounded">{"{orderId}"}</code> - Order ID</li>
                <li><code className="bg-gray-100 px-1 rounded">{"{customerName}"}</code> - Customer name</li>
                <li><code className="bg-gray-100 px-1 rounded">{"{total}"}</code> - Order total</li>
                <li><code className="bg-gray-100 px-1 rounded">{"{items}"}</code> - Order items list</li>
                <li><code className="bg-gray-100 px-1 rounded">{"{shippingAddress}"}</code> - Shipping address</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Preview</h4>
            <p className="text-sm text-blue-800 whitespace-pre-wrap">
              {template
                .replace('{orderId}', '#12345')
                .replace('{customerName}', 'John Doe')
                .replace('{total}', '299.99 EGP')
                .replace('{items}', '1x Curly Ellie Hair Lotion')
                .replace('{shippingAddress}', 'Cairo, Egypt')}
            </p>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={updateSetting.isPending}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateSetting.isPending ? "Saving..." : "Save WhatsApp Settings"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin Notifications</CardTitle>
          <CardDescription>
            Receive instant WhatsApp notifications for new orders and live chat messages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="notificationPhone">Company WhatsApp Number (for notifications)</Label>
            <Input
              id="notificationPhone"
              type="text"
              placeholder="+201234567890"
              value={notificationPhone}
              onChange={(e) => setNotificationPhone(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              This number will receive automatic notifications when:
              <ul className="list-disc list-inside ml-2 mt-1">
                <li>A new order is placed</li>
                <li>A new live chat message arrives</li>
              </ul>
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="notificationsEnabled"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <Label htmlFor="notificationsEnabled" className="cursor-pointer">
              Enable automatic WhatsApp notifications
            </Label>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Important</h4>
            <p className="text-sm text-yellow-800">
              Notifications are sent via WhatsApp Web API. Make sure the phone number is active and can receive messages.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>1. Customer completes payment:</strong> After successful payment (Stripe, Vodafone Cash, COD, etc.), 
            the customer is redirected to the success page.
          </p>
          <p>
            <strong>2. Automatic WhatsApp redirect:</strong> If enabled, the customer is automatically redirected to 
            WhatsApp after 2 seconds with a pre-filled message containing their order details.
          </p>
          <p>
            <strong>3. Manual option:</strong> A "Continue to WhatsApp" button is always available for customers to 
            click manually if they prefer.
          </p>
          <p>
            <strong>4. Order confirmation:</strong> The customer can send the message to your WhatsApp business number 
            to confirm their order and start communication.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
