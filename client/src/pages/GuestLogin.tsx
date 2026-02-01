import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { AlertCircle, ShoppingCart, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function GuestLogin() {
  const [, setLocation] = useLocation();
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  const handleGuestLogin = () => {
    if (!guestName.trim() || !guestEmail.trim()) {
      alert("Please enter your name and email");
      return;
    }

    // Store guest info in localStorage
    localStorage.setItem("guestUser", JSON.stringify({
      name: guestName,
      email: guestEmail,
      isGuest: true,
    }));

    // Redirect to products
    setLocation("/products");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <Link href="/">
              <a className="flex items-center">
                <Logo className="w-auto h-48 md:h-60 object-contain drop-shadow-lg" />
              </a>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          {/* OAuth Error Alert */}
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900">OAuth Configuration Pending</p>
                  <p className="text-sm text-amber-800 mt-1">
                    User authentication is being configured. In the meantime, you can browse and shop as a guest!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guest Login Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Continue as Guest</CardTitle>
              <CardDescription>
                Browse our products and complete your purchase without creating an account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Full Name
                </label>
                <Input
                  placeholder="Enter your name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Email Address
                </label>
                <Input
                  placeholder="your@email.com"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full"
                />
              </div>

              <Button
                onClick={handleGuestLogin}
                className="w-full bg-rose-600 hover:bg-rose-700 h-10"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Start Shopping
              </Button>

              <div className="text-center pt-4 border-t">
                <p className="text-sm text-gray-600 mb-3">
                  Want to create an account later?
                </p>
                <p className="text-xs text-gray-500">
                  You can create an account anytime after OAuth is configured
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Info Box */}
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <p className="text-sm text-blue-900">
                <strong>✓ Full Access:</strong> Browse products, add to cart, and checkout
              </p>
              <p className="text-sm text-blue-900 mt-2">
                <strong>✓ All Features:</strong> Live chat, wishlist, and order tracking
              </p>
              <p className="text-sm text-blue-900 mt-2">
                <strong>✓ No Registration:</strong> Shop immediately without creating an account
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
