import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

export interface Variant {
  id?: number;
  productId: number;
  size?: string;
  color?: string;
  sku: string;
  price: number;
  stockQuantity: number;
  image?: string;
}

interface VariantManagerProps {
  productId: number;
  variants: Variant[];
  onVariantsChange: (variants: Variant[]) => void;
}

export function VariantManager({ productId, variants, onVariantsChange }: VariantManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [formData, setFormData] = useState<Variant>({
    productId,
    size: "",
    color: "",
    sku: "",
    price: 0,
    stockQuantity: 0,
  });

  const handleAddVariant = () => {
    setEditingVariant(null);
    setFormData({
      productId,
      size: "",
      color: "",
      sku: "",
      price: 0,
      stockQuantity: 0,
    });
    setIsDialogOpen(true);
  };

  const handleEditVariant = (variant: Variant) => {
    setEditingVariant(variant);
    setFormData(variant);
    setIsDialogOpen(true);
  };

  const handleDeleteVariant = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index);
    onVariantsChange(newVariants);
    toast.success("Variant removed");
  };

  const handleSaveVariant = () => {
    if (!formData.sku || formData.price <= 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    let newVariants: Variant[];
    if (editingVariant) {
      newVariants = variants.map(v => 
        v.id === editingVariant.id ? { ...formData, id: editingVariant.id } : v
      );
    } else {
      newVariants = [...variants, formData];
    }

    onVariantsChange(newVariants);
    setIsDialogOpen(false);
    toast.success(editingVariant ? "Variant updated" : "Variant added");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Product Variants</h3>
        <Button onClick={handleAddVariant} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Variant
        </Button>
      </div>

      {variants.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No variants added yet. Click "Add Variant" to create one.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Size</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((variant, index) => (
              <TableRow key={index}>
                <TableCell>{variant.size || "-"}</TableCell>
                <TableCell>
                  {variant.color ? (
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: variant.color }}
                      />
                      <span>{variant.color}</span>
                    </div>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>{variant.sku}</TableCell>
                <TableCell>${variant.price.toFixed(2)}</TableCell>
                <TableCell>{variant.stockQuantity}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditVariant(variant)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteVariant(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingVariant ? "Edit Variant" : "Add New Variant"}
            </DialogTitle>
            <DialogDescription>
              Create a new product variant with size, color, and pricing options.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="size">Size (Optional)</Label>
              <Input
                id="size"
                placeholder="e.g., Small, Medium, Large"
                value={formData.size || ""}
                onChange={(e) =>
                  setFormData({ ...formData, size: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="color">Color (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color || "#000000"}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="w-16 h-10"
                />
                <Input
                  placeholder="Color name"
                  value={formData.color || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                placeholder="e.g., PROD-001-SM-BLK"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: parseFloat(e.target.value) })
                }
              />
            </div>

            <div>
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                type="number"
                placeholder="0"
                value={formData.stockQuantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stockQuantity: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveVariant}>
              {editingVariant ? "Update" : "Add"} Variant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
