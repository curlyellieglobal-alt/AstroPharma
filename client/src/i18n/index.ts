import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Navigation
      home: 'Home',
      products: 'Products',
      about: 'About',
      blog: 'Blog',
      contact: 'Contact',
      cart: 'Cart',
      wishlist: 'Wishlist',
      login: 'Login',
      logout: 'Logout',
      admin: 'Admin',
      
      // Products
      addToCart: 'Add to Cart',
      buyNow: 'Buy Now',
      outOfStock: 'Out of Stock',
      inStock: 'In Stock',
      price: 'Price',
      quantity: 'Quantity',
      total: 'Total',
      
      // Cart
      yourCart: 'Your Cart',
      emptyCart: 'Your cart is empty',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      tax: 'Tax',
      checkout: 'Checkout',
      continueShopping: 'Continue Shopping',
      
      // Checkout
      shippingAddress: 'Shipping Address',
      billingAddress: 'Billing Address',
      paymentMethod: 'Payment Method',
      placeOrder: 'Place Order',
      orderSummary: 'Order Summary',
      
      // Payment Methods
      creditCard: 'Credit Card',
      cashOnDelivery: 'Cash on Delivery',
      fawry: 'Fawry',
      instaPay: 'InstaPay',
      vodafoneCash: 'Vodafone Cash',
      
      // Orders
      orderConfirmation: 'Order Confirmation',
      orderNumber: 'Order Number',
      orderStatus: 'Order Status',
      trackOrder: 'Track Order',
      
      // Reviews
      reviews: 'Reviews',
      writeReview: 'Write a Review',
      rating: 'Rating',
      
      // Common
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      close: 'Close',
      submit: 'Submit',
      
      // Footer
      quickLinks: 'Quick Links',
      customerService: 'Customer Service',
      followUs: 'Follow Us',
      newsletter: 'Newsletter',
      subscribeNewsletter: 'Subscribe to our newsletter',
      
      // Chat
      liveChat: 'Live Chat',
      sendMessage: 'Send Message',
      typeMessage: 'Type a message...',
    }
  },
  ar: {
    translation: {
      // Navigation
      home: 'الرئيسية',
      products: 'المنتجات',
      about: 'عن الموقع',
      blog: 'المدونة',
      contact: 'اتصل بنا',
      cart: 'السلة',
      wishlist: 'المفضلة',
      login: 'تسجيل الدخول',
      logout: 'تسجيل الخروج',
      admin: 'لوحة التحكم',
      
      // Products
      addToCart: 'أضف للسلة',
      buyNow: 'اشتري الآن',
      outOfStock: 'غير متوفر',
      inStock: 'متوفر',
      price: 'السعر',
      quantity: 'الكمية',
      total: 'الإجمالي',
      
      // Cart
      yourCart: 'سلة التسوق',
      emptyCart: 'سلة التسوق فارغة',
      subtotal: 'المجموع الفرعي',
      shipping: 'الشحن',
      tax: 'الضريبة',
      checkout: 'إتمام الشراء',
      continueShopping: 'متابعة التسوق',
      
      // Checkout
      shippingAddress: 'عنوان الشحن',
      billingAddress: 'عنوان الفاتورة',
      paymentMethod: 'طريقة الدفع',
      placeOrder: 'تأكيد الطلب',
      orderSummary: 'ملخص الطلب',
      
      // Payment Methods
      creditCard: 'بطاقة ائتمان',
      cashOnDelivery: 'الدفع عند الاستلام',
      fawry: 'فوري',
      instaPay: 'انستاباي',
      vodafoneCash: 'فودافون كاش',
      
      // Orders
      orderConfirmation: 'تأكيد الطلب',
      orderNumber: 'رقم الطلب',
      orderStatus: 'حالة الطلب',
      trackOrder: 'تتبع الطلب',
      
      // Reviews
      reviews: 'التقييمات',
      writeReview: 'اكتب تقييم',
      rating: 'التقييم',
      
      // Common
      search: 'بحث',
      filter: 'تصفية',
      sort: 'ترتيب',
      loading: 'جاري التحميل...',
      error: 'خطأ',
      success: 'نجاح',
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      view: 'عرض',
      close: 'إغلاق',
      submit: 'إرسال',
      
      // Footer
      quickLinks: 'روابط سريعة',
      customerService: 'خدمة العملاء',
      followUs: 'تابعنا',
      newsletter: 'النشرة البريدية',
      subscribeNewsletter: 'اشترك في نشرتنا البريدية',
      
      // Chat
      liveChat: 'الدردشة المباشرة',
      sendMessage: 'إرسال رسالة',
      typeMessage: 'اكتب رسالة...',
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
