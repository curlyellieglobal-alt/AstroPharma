import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export function InventoryAlertsPage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    productId: "",
    alertType: "low_stock" as const,
    threshold: "",
  });

  const { data: alerts = [], refetch } = trpc.inventoryAlerts.getAll.useQuery();
  const { data: products = [] } = trpc.products.listAll.useQuery();
  const createMutation = trpc.inventoryAlerts.create.useMutation();
  const deleteMutation = trpc.inventoryAlerts.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productId || !formData.threshold) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await createMutation.mutateAsync({
        productId: parseInt(formData.productId),
        alertType: formData.alertType,
        threshold: parseInt(formData.threshold),
      });
      toast.success("Inventory alert created successfully");
      setFormData({
        productId: "",
        alertType: "low_stock",
        threshold: "",
      });
      setShowForm(false);
      refetch();
    } catch (error) {
      toast.error("Failed to create inventory alert");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this alert?")) return;

    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Alert deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete alert");
    }
  };

  const getProductName = (productId: number) => {
    return products.find((p) => p.id === productId)?.name || `Product #${productId}`;
  };

  const getAlertColor = (alertType: string) => {
    switch (alertType) {
      case "low_stock":
        return "bg-yellow-100 text-yellow-800";
      case "out_of_stock":
        return "bg-red-100 text-red-800";
      case "overstock":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inventory Alerts</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Create Alert"}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Product</label>
              <select
                value={formData.productId}
                onChange={(e) =>
                  setFormData({ ...formData, productId: e.target.value })
                }
                className="w-full border rounded-md p-2"
                required
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Alert Type</label>
                <select
                  value={formData.alertType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      alertType: e.target.value as any,
                    })
                  }
                  className="w-full border rounded-md p-2"
                >
                  <option value="low_stock">Low Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="overstock">Overstock</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Threshold Quantity
                </label>
                <Input
                  type="number"
                  min="1"
                  value={formData.threshold}
                  onChange={(e) =>
                    setFormData({ ...formData, threshold: e.target.value })
                  }
                  placeholder="e.g., 10"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={createMutation.isPending}>
                Create Alert
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {alerts.map((alert) => (
          <Card key={alert.id} className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={20} className="text-orange-500" />
                  <h3 className="font-bold text-lg">
                    {getProductName(alert.productId)}
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-600">Alert Type</p>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${getAlertColor(
                        alert.alertType
                      )}`}
                    >
                      {alert.alertType.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-600">Threshold</p>
                    <p className="font-semibold">{alert.threshold} units</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        alert.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {alert.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {alert.lastTriggeredAt && (
                  <p className="text-xs text-gray-500">
                    Last triggered:{" "}
                    {new Date(alert.lastTriggeredAt).toLocaleString()}
                  </p>
                )}
              </div>

              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(alert.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {alerts.length === 0 && !showForm && (
        <Card className="p-12 text-center">
          <p className="text-gray-500">
            No inventory alerts configured. Create one to monitor product stock levels.
          </p>
        </Card>
      )}
    </div>
  );
}
