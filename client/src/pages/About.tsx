import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ShoppingCart } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function About() {
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
              <Link href="/about"><a className="text-primary font-medium">About</a></Link>
              <Link href="/blog"><a className="hover:text-primary transition-colors">Blog</a></Link>
              <Link href="/contact"><a className="hover:text-primary transition-colors">Contact</a></Link>
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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6">About Curly Ellie</h1>
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-600 leading-relaxed mb-6">
              Curly Ellie is dedicated to providing premium hair care solutions that help you achieve healthy, beautiful curls naturally.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              Our mission is to combine cutting-edge science with natural ingredients to create products that deliver real results. We believe in transparency, quality, and putting our customers' health first.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              Every product we offer is carefully researched, tested, and formulated to meet the highest standards of quality and efficacy. We work with leading experts in nutrition, medicine, and wellness to ensure that our products are both safe and effective.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Thank you for choosing Curly Ellie as your partner in hair care and wellness.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
