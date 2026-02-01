import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Logo } from "@/components/Logo";
import { Loader2, Search, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { CurrencySelector } from "@/components/CurrencySelector";
import { toast } from "sonner";
import type { Currency } from "@shared/currency";

export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const { addItem, itemCount } = useCart();
  const { formatPrice, currency, getPriceForCurrency } = useCurrency();
  
  // Fetch products by currency
  const { data: products, isLoading } = trpc.products.listByCurrency.useQuery(
    { currency },
    { enabled: !!currency }
  );
  
  const { data: searchResults } = trpc.products.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 2 }
  );

  const displayProducts = searchQuery.length > 2 ? searchResults : products;

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
              <Link href="/products"><a className="text-primary font-medium">Products</a></Link>
              <Link href="/about"><a className="hover:text-primary transition-colors">About</a></Link>
              <Link href="/blog"><a className="hover:text-primary transition-colors">Blog</a></Link>
              <Link href="/contact"><a className="hover:text-primary transition-colors">Contact</a></Link>
              <CurrencySelector />
            </nav>
            <Link href="/cart">
              <Button variant="outline" size="sm">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart ({itemCount})
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Our Products</h1>
          <p className="text-gray-600 mb-6">Discover our range of premium health and wellness products</p>
          
          <div className="max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {displayProducts && displayProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {displayProducts.map((product) => (
                  <div key={product.id} className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    <Link href={`/products/${product.slug}`} className="block group">
                        {product.images && product.images[0] ? (
                          <div className="h-64 bg-gray-100 flex items-center justify-center">
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <div className="h-64 bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-400">No image</span>
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                          {product.shortDescription && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {product.shortDescription}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xl font-bold text-primary">
                                {formatPrice(getPriceForCurrency(product, currency), currency)}
                              </span>
                              {product.compareAtPrice && (
                                <span className="text-sm text-gray-400 line-through ml-2">
                                  {formatPrice(parseFloat(product.compareAtPrice), (product.currency as Currency) || "EGP")}
                                </span>
                              )}
                            </div>
                            {product.stockQuantity > 0 ? (
                              <span className="text-xs text-green-600">In Stock</span>
                            ) : (
                              <span className="text-xs text-red-600">Out of Stock</span>
                            )}
                          </div>
                        </div>
                    </Link>
                    <div className="px-4 pb-4">
                      <Button
                        className="w-full"
                        onClick={(e) => {
                          e.preventDefault();
                          addItem({
                            id: product.id,
                            name: product.name,
                            price: getPriceForCurrency(product, currency),
                            currency: currency,
                            image: product.images?.[0],
                            sku: product.sku || undefined,
                          });
                          toast.success(`${product.name} added to cart!`);
                        }}
                        disabled={product.stockQuantity <= 0}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {product.stockQuantity > 0 ? "Add to Cart" : "Out of Stock"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No products found</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
