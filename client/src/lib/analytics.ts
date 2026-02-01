/**
 * Google Analytics 4 Integration
 * Tracks user interactions and conversions
 */

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const GA_ID = import.meta.env.VITE_GA_ID || "";

/**
 * Initialize Google Analytics 4
 */
export function initializeGA4() {
  if (!GA_ID) {
    console.warn("Google Analytics ID not configured");
    return;
  }

  // Create script tag for GA4
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];

  // Define gtag function
  function gtag(...args: any[]) {
    window.dataLayer.push(arguments);
  }

  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", GA_ID, {
    page_path: window.location.pathname,
    send_page_view: true,
  });
}

/**
 * Track page view
 */
export function trackPageView(pagePath: string, pageTitle?: string) {
  if (!window.gtag) return;

  window.gtag("event", "page_view", {
    page_path: pagePath,
    page_title: pageTitle || document.title,
  });
}

/**
 * Track event
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, any>
) {
  if (!window.gtag) return;

  window.gtag("event", eventName, eventParams || {});
}

/**
 * Track add to cart event
 */
export function trackAddToCart(
  productId: string,
  productName: string,
  price: number,
  quantity: number = 1
) {
  trackEvent("add_to_cart", {
    currency: "EGP",
    value: price * quantity,
    items: [
      {
        item_id: productId,
        item_name: productName,
        price: price,
        quantity: quantity,
      },
    ],
  });
}

/**
 * Track purchase event
 */
export function trackPurchase(
  orderId: string,
  totalValue: number,
  items: Array<{ id: string; name: string; price: number; quantity: number }>
) {
  trackEvent("purchase", {
    transaction_id: orderId,
    value: totalValue,
    currency: "EGP",
    items: items.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  });
}

/**
 * Track search event
 */
export function trackSearch(searchTerm: string) {
  trackEvent("search", {
    search_term: searchTerm,
  });
}

/**
 * Track form submission
 */
export function trackFormSubmission(formName: string) {
  trackEvent("form_submit", {
    form_name: formName,
  });
}

/**
 * Track user sign up
 */
export function trackSignUp(method: string = "email") {
  trackEvent("sign_up", {
    method: method,
  });
}

/**
 * Track user login
 */
export function trackLogin(method: string = "email") {
  trackEvent("login", {
    method: method,
  });
}

/**
 * Set user ID for cross-device tracking
 */
export function setUserId(userId: string) {
  if (!window.gtag) return;

  window.gtag("config", GA_ID, {
    user_id: userId,
  });
}

/**
 * Set user properties
 */
export function setUserProperties(properties: Record<string, any>) {
  if (!window.gtag) return;

  window.gtag("set", {
    user_properties: properties,
  });
}
