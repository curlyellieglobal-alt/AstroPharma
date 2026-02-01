import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export function WhatsAppSettingsManager() {
  const [phone, setPhone] = useState('');
  const [notificationPhone, setNotificationPhone] = useState('');
  const [messageTemplate, setMessageTemplate] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: settings, isLoading: isLoadingSettings } = trpc.admin.whatsapp.getSettings.useQuery();
  const updatePhoneMutation = trpc.admin.whatsapp.updatePhone.useMutation();
  const updateTemplateMutation = trpc.admin.whatsapp.updateMessageTemplate.useMutation();
  const toggleFeatureMutation = trpc.admin.whatsapp.toggleFeature.useMutation();

  useEffect(() => {
    if (settings) {
      setPhone(String(settings.phone || '+20'));
      setNotificationPhone(String(settings.notificationPhone || '+20'));
      setMessageTemplate(String(settings.messageTemplate || ''));
      setEnabled(Boolean(settings.enabled));
      setNotificationsEnabled(Boolean(settings.notificationsEnabled));
    }
  }, [settings]);

  const validatePhoneFormat = (phoneNumber: string | null | undefined): boolean => {
    if (!phoneNumber) return false;
    return /^\+\d{10,15}$/.test(phoneNumber);
  };

  const handleUpdatePhone = async (type: 'customer' | 'notification') => {
    const phoneValue = type === 'customer' ? phone : notificationPhone;
    const newErrors: Record<string, string> = {};

    if (!phoneValue) {
      newErrors[type] = 'Phone number is required';
    } else if (!validatePhoneFormat(phoneValue)) {
      newErrors[type] = 'Invalid format. Use +20XXXXXXXXXX (10-15 digits)';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      await updatePhoneMutation.mutateAsync({
        phone: phoneValue,
        type,
      });

      setMessage({
        type: 'success',
        text: `${type === 'customer' ? 'Customer' : 'Notification'} phone updated successfully!`,
      });

      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to update phone number',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTemplate = async () => {
    const newErrors: Record<string, string> = {};

    if (!messageTemplate) {
      newErrors.template = 'Message template is required';
    } else if (messageTemplate.length < 10) {
      newErrors.template = 'Message must be at least 10 characters';
    } else if (messageTemplate.length > 1000) {
      newErrors.template = 'Message must not exceed 1000 characters';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      await updateTemplateMutation.mutateAsync({
        template: messageTemplate,
      });

      setMessage({
        type: 'success',
        text: 'Message template updated successfully!',
      });

      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to update message template',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeature = async (feature: 'enabled' | 'notificationsEnabled', newValue: boolean) => {
    setLoading(true);
    try {
      await toggleFeatureMutation.mutateAsync({
        feature,
        value: newValue,
      });

      if (feature === 'enabled') {
        setEnabled(newValue);
      } else {
        setNotificationsEnabled(newValue);
      }

      setMessage({
        type: 'success',
        text: `WhatsApp ${feature === 'enabled' ? 'customer redirects' : 'notifications'} ${newValue ? 'enabled' : 'disabled'}!`,
      });

      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to update settings',
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`flex items-center gap-3 rounded-lg p-4 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <p>{message.text}</p>
        </div>
      )}

      {/* Customer Phone Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Customer WhatsApp Phone</CardTitle>
          <CardDescription>
            This number is used for customer redirects after payment completion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <Input
              type="tel"
              placeholder="+201010493262"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setErrors({ ...errors, customer: '' });
              }}
              disabled={loading}
              className={errors.customer ? 'border-red-500' : ''}
            />
            {errors.customer && (
              <p className="text-sm text-red-600">{errors.customer}</p>
            )}
            <p className="text-xs text-gray-500">
              Format: +20 followed by 10-15 digits (e.g., +201010493262)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="enabled"
              checked={enabled}
              onCheckedChange={(checked) => handleToggleFeature('enabled', checked as boolean)}
              disabled={loading}
            />
            <label htmlFor="enabled" className="text-sm font-medium cursor-pointer">
              Enable automatic WhatsApp redirect after payment
            </label>
          </div>

          <Button
            onClick={() => handleUpdatePhone('customer')}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Save Customer Phone'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Notification Phone Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Notification Phone</CardTitle>
          <CardDescription>
            This number receives WhatsApp notifications for new orders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <Input
              type="tel"
              placeholder="+201010493262"
              value={notificationPhone}
              onChange={(e) => {
                setNotificationPhone(e.target.value);
                setErrors({ ...errors, notification: '' });
              }}
              disabled={loading}
              className={errors.notification ? 'border-red-500' : ''}
            />
            {errors.notification && (
              <p className="text-sm text-red-600">{errors.notification}</p>
            )}
            <p className="text-xs text-gray-500">
              Format: +20 followed by 10-15 digits (e.g., +201010493262)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="notificationsEnabled"
              checked={notificationsEnabled}
              onCheckedChange={(checked) =>
                handleToggleFeature('notificationsEnabled', checked as boolean)
              }
              disabled={loading}
            />
            <label htmlFor="notificationsEnabled" className="text-sm font-medium cursor-pointer">
              Enable WhatsApp notifications for new orders
            </label>
          </div>

          <Button
            onClick={() => handleUpdatePhone('notification')}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Save Notification Phone'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Message Template Settings */}
      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Message Template</CardTitle>
          <CardDescription>
            Customize the message sent to customers via WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Message Template</label>
            <Textarea
              placeholder="Hello! Thank you for your order..."
              value={messageTemplate}
              onChange={(e) => {
                setMessageTemplate(e.target.value);
                setErrors({ ...errors, template: '' });
              }}
              disabled={loading}
              rows={6}
              className={errors.template ? 'border-red-500' : ''}
            />
            {errors.template && (
              <p className="text-sm text-red-600">{errors.template}</p>
            )}
            <p className="text-xs text-gray-500">
              Available placeholders: {'{orderId}'}, {'{customerName}'}, {'{total}'}, {'{items}'}, {'{shippingAddress}'}
            </p>
            <p className="text-xs text-gray-400">
              {messageTemplate.length}/1000 characters
            </p>
          </div>

          <Button
            onClick={handleUpdateTemplate}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Save Message Template'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Current Settings Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Current Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>Customer Phone:</strong> {phone || 'Not set'}
          </p>
          <p>
            <strong>Notification Phone:</strong> {notificationPhone || 'Not set'}
          </p>
          <p>
            <strong>Customer Redirects:</strong>{' '}
            <span className={enabled ? 'text-green-600 font-medium' : 'text-gray-600'}>
              {enabled ? '✓ Enabled' : '✗ Disabled'}
            </span>
          </p>
          <p>
            <strong>Notifications:</strong>{' '}
            <span className={notificationsEnabled ? 'text-green-600 font-medium' : 'text-gray-600'}>
              {notificationsEnabled ? '✓ Enabled' : '✗ Disabled'}
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
