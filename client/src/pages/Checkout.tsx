import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useLocation } from "wouter";
import { ShoppingCart, Loader2, CreditCard, Wallet, Banknote, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useNotificationHelper } from "@/hooks/useNotificationHelper";
import { CurrencySelector } from "@/components/CurrencySelector";
import { StripePayment } from "@/components/StripePayment";
import { VodafoneCashPayment } from "@/components/VodafoneCashPayment";
import { CODPayment } from "@/components/CODPayment";
import { FawryPayment } from "@/components/FawryPayment";
import { InstaPayPayment } from "@/components/InstaPayPayment";
import { Logo } from "@/components/Logo";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items: cart, total, clearCart, itemCount } = useCart();
  const { formatPrice } = useCurrency();
  const notify = useNotificationHelper();
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    countryCode: "+20",
    customerPhone: "",
    shippingLine1: "",
    shippingLine2: "",
    shippingCity: "",
    shippingState: "",
    shippingPostalCode: "",
    shippingCountry: "US",
    paymentMethod: "stripe",
  });

  // Country codes list
  const countryCodes = [
    { code: "+1", country: "United States" },
    { code: "+20", country: "Egypt" },
    { code: "+966", country: "Saudi Arabia" },
    { code: "+971", country: "United Arab Emirates" },
    { code: "+44", country: "United Kingdom" },
    { code: "+33", country: "France" },
    { code: "+49", country: "Germany" },
    { code: "+39", country: "Italy" },
    { code: "+34", country: "Spain" },
    { code: "+31", country: "Netherlands" },
    { code: "+32", country: "Belgium" },
    { code: "+43", country: "Austria" },
    { code: "+41", country: "Switzerland" },
    { code: "+45", country: "Denmark" },
    { code: "+46", country: "Sweden" },
    { code: "+47", country: "Norway" },
    { code: "+48", country: "Poland" },
    { code: "+61", country: "Australia" },
    { code: "+64", country: "New Zealand" },
    { code: "+81", country: "Japan" },
    { code: "+86", country: "China" },
    { code: "+91", country: "India" },
    { code: "+55", country: "Brazil" },
    { code: "+52", country: "Mexico" },
    { code: "+27", country: "South Africa" },
  ];

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isCouponLoading, setIsCouponLoading] = useState(false);

  const validateCouponMutation = trpc.coupons.validate.useMutation({
    onSuccess: (result) => {
      if (result.valid) {
        setAppliedCoupon(result.coupon);
        setDiscountAmount(result.discountAmount || 0);
        notify.success('Coupon Applied', `You saved ${formatPrice(result.discountAmount || 0, cart[0]?.currency || "EGP")}`);
      } else {
        notify.error('Invalid Coupon', result.error || "This coupon code is not valid");
      }
      setIsCouponLoading(false);
    },
    onError: (error) => {
      notify.error('Error', error.message || "Failed to validate coupon");
      setIsCouponLoading(false);
    },
  });

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    setIsCouponLoading(true);
    validateCouponMutation.mutate({
      code: couponCode,
      userId: undefined,
      cartTotal: total,
      productIds: cart.map(item => item.id),
      categoryIds: [],
    });
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode("");
    toast.info("Coupon removed");
  };

  const finalTotal = total - (discountAmount || 0);

  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: (order) => {
      clearCart();
      toast.success("Order placed successfully!");
      
      // Prepare order data for confirmation page
      const orderData = {
        orderId: order.orderId,
        orderNumber: order.orderNumber,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        shippingAddress: `${formData.shippingLine1}, ${formData.shippingLine2 ? formData.shippingLine2 + ', ' : ''}${formData.shippingCity}, ${formData.shippingState}, ${formData.shippingPostalCode}, ${formData.shippingCountry}`,
        paymentMethod: formData.paymentMethod,
        paymentStatus: "Pending",
        total: finalTotal,
        currency: cart[0]?.currency || "EGP",
        items: cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      };
      
      // Redirect to order confirmation page with order data
      setLocation("/order-confirmation", { state: { orderData } });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to place order");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.customerName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!formData.customerEmail.trim()) {
      toast.error('Please enter your email');
      return;
    }
    if (!formData.customerPhone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }
    // Validate phone format (at least 7 digits)
    const phoneDigits = formData.customerPhone.replace(/\D/g, '');
    if (phoneDigits.length < 7) {
      toast.error('Please enter a valid phone number (at least 7 digits)');
      return;
    }
    if (!formData.shippingLine1.trim()) {
      toast.error('Please enter your shipping address');
      return;
    }
    if (!formData.shippingCity.trim()) {
      toast.error('Please enter your city');
      return;
    }
    if (!formData.shippingPostalCode.trim()) {
      toast.error('Please enter your postal code');
      return;
    }
    
    // For Stripe, we don't create order immediately
    // Order is created after successful payment
    if (formData.paymentMethod === 'stripe') {
      // Stripe payment will be handled by StripePayment component
      return;
    }
    
    // For other payment methods, create order immediately
    try {
      await createOrderMutation.mutateAsync({
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price.toString(),
        })),
        customerName: formData.customerName,
        email: formData.customerEmail,
        phone: `${formData.countryCode}${formData.customerPhone}`,
        shippingAddress: `${formData.shippingLine1}, ${formData.shippingLine2 ? formData.shippingLine2 + ', ' : ''}${formData.shippingCity}, ${formData.shippingState}, ${formData.shippingPostalCode}, ${formData.shippingCountry}`,
        paymentMethod: formData.paymentMethod,
        paymentProvider: formData.paymentMethod as any,
      });
    } catch (error: any) {
      // Error handled in onError
    }
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
              <CurrencySelector />
            </nav>
            <Link href="/cart"><Button variant="outline" size="sm"><ShoppingCart className="h-4 w-4 mr-2" />Cart ({itemCount})</Button></Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div><Label htmlFor="name">Full Name *</Label><Input id="name" value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})} required /></div>
                <div><Label htmlFor="email">Email *</Label><Input id="email" type="email" value={formData.customerEmail} onChange={(e) => setFormData({...formData, customerEmail: e.target.value})} required /></div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="flex gap-2">
                    <Select value={formData.countryCode} onValueChange={(value) => setFormData({...formData, countryCode: value})}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countryCodes.map((item) => (
                          <SelectItem key={item.code} value={item.code}>
                            {item.code} {item.country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="123456789"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                      required
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Format: {formData.countryCode} followed by your phone number</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              <RadioGroup value={formData.paymentMethod} onValueChange={(value) => setFormData({...formData, paymentMethod: value})}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="stripe" id="stripe" />
                    <Label htmlFor="stripe" className="flex items-center gap-2 cursor-pointer flex-1">
                      <CreditCard className="w-5 h-5" />
                      <span>Credit/Debit Card (Stripe)</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="fawry" id="fawry" />
                    <Label htmlFor="fawry" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Wallet className="w-5 h-5" />
                      <span>Fawry</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="payoneer" id="payoneer" />
                    <Label htmlFor="payoneer" className="flex items-center gap-2 cursor-pointer flex-1">
                      <CreditCard className="w-5 h-5" />
                      <span>Payoneer</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="instapay" id="instapay" />
                    <Label htmlFor="instapay" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Smartphone className="w-5 h-5" />
                      <span>InstaPay</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="vodafone_cash" id="vodafone_cash" />
                    <Label htmlFor="vodafone_cash" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Smartphone className="w-5 h-5 text-red-600" />
                      <span>Vodafone Cash</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Banknote className="w-5 h-5" />
                      <span>Cash on Delivery</span>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div><Label htmlFor="line1">Address Line 1 *</Label><Input id="line1" value={formData.shippingLine1} onChange={(e) => setFormData({...formData, shippingLine1: e.target.value})} required /></div>
                <div><Label htmlFor="line2">Address Line 2</Label><Input id="line2" value={formData.shippingLine2} onChange={(e) => setFormData({...formData, shippingLine2: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label htmlFor="city">City *</Label><Input id="city" value={formData.shippingCity} onChange={(e) => setFormData({...formData, shippingCity: e.target.value})} required /></div>
                  <div><Label htmlFor="state">State *</Label><Input id="state" value={formData.shippingState} onChange={(e) => setFormData({...formData, shippingState: e.target.value})} required /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label htmlFor="postal">Postal Code *</Label><Input id="postal" value={formData.shippingPostalCode} onChange={(e) => setFormData({...formData, shippingPostalCode: e.target.value})} required /></div>
                  <div><Label htmlFor="country">Country *</Label><Input id="country" value={formData.shippingCountry} onChange={(e) => setFormData({...formData, shippingCountry: e.target.value})} required /></div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              {/* Coupon Code Input */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <Label htmlFor="coupon" className="text-sm font-medium mb-2 block">Have a coupon code?</Label>
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <Input
                      id="coupon"
                      placeholder="Enter code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      disabled={isCouponLoading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleApplyCoupon}
                      disabled={isCouponLoading || !couponCode.trim()}
                    >
                      {isCouponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                    <div>
                      <p className="font-mono font-semibold text-green-700">{appliedCoupon.code}</p>
                      <p className="text-xs text-green-600">
                        {appliedCoupon.discountType === "percentage"
                          ? `${appliedCoupon.discountValue}% off`
                          : `${formatPrice(appliedCoupon.discountValue, cart[0]?.currency || "EGP")} off`}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveCoupon}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(total, cart[0]?.currency || "EGP")}</span></div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>-{formatPrice(discountAmount, cart[0]?.currency || "EGP")}</span>
                  </div>
                )}
                <div className="flex justify-between"><span>Shipping</span><span>Free</span></div>
                <div className="border-t pt-4"><div className="flex justify-between text-lg font-bold"><span>Total</span><span>{formatPrice(finalTotal, cart[0]?.currency || "EGP")}</span></div></div>
              </div>
              {formData.paymentMethod === 'stripe' && (
                <StripePayment
                  amount={finalTotal}
                  currency="usd"
                  customerEmail={formData.customerEmail}
                />
              )}
              
              {formData.paymentMethod === 'vodafone_cash' && (
                <VodafoneCashPayment
                  amount={total}
                  onSuccess={(receiptUrl) => {
                    // Handle receipt upload success
                    toast.success("Receipt uploaded! Processing order...");
                    // Submit form with receipt URL
                    handleSubmit(new Event('submit') as any);
                  }}
                />
              )}
              
              {formData.paymentMethod === 'cod' && (
                <CODPayment
                  amount={total}
                  onConfirm={() => handleSubmit(new Event('submit') as any)}
                />
              )}
              
              {formData.paymentMethod === 'fawry' && (
                <FawryPayment
                  amount={total}
                  orderId={undefined}
                  onConfirm={() => handleSubmit(new Event('submit') as any)}
                />
              )}
              
              {formData.paymentMethod === 'instapay' && (
                <InstaPayPayment
                  amount={total}
                  orderId={undefined}
                  onConfirm={() => handleSubmit(new Event('submit') as any)}
                />
              )}
              
              {!['stripe', 'vodafone_cash', 'cod', 'fawry', 'instapay'].includes(formData.paymentMethod) && (
                <Button type="submit" size="lg" className="w-full" disabled={createOrderMutation.isPending}>
                  {createOrderMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Place Order
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
