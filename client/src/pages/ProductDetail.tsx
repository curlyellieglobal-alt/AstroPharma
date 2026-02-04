import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useRoute } from "wouter";
import { Loader2, ShoppingCart, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useNotification } from "@/contexts/NotificationContext";
import { CurrencySelector } from "@/components/CurrencySelector";
import SocialShare from "@/components/SocialShare";
import type { Currency } from "@shared/currency";
import { Logo } from "@/components/Logo";
import { ProductImageCarousel } from "@/components/ProductImageCarousel";
import { SEO } from "@/components/SEO";
import { useEffect, useState } from "react";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:slug");
  const slug = params?.slug || "";
  
  const [quantity, setQuantity] = useState(1);
  const { data: product, isLoading } = trpc.products.getBySlug.useQuery({ slug });
  const { addItem } = useCart();
  const { formatPrice, currency, getPriceForCurrency } = useCurrency();
  const { addNotification } = useNotification();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Link href="/products">
          <Button>Back to Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        pagePath={`/products/${slug}`} 
        defaultTitle={`${product.name} - CurlyEllie`} 
        defaultDescription={product.description} 
      />
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <Logo className="h-10 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <CurrencySelector />
            <Link href="/cart">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <ProductImageCarousel images={product.images || []} />
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
              <p className="text-2xl font-bold text-primary">
                {formatPrice(product.price)}
              </p>
            </div>

            <div className="prose prose-sm max-w-none text-muted-foreground">
              {product.description}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-md">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button 
                className="flex-1 gap-2" 
                size="lg"
                onClick={() => {
                  addItem(product, quantity);
                  toast.success("Added to cart");
                }}
              >
                <ShoppingCart className="h-5 w-5" /> Add to Cart
              </Button>
            </div>

            <div className="pt-8 border-t">
              <SocialShare 
                url={window.location.href} 
                title={product.name} 
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
