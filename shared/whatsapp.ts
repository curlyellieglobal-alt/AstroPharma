/**
 * WhatsApp utility functions for generating redirect URLs
 */

export interface WhatsAppMessageParams {
  orderId: string;
  customerName: string;
  total: string;
  items: string;
  shippingAddress?: string;
}

/**
 * Generate WhatsApp redirect URL with pre-filled message
 * @param phoneNumber - WhatsApp business phone number (with country code, e.g., +201234567890)
 * @param message - Pre-filled message text
 * @returns WhatsApp URL for redirect
 */
export function generateWhatsAppUrl(phoneNumber: string, message: string): string {
  // Remove any non-numeric characters except +
  const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
  
  // Encode the message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // Use wa.me API for universal compatibility (works on mobile and desktop)
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Format order details into WhatsApp message using template
 * @param template - Message template with placeholders
 * @param params - Order details to fill in
 * @returns Formatted message
 */
export function formatWhatsAppMessage(template: string, params: WhatsAppMessageParams): string {
  return template
    .replace('{orderId}', params.orderId)
    .replace('{customerName}', params.customerName)
    .replace('{total}', params.total)
    .replace('{items}', params.items)
    .replace('{shippingAddress}', params.shippingAddress || 'N/A');
}

/**
 * Generate complete WhatsApp redirect URL with order details
 * @param phoneNumber - WhatsApp business phone number
 * @param template - Message template
 * @param orderDetails - Order information
 * @returns Complete WhatsApp URL
 */
export function generateOrderWhatsAppUrl(
  phoneNumber: string,
  template: string,
  orderDetails: WhatsAppMessageParams
): string {
  const message = formatWhatsAppMessage(template, orderDetails);
  return generateWhatsAppUrl(phoneNumber, message);
}
