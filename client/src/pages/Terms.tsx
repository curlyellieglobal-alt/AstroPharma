import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ShoppingCart } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function Terms() {
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
          <h1 className="text-4xl font-bold mb-6">Terms & Conditions</h1>
          <div className="prose max-w-none">
            <p className="text-gray-700 mb-4">Last updated: {new Date().toLocaleDateString()}</p>
            <h2 className="text-2xl font-semibold mt-6 mb-4">Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">By accessing and using this website, you accept and agree to be bound by these terms and conditions.</p>
            <h2 className="text-2xl font-semibold mt-6 mb-4">Use of Website</h2>
            <p className="text-gray-700 mb-4">You may use our website for lawful purposes only. You must not use our website in any way that causes damage to the website or impairs its availability.</p>
            <h2 className="text-2xl font-semibold mt-6 mb-4">Product Information</h2>
            <p className="text-gray-700 mb-4">We strive to provide accurate product information, but we do not warrant that product descriptions or other content is accurate, complete, or error-free.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
