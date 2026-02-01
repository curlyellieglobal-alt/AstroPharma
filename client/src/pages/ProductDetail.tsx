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
import { useEffect, useState } from "react";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:slug");
  const slug = params?.slug || "";
  
  const [quantity, setQuantity] = useState(1);
  const { data: product, isLoading } = trpc.products.getBySlug.useQuery({ slug });
  const { addItem } = useCart();
  const { formatPrice, currency, getPriceForCurrency } = useCurrency();
  const { addNotification } = useNotification();

  // Add structured data (Schema.org) for product
  useEffect(() => {
    if (!product) return;

    const schemaData = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "description": product.description || "Premium hair care product",
      "image": product.images || [],
      "brand": {
        "@type": "Brand",
        "name": "CurlyEllie"
      },
      "offers": {
        "@type": "Offer",
        "price": product.price,
        "priceCurrency": product.currency || "EGP",
        "availability": "https://schema.org/InStock"
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schemaData);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    
    const price = getPriceForCurrency(product, currency);
    addItem({
      id: product.id,
      name: product.name,
      price: price,
      currency: currency,
      image: product.images?.[0],
      sku: product.sku || undefined,
    }, quantity);
    
    addNotification({
      type: 'success',
      title: 'Added to Cart',
      message: `${product.name} has been added to your cart`,
      duration: 5000,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Link href="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <Link href="/">
              <a className="flex items-center">
                <Logo className="w-auto h-48 md:h-60 object-contain drop-shadow-lg" />
              </a>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/products"><a className="hover:text-primary transition-colors">Products</a></Link>
              <Link href="/about"><a className="hover:text-primary transition-colors">About</a></Link>
              <Link href="/blog"><a className="hover:text-primary transition-colors">Blog</a></Link>
              <Link href="/contact"><a className="hover:text-primary transition-colors">Contact</a></Link>
              <CurrencySelector />
            </nav>
            <Link href="/cart">
              <Button variant="outline" size="sm">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Product Image Carousel */}
            <div>
              <ProductImageCarousel
                images={product.images || []}
                productName={product.name}
              />
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
              
              {/* Social Share */}
              <div className="mb-4">
                <SocialShare
                  url={window.location.href}
                  title={product.name}
                  description={product.shortDescription || product.name}
                />
              </div>
              
              {product.shortDescription && (
                <p className="text-xl text-gray-600 mb-6">{product.shortDescription}</p>
              )}

              <div className="mb-6">
                <span className="text-4xl font-bold text-primary">
                  {formatPrice(
                    getPriceForCurrency(product, currency),
                    currency as Currency
                  )}
                </span>
                {product.compareAtPrice && (
                  <span className="text-xl text-gray-400 line-through ml-3">
                    {formatPrice(parseFloat(product.compareAtPrice), currency as Currency)}
                  </span>
                )}
              </div>

              {product.stockQuantity > 0 ? (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <span className="font-medium">Quantity:</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 text-center"
                        min="1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <span className="text-sm text-gray-500">
                      ({product.stockQuantity} available)
                    </span>
                  </div>

                  <Button size="lg" className="w-full mb-4" onClick={handleAddToCart}>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </Button>
                </>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-700 font-medium">Out of Stock</p>
                </div>
              )}

              {product.sku && (
                <p className="text-sm text-gray-500 mb-2">SKU: {product.sku}</p>
              )}

              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Description */}
          {product.description && (
            <div className="mt-12 border-t pt-8">
              <h2 className="text-2xl font-bold mb-4">Description</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
