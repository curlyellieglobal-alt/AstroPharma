import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "../../../shared/currency";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function Wishlist() {
  const { user } = useAuth();
  const { currency } = useCurrency();
  const { addItem } = useCart();
  
  const { data: wishlist, isLoading, refetch } = trpc.wishlist.list.useQuery(undefined, {
    enabled: !!user,
  });
  const removeMutation = trpc.wishlist.remove.useMutation();

  if (!user) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">My Wishlist</h1>
        <p className="text-muted-foreground mb-6">Please log in to view your wishlist</p>
        <Button asChild>
          <a href={getLoginUrl()}>Log In</a>
        </Button>
      </div>
    );
  }

  const handleRemove = async (productId: number, variantId?: number) => {
    try {
      await removeMutation.mutateAsync({ productId, variantId: variantId || undefined });
      toast.success("Removed from wishlist");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to remove item");
    }
  };

  const handleAddToCart = (item: any) => {
    const product = item.product;
    const variant = item.variant;
    
    addItem({
      id: product.id,
      name: product.name,
      price: variant?.price || product.price,
      image: variant?.imageUrl || product.images?.[0],
      currency: product.currency,
    }, 1);
    
    toast.success("Added to cart");
  };

  if (isLoading) {
    return (
      <div className="container py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-16">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>

      {wishlist && wishlist.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((item: any) => {
            const product = item.product;
            const variant = item.variant;
            const wishlistItem = item.wishlistItem;
            
            const currentPrice = variant?.price || product.price;
            const priceDropped = wishlistItem.priceWhenAdded && currentPrice < wishlistItem.priceWhenAdded;

            return (
              <div key={`${product.id}-${variant?.id || 0}`} className="border rounded-lg overflow-hidden">
                <Link href={`/products/${product.slug}`}>
                  <img
                    src={variant?.imageUrl || product.imageUrl || "/placeholder.jpg"}
                    alt={product.name}
                    className="w-full h-48 object-cover cursor-pointer hover:opacity-90"
                  />
                </Link>
                
                <div className="p-4 space-y-3">
                  <div>
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-semibold hover:underline cursor-pointer">
                        {product.name}
                      </h3>
                    </Link>
                    {variant && (
                      <p className="text-sm text-muted-foreground">
                        {variant.size && `Size: ${variant.size}`}
                        {variant.size && variant.color && " • "}
                        {variant.color && `Color: ${variant.color}`}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-lg font-bold">
                      {formatPrice(currentPrice, currency)}
                    </p>
                    {priceDropped && (
                      <p className="text-sm text-green-600 font-semibold">
                        Price dropped! Was {formatPrice(wishlistItem.priceWhenAdded, currency)}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleAddToCart(item)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemove(product.id, variant?.id)}
                      disabled={removeMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-6">Your wishlist is empty</p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
