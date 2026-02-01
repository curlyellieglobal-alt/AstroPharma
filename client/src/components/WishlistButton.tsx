import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

interface WishlistButtonProps {
  productId: number;
  variantId?: number;
  priceWhenAdded?: number;
  className?: string;
}

export function WishlistButton({ productId, variantId, priceWhenAdded, className }: WishlistButtonProps) {
  const { user } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);
  
  const { data: checkData, refetch } = trpc.wishlist.check.useQuery(
    { productId, variantId },
    { enabled: !!user }
  );
  
  const addMutation = trpc.wishlist.add.useMutation();
  const removeMutation = trpc.wishlist.remove.useMutation();

  useEffect(() => {
    if (checkData) {
      setIsInWishlist(checkData.inWishlist);
    }
  }, [checkData]);

  const handleToggle = async () => {
    if (!user) {
      window.location.href = getLoginUrl();
      return;
    }

    try {
      if (isInWishlist) {
        await removeMutation.mutateAsync({ productId, variantId });
        setIsInWishlist(false);
        toast.success("Removed from wishlist");
      } else {
        await addMutation.mutateAsync({ productId, variantId, priceWhenAdded });
        setIsInWishlist(true);
        toast.success("Added to wishlist");
      }
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Operation failed");
    }
  };

  const isPending = addMutation.isPending || removeMutation.isPending;

  return (
    <Button
      variant={isInWishlist ? "default" : "outline"}
      size="icon"
      onClick={handleToggle}
      disabled={isPending}
      className={className}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={`h-4 w-4 ${isInWishlist ? "fill-current" : ""}`} />
      )}
    </Button>
  );
}
