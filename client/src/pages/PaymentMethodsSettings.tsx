import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface PaymentMethod {
  id: number;
  provider: string;
  displayName: string;
  description: string | null;
  isVisible: boolean;
  displayOrder: number;
  icon: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function PaymentMethodsSettings() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ displayName?: string; description?: string; displayOrder?: number }>({});
  const [loading, setLoading] = useState(false);

  const { data: methods, isLoading } = trpc.paymentMethods.list.useQuery();
  const updateVisibilityMutation = trpc.paymentMethods.updateVisibility.useMutation();
  const updateMutation = trpc.paymentMethods.update.useMutation();
  const initializeMutation = trpc.paymentMethods.initialize.useMutation();

  useEffect(() => {
    if (methods) {
      setPaymentMethods(methods as PaymentMethod[]);
    }
  }, [methods]);

  const handleToggleVisibility = async (provider: string, isVisible: boolean) => {
    try {
      setLoading(true);
      await updateVisibilityMutation.mutateAsync({
        provider,
        isVisible: !isVisible,
      });
      
      setPaymentMethods(prev =>
        prev.map(m =>
          m.provider === provider ? { ...m, isVisible: !isVisible } : m
        )
      );
      
      toast.success(
        `${provider} payment method ${!isVisible ? 'enabled' : 'disabled'}`
      );
    } catch (error) {
      toast.error('Failed to update payment method');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingId(method.provider);
    setEditData({
      displayName: method.displayName,
      description: method.description || '',
      displayOrder: method.displayOrder,
    });
  };

  const handleSaveEdit = async (provider: string) => {
    try {
      setLoading(true);
      const updatePayload = {
        provider,
        displayName: editData.displayName,
        description: editData.description || undefined,
        displayOrder: editData.displayOrder,
      };
      await updateMutation.mutateAsync(updatePayload);
      
      setPaymentMethods(prev =>
        prev.map(m =>
          m.provider === provider 
            ? { 
                ...m, 
                displayName: editData.displayName || m.displayName,
                description: editData.description || m.description,
                displayOrder: editData.displayOrder || m.displayOrder,
              } 
            : m
        )
      );
      
      setEditingId(null);
      toast.success('Payment method updated');
    } catch (error) {
      toast.error('Failed to update payment method');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    try {
      setLoading(true);
      await initializeMutation.mutateAsync();
      toast.success('Payment methods initialized');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to initialize payment methods');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Payment Methods Management</h1>
        <p className="text-gray-600 mt-2">
          Control which payment methods are visible to customers
        </p>
      </div>

      {paymentMethods.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Payment Methods Found</CardTitle>
            <CardDescription>
              Initialize default payment methods to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleInitialize}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Initializing...
                </>
              ) : (
                'Initialize Default Payment Methods'
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {paymentMethods.map(method => (
            <Card key={method.provider}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {editingId === method.provider ? (
                      <Input
                        value={editData.displayName || ''}
                        onChange={e =>
                          setEditData({
                            ...editData,
                            displayName: e.target.value,
                          })
                        }
                        placeholder="Display Name"
                        className="mb-2"
                      />
                    ) : (
                      <CardTitle>{method.displayName}</CardTitle>
                    )}
                    <CardDescription className="text-xs">
                      Provider: {method.provider}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-sm font-medium">
                        {method.isVisible ? 'Visible' : 'Hidden'}
                      </span>
                      <Switch
                        checked={method.isVisible}
                        onCheckedChange={() =>
                          handleToggleVisibility(method.provider, method.isVisible)
                        }
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingId === method.provider ? (
                  <>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        value={editData.description || ''}
                        onChange={e =>
                          setEditData({
                            ...editData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Payment method description"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Display Order</label>
                      <Input
                        type="number"
                        value={editData.displayOrder || 0}
                        onChange={e =>
                          setEditData({
                            ...editData,
                            displayOrder: parseInt(e.target.value),
                          })
                        }
                        placeholder="Display order"
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSaveEdit(method.provider)}
                        disabled={loading}
                        className="flex-1"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save'
                        )}
                      </Button>
                      <Button
                        onClick={() => setEditingId(null)}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">
                        {method.description || 'No description'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Display Order: {method.displayOrder}
                      </span>
                      <Button
                        onClick={() => handleEdit(method)}
                        variant="outline"
                        size="sm"
                      >
                        Edit
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
