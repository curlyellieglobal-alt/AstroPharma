import { useState } from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ShoppingCart, ChevronDown, ChevronUp } from "lucide-react";
import { Logo } from "@/components/Logo";
import { injectFAQSchema, SAMPLE_FAQS } from "@/lib/faqSchema";

interface FAQItem {
  id: string;
  question: string;
  articles: {
    title: string;
    content: string;
  }[];
}

interface FAQCategory {
  title: string;
  icon: string;
  items: FAQItem[];
}

const faqData: FAQCategory[] = [
  {
    title: "Shipping & Delivery",
    icon: "📦",
    items: [
      {
        id: "shipping-1",
        question: "How long does shipping take?",
        articles: [
          {
            title: "Standard Shipping",
            content: "Standard shipping typically takes 5-7 business days within the continental US. Orders are processed within 1-2 business days before shipment.",
          },
          {
            title: "Express Shipping",
            content: "Express shipping is available for 2-3 business day delivery. This option is available for most locations.",
          },
          {
            title: "International Shipping",
            content: "International orders typically take 10-15 business days. Customs clearance may add additional time.",
          },
        ],
      },
      {
        id: "shipping-2",
        question: "Do you ship internationally?",
        articles: [
          {
            title: "Supported Countries",
            content: "We ship to over 150 countries worldwide. Check our shipping page for the complete list of supported destinations.",
          },
          {
            title: "Customs & Duties",
            content: "International customers may be responsible for customs duties and taxes. These are calculated at checkout.",
          },
          {
            title: "Tracking",
            content: "All international shipments include tracking. You'll receive a tracking number via email.",
          },
        ],
      },
      {
        id: "shipping-3",
        question: "What are the shipping costs?",
        articles: [
          {
            title: "Free Shipping",
            content: "Free shipping is available on orders over $50 within the US.",
          },
          {
            title: "Flat Rate Shipping",
            content: "Orders under $50 have a flat rate of $5.99 for standard shipping.",
          },
          {
            title: "Express Shipping Rates",
            content: "Express shipping starts at $14.99 for orders up to $100.",
          },
        ],
      },
    ],
  },
  {
    title: "Returns & Refunds",
    icon: "↩️",
    items: [
      {
        id: "returns-1",
        question: "What is your return policy?",
        articles: [
          {
            title: "30-Day Return Policy",
            content: "We offer a hassle-free 30-day return policy. Items must be unused and in original packaging.",
          },
          {
            title: "Return Conditions",
            content: "Products must be in resalable condition. Opened or used items may not be eligible for return.",
          },
          {
            title: "Exceptions",
            content: "Some items like clearance or final sale products cannot be returned. Check product details for restrictions.",
          },
        ],
      },
      {
        id: "returns-2",
        question: "How do I request a refund?",
        articles: [
          {
            title: "Initiate a Return",
            content: "Go to your order history and click 'Return Item'. Follow the instructions to generate a return label.",
          },
          {
            title: "Ship Your Return",
            content: "Pack your item securely and use the provided return label. Most carriers offer free pickup.",
          },
          {
            title: "Refund Timeline",
            content: "Refunds are processed within 5-7 business days of receiving your return.",
          },
        ],
      },
    ],
  },
  {
    title: "Payment & Security",
    icon: "🔒",
    items: [
      {
        id: "payment-1",
        question: "What payment methods do you accept?",
        articles: [
          {
            title: "Credit & Debit Cards",
            content: "We accept Visa, Mastercard, American Express, and Discover cards.",
          },
          {
            title: "Digital Wallets",
            content: "Apple Pay, Google Pay, and PayPal are accepted for faster checkout.",
          },
          {
            title: "Local Payment Methods",
            content: "We support local payment methods including Fawry, Vodafone Cash, InstaPay, and Payoneer.",
          },
          {
            title: "Cash on Delivery",
            content: "Cash on Delivery is available for select locations.",
          },
        ],
      },
      {
        id: "payment-2",
        question: "Is my payment information secure?",
        articles: [
          {
            title: "SSL Encryption",
            content: "All transactions are protected by 256-bit SSL encryption. Your data is secure.",
          },
          {
            title: "PCI Compliance",
            content: "We are PCI DSS compliant. Your payment information is never stored on our servers.",
          },
          {
            title: "Fraud Protection",
            content: "We use advanced fraud detection systems to protect your account and transactions.",
          },
          {
            title: "Privacy Policy",
            content: "Your personal information is never shared with third parties without your consent.",
          },
        ],
      },
    ],
  },
];

export default function FAQ() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  useEffect(() => {
    // Inject FAQ schema for SEO
    injectFAQSchema(SAMPLE_FAQS);
  }, []);

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
          <h1 className="text-4xl font-bold mb-4 text-center">Frequently Asked Questions</h1>
          <p className="text-center text-gray-600 mb-12">
            Find answers to common questions about shipping, returns, payments, and more.
          </p>

          <div className="space-y-8">
            {faqData.map((category) => (
              <div key={category.title}>
                <div
                  className="flex items-center gap-3 mb-4 cursor-pointer group"
                  onClick={() =>
                    setExpandedCategory(
                      expandedCategory === category.title ? null : category.title
                    )
                  }
                >
                  <span className="text-3xl">{category.icon}</span>
                  <h2 className="text-2xl font-bold text-gray-900 group-hover:text-pink-600 transition-colors">
                    {category.title}
                  </h2>
                  <div className="ml-auto">
                    {expandedCategory === category.title ? (
                      <ChevronUp className="h-6 w-6 text-pink-600" />
                    ) : (
                      <ChevronDown className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                </div>

                <div className="border-b-2 border-pink-600 mb-4" />

                {expandedCategory === category.title && (
                  <div className="space-y-3 mb-6">
                    {category.items.map((item) => (
                      <Card key={item.id} className="overflow-hidden">
                        <button
                          onClick={() =>
                            setExpandedItem(
                              expandedItem === item.id ? null : item.id
                            )
                          }
                          className="w-full px-6 py-4 text-left font-semibold text-gray-900 hover:bg-gray-50 transition-colors flex items-center justify-between"
                        >
                          <span>{item.question}</span>
                          {expandedItem === item.id ? (
                            <ChevronUp className="h-5 w-5 text-pink-600" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          )}
                        </button>

                        {expandedItem === item.id && (
                          <CardContent className="px-6 py-4 bg-gray-50 space-y-4 border-t">
                            {item.articles.map((article, idx) => (
                              <div key={idx} className="space-y-2">
                                <h4 className="font-semibold text-gray-900">
                                  {article.title}
                                </h4>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                  {article.content}
                                </p>
                              </div>
                            ))}
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 p-8 bg-pink-50 rounded-lg text-center">
            <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
            <p className="text-gray-600 mb-4">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <Link href="/contact">
              <Button size="lg" className="bg-pink-600 hover:bg-pink-700">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
