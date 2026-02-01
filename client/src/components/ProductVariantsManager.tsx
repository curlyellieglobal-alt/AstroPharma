import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProductVariantsManagerProps {
  productId: number;
}

export function ProductVariantsManager({ productId }: ProductVariantsManagerProps) {
  const { formatPrice } = useCurrency();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<any>(null);
  
  const { data: variants, isLoading, refetch } = trpc.productVariants.list.useQuery({ productId });
  const createMutation = trpc.productVariants.create.useMutation();
  const updateMutation = trpc.productVariants.update.useMutation();
  const deleteMutation = trpc.productVariants.delete.useMutation();
  
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    size: "",
    color: "",
    price: "",
    compareAtPrice: "",
    stock: 0,
    imageUrl: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      size: "",
      color: "",
      price: "",
      compareAtPrice: "",
      stock: 0,
      imageUrl: "",
    });
    setEditingVariant(null);
  };

  const handleCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (variant: any) => {
    setEditingVariant(variant);
    setFormData({
      name: variant.name,
      sku: variant.sku || "",
      size: variant.size || "",
      color: variant.color || "",
      price: variant.price?.toString() || "",
      compareAtPrice: variant.compareAtPrice?.toString() || "",
      stock: variant.stock,
      imageUrl: variant.imageUrl || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const data = {
        productId,
        name: formData.name,
        sku: formData.sku || undefined,
        size: formData.size || undefined,
        color: formData.color || undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
        stock: formData.stock,
        imageUrl: formData.imageUrl || undefined,
      };

      if (editingVariant) {
        await updateMutation.mutateAsync({ id: editingVariant.id, ...data });
        toast.success("Variant updated successfully");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Variant created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Operation failed");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this variant?")) return;

    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Variant deleted successfully");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Delete failed");
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Product Variants</h3>
        <Button onClick={handleCreate} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Variant
        </Button>
      </div>

      {variants && variants.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((variant: any) => (
              <TableRow key={variant.id}>
                <TableCell className="font-medium">{variant.name}</TableCell>
                <TableCell>{variant.sku || "-"}</TableCell>
                <TableCell>{variant.size || "-"}</TableCell>
                <TableCell>{variant.color || "-"}</TableCell>
                <TableCell>{variant.price ? formatPrice(parseFloat(variant.price), "EGP") : "-"}</TableCell>
                <TableCell>{variant.stock}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(variant)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(variant.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No variants yet. Click "Add Variant" to create one.
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingVariant ? "Edit Variant" : "Create Variant"}</DialogTitle>
            <DialogDescription>
              {editingVariant ? "Update variant details" : "Add a new variant for this product"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Variant Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Small / Red"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  placeholder="e.g., PROD-SM-RED"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="size">Size</Label>
                <Input
                  id="size"
                  placeholder="e.g., S, M, L, XL"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  placeholder="e.g., Red, Blue, Black"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price Override</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="Leave empty to use product price"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="compareAtPrice">Compare At Price</Label>
                <Input
                  id="compareAtPrice"
                  type="number"
                  step="0.01"
                  placeholder="Original price"
                  value={formData.compareAtPrice}
                  onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Variant Image URL</Label>
              <Input
                id="imageUrl"
                placeholder="Optional variant-specific image"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.name || createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingVariant ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
