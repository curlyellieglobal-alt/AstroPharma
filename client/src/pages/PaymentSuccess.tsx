import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle, MessageCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { generateOrderWhatsAppUrl } from "@/../../shared/whatsapp";

export default function PaymentSuccess() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1]);
  const orderId = searchParams.get('orderId');
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [autoRedirect, setAutoRedirect] = useState(false);

  const { data: whatsappPhone } = trpc.siteSettings.get.useQuery({ key: 'whatsapp_phone' });
  const { data: whatsappEnabled } = trpc.siteSettings.get.useQuery({ key: 'whatsapp_enabled' });
  const { data: whatsappTemplate } = trpc.siteSettings.get.useQuery({ key: 'whatsapp_message_template' });
  const { data: order } = trpc.orders.getById.useQuery(
    { id: orderId ? parseInt(orderId) : 0 },
    { enabled: !!orderId }
  );

  useEffect(() => {
    // Clear cart after successful payment
    localStorage.removeItem('cart');
  }, []);

  useEffect(() => {
    // Generate WhatsApp URL when settings and order are loaded
    if (whatsappPhone?.settingValue && whatsappTemplate?.settingValue && order) {
      const itemsList = order.items?.map(item => `${item.quantity}x ${item.productName}`).join(', ') || 'N/A';
      
      const shippingAddr = typeof order.shippingAddress === 'string' 
        ? order.shippingAddress 
        : order.shippingAddress 
          ? `${order.shippingAddress.line1}, ${order.shippingAddress.city}, ${order.shippingAddress.country}`
          : undefined;
      
      const whatsappUrl = generateOrderWhatsAppUrl(
        whatsappPhone.settingValue,
        whatsappTemplate.settingValue,
        {
          orderId: order.id.toString(),
          customerName: order.customerName,
          total: order.total,
          items: itemsList,
          shippingAddress: shippingAddr,
        }
      );
      
      setWhatsappUrl(whatsappUrl);
      
      // Auto-redirect if enabled
      if (whatsappEnabled?.settingValue === 'true' && !autoRedirect) {
        setAutoRedirect(true);
        // Delay redirect by 2 seconds to show success message
        setTimeout(() => {
          window.location.href = whatsappUrl;
        }, 2000);
      }
    }
  }, [whatsappPhone, whatsappTemplate, whatsappEnabled, order, autoRedirect]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-48 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600">
            Thank you for your purchase. Your order has been confirmed.
          </p>
        </div>

        {orderId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Order ID</p>
            <p className="text-lg font-mono font-semibold text-gray-900">
              {orderId}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            A confirmation email has been sent to your email address.
          </p>
          
          <div className="flex flex-col gap-3 mt-6">
            {whatsappUrl && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="w-full bg-green-600 hover:bg-green-700">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Continue to WhatsApp
                </Button>
              </a>
            )}
            
            {autoRedirect && whatsappUrl && (
              <p className="text-sm text-gray-500">
                Redirecting to WhatsApp in 2 seconds...
              </p>
            )}
            
            <Link href="/">
              <Button size="lg" variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
            
            <Link href="/products">
              <Button variant="outline" size="lg" className="w-full">
                View Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
