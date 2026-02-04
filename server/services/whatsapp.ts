/**
 * WhatsApp Service
 * Handles sending order confirmations and updates via WhatsApp
 * Uses Twilio WhatsApp API
 */

import { sendOrderConfirmationSms, sendOrderStatusSms, getTwilioClient } from './twilio';

export interface OrderNotification {
  phoneNumber: string;
  orderNumber: string;
  items: Array<{ name: string; quantity: number; price: string }>;
  total: string;
  currency: string;
}

export interface OrderStatusUpdate {
  phoneNumber: string;
  orderNumber: string;
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingUrl?: string;
  estimatedDelivery?: string;
}

/**
 * Send order confirmation via WhatsApp
 */
export async function sendOrderConfirmationWhatsApp(
  notification: OrderNotification
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const itemsList = notification.items
      .map((item) => `• ${item.name} x${item.quantity} - ${item.price}`)
      .join('\n');

    const message = `🎉 *Order Confirmed!*

Order #${notification.orderNumber}

*Items:*
${itemsList}

*Total:* ${notification.total} ${notification.currency}

Thank you for your purchase! We'll notify you when your order ships.

---
CurlyEllie Hair Care`;

    // Use Twilio WhatsApp API
    const twilioClient = getTwilioClient();
    if (!twilioClient) {
      return {
        success: false,
        error: 'WhatsApp service not initialized',
      };
    }

    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    if (!twilioPhoneNumber) {
      return {
        success: false,
        error: 'TWILIO_PHONE_NUMBER not configured',
      };
    }

    // Format phone number for WhatsApp (add whatsapp: prefix)
    const whatsappNumber = `whatsapp:${notification.phoneNumber}`;

    const result = await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${twilioPhoneNumber}`,
      to: whatsappNumber,
    });

    console.log(
      `[WhatsApp] Order confirmation sent to ${notification.phoneNumber}. Message ID: ${result.sid}`
    );

    return {
      success: true,
      messageId: result.sid,
    };
  } catch (error: any) {
    console.error('[WhatsApp] Failed to send order confirmation:', error);
    return {
      success: false,
      error: error.message || 'Failed to send WhatsApp message',
    };
  }
}

/**
 * Send order status update via WhatsApp
 */
export async function sendOrderStatusWhatsApp(
  update: OrderStatusUpdate
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const statusEmoji: Record<string, string> = {
      confirmed: '✅',
      processing: '⚙️',
      shipped: '📦',
      delivered: '🎁',
      cancelled: '❌',
    };

    const statusText: Record<string, string> = {
      confirmed: 'Order Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };

    let message = `${statusEmoji[update.status]} *${statusText[update.status]}*

Order #${update.orderNumber}`;

    if (update.estimatedDelivery) {
      message += `\n📅 Estimated Delivery: ${update.estimatedDelivery}`;
    }

    if (update.trackingUrl) {
      message += `\n\n📍 Track your order: ${update.trackingUrl}`;
    }

    message += '\n\n---\nCurlyEllie Hair Care';

    // Use Twilio WhatsApp API
    const twilioClient = getTwilioClient();
    if (!twilioClient) {
      return {
        success: false,
        error: 'WhatsApp service not initialized',
      };
    }

    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    if (!twilioPhoneNumber) {
      return {
        success: false,
        error: 'TWILIO_PHONE_NUMBER not configured',
      };
    }

    const whatsappNumber = `whatsapp:${update.phoneNumber}`;

    const result = await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${twilioPhoneNumber}`,
      to: whatsappNumber,
    });

    console.log(
      `[WhatsApp] Order status update sent to ${update.phoneNumber}. Message ID: ${result.sid}`
    );

    return {
      success: true,
      messageId: result.sid,
    };
  } catch (error: any) {
    console.error('[WhatsApp] Failed to send order status update:', error);
    return {
      success: false,
      error: error.message || 'Failed to send WhatsApp message',
    };
  }
}

/**
 * Send promotional message via WhatsApp
 */
export async function sendPromotionalWhatsApp(
  phoneNumber: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const twilioClient = getTwilioClient();
    if (!twilioClient) {
      return {
        success: false,
        error: 'WhatsApp service not initialized',
      };
    }

    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    if (!twilioPhoneNumber) {
      return {
        success: false,
        error: 'TWILIO_PHONE_NUMBER not configured',
      };
    }

    const whatsappNumber = `whatsapp:${phoneNumber}`;

    const result = await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${twilioPhoneNumber}`,
      to: whatsappNumber,
    });

    console.log(`[WhatsApp] Promotional message sent to ${phoneNumber}. Message ID: ${result.sid}`);

    return {
      success: true,
      messageId: result.sid,
    };
  } catch (error: any) {
    console.error('[WhatsApp] Failed to send promotional message:', error);
    return {
      success: false,
      error: error.message || 'Failed to send WhatsApp message',
    };
  }
}
