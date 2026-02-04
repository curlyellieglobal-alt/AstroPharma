import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Package, MapPin, CreditCard, MessageCircle, Home, Facebook } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { trpc } from "@/lib/trpc";

export default function OrderConfirmation() {
  const [location] = useLocation();
  const { formatPrice } = useCurrency();
  const [orderData, setOrderData] = useState<any>(null);
  const [whatsappPhone, setWhatsappPhone] = useState<string>("");
  const [facebookLink, setFacebookLink] = useState<string>("");

  // Fetch WhatsApp number and Facebook link from site settings
  const { data: whatsappPhoneSetting } = trpc.siteSettings.get.useQuery({ key: 'whatsapp_phone' });
  const { data: facebookLinkSetting } = trpc.siteSettings.get.useQuery({ key: 'facebook_link' });

  useEffect(() => {
    if (whatsappPhoneSetting?.settingValue) {
      setWhatsappPhone(whatsappPhoneSetting.settingValue);
    }
  }, [whatsappPhoneSetting]);

  useEffect(() => {
    if (facebookLinkSetting?.settingValue) {
      setFacebookLink(facebookLinkSetting.settingValue);
    }
  }, [facebookLinkSetting]);

  useEffect(() => {
    // Get order data from location state or localStorage
    const state = (window.history.state as any)?.orderData;
    if (state) {
      setOrderData(state);
      localStorage.setItem('lastOrder', JSON.stringify(state));
    } else {
      const lastOrder = localStorage.getItem('lastOrder');
      if (lastOrder) {
        setOrderData(JSON.parse(lastOrder));
      }
    }
  }, []);

  const handleWhatsAppClick = () => {
    if (!orderData || !whatsappPhone) return;

    const message = `Hello! I have a question about my order #${orderData.orderId}`;
    const cleanPhone = whatsappPhone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleFacebookClick = () => {
    if (facebookLink) {
      window.open(facebookLink, '_blank');
    }
  };

  const handleContactUs = () => {
    window.location.href = '/contact';
  };

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 text-center">
          <p className="text-gray-600 mb-4">No order data found</p>
          <Link href="/"><Button>Return to Home</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Order Successfully Placed!</h1>
          <p className="text-lg text-gray-600">Thank you for your purchase, {orderData.customerName}!</p>
        </div>

        {/* Order Details Card */}
        <Card className="max-w-3xl mx-auto p-8 mb-6">
          {/* Order ID */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="text-2xl font-bold text-primary">#{orderData.orderId}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Payment Status</p>
                <p className="text-lg font-semibold text-orange-600">
                  {orderData.paymentStatus || "Pending Confirmation"}
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Summary
            </h2>
            <div className="space-y-3">
              {orderData.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">{formatPrice(item.price * item.quantity, orderData.currency)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount</span>
                <span className="text-primary">{formatPrice(orderData.total, orderData.currency)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Method
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium capitalize">{orderData.paymentMethod.replace('_', ' ')}</p>
              {orderData.paymentProof && (
                <p className="text-sm text-green-600 mt-1">✓ Payment proof uploaded</p>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Delivery Address
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">{orderData.shippingAddress}</p>
              {orderData.customerPhone && (
                <p className="text-sm text-gray-600 mt-2">Phone: {orderData.customerPhone}</p>
              )}
            </div>
          </div>

          {/* Estimated Delivery */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Estimated Delivery:</strong> 3-5 business days
            </p>
            <p className="text-xs text-blue-600 mt-1">
              You will receive a confirmation email at {orderData.customerEmail}
            </p>
          </div>
        </Card>

        {/* Contact Options Section */}
        <Card className="max-w-3xl mx-auto p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Need Help? Contact Your Treating Physician</h3>
            <p className="text-gray-600 mb-6">
              You can reach out directly through:
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button 
                onClick={handleWhatsAppClick}
                disabled={!whatsappPhone}
                className="bg-green-600 hover:bg-green-700 flex-1 min-w-40"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              <Button 
                onClick={handleFacebookClick}
                disabled={!facebookLink}
                className="bg-blue-600 hover:bg-blue-700 flex-1 min-w-40"
              >
                <Facebook className="w-4 h-4 mr-2" />
                Facebook
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Click on your preferred contact method to reach out to us.
            </p>
          </div>
        </Card>

        {/* Return Home Button */}
        <div className="text-center mt-8">
          <Link href="/">
            <Button variant="ghost" size="lg">
              <Home className="w-4 h-4 mr-2" />
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
