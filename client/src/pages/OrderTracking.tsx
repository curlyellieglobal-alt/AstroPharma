import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { ShoppingCart, Loader2, Package } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function OrderTracking() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [searchTriggered, setSearchTriggered] = useState(false);
  
  const { data: order, isLoading } = trpc.orders.getByNumber.useQuery(
    { orderNumber, email },
    { enabled: searchTriggered && orderNumber.length > 0 && email.length > 0 }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTriggered(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
            </nav>
            <Link href="/cart"><Button variant="outline" size="sm"><ShoppingCart className="h-4 w-4 mr-2" />Cart</Button></Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Track Your Order</h1>
          
          <div className="bg-white rounded-lg p-8 mb-8">
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <Label htmlFor="orderNumber">Order Number</Label>
                <Input
                  id="orderNumber"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Enter your order number"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <Button type="submit" size="lg" className="w-full">Track Order</Button>
            </form>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {searchTriggered && !isLoading && !order && (
            <div className="bg-white rounded-lg p-8 text-center">
              <Package className="h-48 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No order found with this number</p>
            </div>
          )}

          {order && (
            <div className="bg-white rounded-lg p-8">
              <h2 className="text-2xl font-semibold mb-6">Order Details</h2>
              <div className="space-y-4">
                <div className="flex justify-between"><span className="text-gray-600">Order Number:</span><span className="font-semibold">{order.orderNumber}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Status:</span><span className="font-semibold capitalize">{order.status}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Payment Status:</span><span className="font-semibold capitalize">{order.paymentStatus}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Total:</span><span className="font-semibold">${order.total}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Order Date:</span><span className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
