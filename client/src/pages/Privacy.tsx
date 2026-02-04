import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ShoppingCart } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function Privacy() {
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
        <div className="max-w-4xl mx-auto bg-white rounded-lg p-8">
          <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
          <div className="prose max-w-none">
            <p className="text-gray-700 mb-4">Last updated: {new Date().toLocaleDateString()}</p>
            <h2 className="text-2xl font-semibold mt-6 mb-4">Information We Collect</h2>
            <p className="text-gray-700 mb-4">We collect information you provide directly to us when you create an account, make a purchase, or contact us.</p>
            <h2 className="text-2xl font-semibold mt-6 mb-4">How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">We use the information we collect to process orders, communicate with you, and improve our services.</p>
            <h2 className="text-2xl font-semibold mt-6 mb-4">Data Security</h2>
            <p className="text-gray-700 mb-4">We implement appropriate security measures to protect your personal information.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
