import { trpc } from "@/lib/trpc";
import { Facebook, Instagram, Twitter, Linkedin, MapPin, Phone, Mail, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";

function FAQAccordionItem({ item }: { item: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden transition-all hover:border-rose-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900 text-sm">
          {item.question}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-rose-600 transition-transform flex-shrink-0 ml-2 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <p className="text-gray-600 leading-relaxed text-sm">
            {item.answer}
          </p>
          {item.linkUrl && item.linkText && (
            <a
              href={item.linkUrl}
              className="text-rose-600 hover:underline inline-block mt-2 text-sm font-medium"
            >
              {item.linkText} →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function Footer() {
  const { data: footerData } = trpc.footer.get.useQuery();
  const { data: faqMenus } = trpc.faq.getVisibleMenusWithItems.useQuery();

  const socialLinks = [
    { icon: Facebook, url: footerData?.facebookUrl, label: "Facebook" },
    { icon: Instagram, url: footerData?.instagramUrl, label: "Instagram" },
    { icon: Twitter, url: footerData?.twitterUrl, label: "Twitter/X" },
    { icon: Linkedin, url: footerData?.linkedinUrl, label: "LinkedIn" },
  ].filter(link => link.url && link.url.trim() !== "");

  const policyLinks = [
    { label: "Privacy Policy", url: footerData?.privacyPolicyUrl },
    { label: "Terms of Service", url: footerData?.termsOfServiceUrl },
    { label: "Refund Policy", url: footerData?.refundPolicyUrl },
  ].filter(link => link.url && link.url.trim() !== "");

  const hasContactInfo = footerData?.address || footerData?.phone || footerData?.email;
  const hasSocialLinks = socialLinks.length > 0;
  const hasPolicyLinks = policyLinks.length > 0;

  return (
    <>
      {/* FAQ Section Above Footer */}
      {faqMenus && faqMenus.length > 0 && (
        <div className="bg-white section-padding-sm border-t">
          <div className="container-wide">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {faqMenus.map((menu) => (
                <div key={menu.id} className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900 pb-2 border-b-2 border-rose-600">
                    {menu.title}
                  </h3>
                  <div className="space-y-3">
                    {menu.items.map((item) => (
                      <FAQAccordionItem key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-white text-lg font-semibold">
              {footerData?.companyName || "Company Name"}
            </h3>
            {footerData?.companyDescription && (
              <p className="text-sm leading-relaxed">
                {footerData.companyDescription}
              </p>
            )}
          </div>

          {/* Contact Information */}
          {hasContactInfo && (
            <div className="space-y-4">
              <h3 className="text-white text-lg font-semibold">Contact Us</h3>
              <div className="space-y-3">
                {footerData?.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                    <p className="text-sm">{footerData.address}</p>
                  </div>
                )}
                {footerData?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400 shrink-0" />
                    <a
                      href={`tel:${footerData.phone}`}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {footerData.phone}
                    </a>
                  </div>
                )}
                {footerData?.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400 shrink-0" />
                    <a
                      href={`mailto:${footerData.email}`}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {footerData.email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Policy Links */}
          {hasPolicyLinks && (
            <div className="space-y-4">
              <h3 className="text-white text-lg font-semibold">Legal</h3>
              <ul className="space-y-2">
                {policyLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.url}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-white text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/products" className="text-sm hover:text-white transition-colors">
                  All Products
                </a>
              </li>
              <li>
                <a href="/about" className="text-sm hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/blog" className="text-sm hover:text-white transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="/contact" className="text-sm hover:text-white transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="/faq" className="text-sm hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div className="space-y-4">
            <h3 className="text-white text-lg font-semibold">Newsletter</h3>
            <p className="text-sm">Subscribe to get updates on new products and special offers.</p>
            <NewsletterForm />
          </div>

          {/* Social Media */}
          {hasSocialLinks && (
            <div className="space-y-4">
              <h3 className="text-white text-lg font-semibold">Follow Us</h3>
              <div className="flex gap-4">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 w-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
                    aria-label={link.label}
                  >
                    <link.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-sm">
            {footerData?.copyrightText || `© ${new Date().getFullYear()} All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
    </>
  );
}


function NewsletterForm() {
  const [email, setEmail] = useState("");
  const subscribeMutation = trpc.newsletter.subscribe.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      const result = await subscribeMutation.mutateAsync({ email });
      toast.success(result.message);
      setEmail(""); // Clear input on success
    } catch (error: any) {
      toast.error(error.message || "Failed to subscribe");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-gray-600"
        disabled={subscribeMutation.isPending}
      />
      <Button
        type="submit"
        disabled={subscribeMutation.isPending}
        className="shrink-0"
      >
        {subscribeMutation.isPending ? "..." : "Subscribe"}
      </Button>
    </form>
  );
}
