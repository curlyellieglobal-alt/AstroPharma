/**
 * WhatsApp Notification Service
 * Sends automatic notifications to company WhatsApp number for orders and live chat
 */

import * as db from "./db";

/**
 * Send WhatsApp notification via WhatsApp Web API
 * Opens WhatsApp with pre-filled message
 */
export async function sendWhatsAppNotification(phone: string, message: string): Promise<boolean> {
  try {
    // WhatsApp Web API URL format
    // Note: This opens WhatsApp Web with pre-filled message
    // For actual sending, you would need WhatsApp Business API integration
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
    
    // Log notification (in production, this would trigger actual API call)
    console.log(`[WhatsApp Notification] To: ${phone}`);
    console.log(`[WhatsApp Notification] Message: ${message}`);
    console.log(`[WhatsApp Notification] URL: ${whatsappUrl}`);
    
    // In production, integrate with WhatsApp Business API here
    // For now, we return true to indicate the notification was prepared
    
    return true;
  } catch (error) {
    console.error("[WhatsApp Notification] Error:", error);
    return false;
  }
}

/**
 * Send notification for new order
 */
export async function notifyNewOrder(orderId: number): Promise<void> {
  try {
    // Get notification settings
    const settings = await db.getAllSiteSettings();
    const notificationPhone = settings.find(s => s.settingKey === 'whatsapp_notification_phone')?.settingValue;
    const notificationsEnabled = settings.find(s => s.settingKey === 'whatsapp_notifications_enabled')?.settingValue === 'true';
    
    if (!notificationsEnabled || !notificationPhone) {
      console.log("[WhatsApp Notification] Notifications disabled or phone not configured");
      return;
    }
    
    // Get order details
    const order = await db.getOrderById(orderId);
    if (!order) {
      console.error("[WhatsApp Notification] Order not found:", orderId);
      return;
    }
    
    // Format notification message (Arabic + English)
    const message = `
🛒 *طلب جديد / New Order*

📦 رقم الطلب / Order ID: #${order.id}
👤 العميل / Customer: ${order.customerName}
📧 Email: ${order.customerEmail}
📱 Phone: ${order.customerPhone || 'N/A'}

💰 الإجمالي / Total: ${order.total} EGP
💳 طريقة الدفع / Payment: ${order.paymentMethod}
📍 العنوان / Address: ${order.shippingAddress}

⏰ الوقت / Time: ${new Date(order.createdAt).toLocaleString('ar-EG')}

---
افتح الداشبورد لمراجعة الطلب
Open dashboard to review order
    `.trim();
    
    await sendWhatsAppNotification(notificationPhone, message);
  } catch (error) {
    console.error("[WhatsApp Notification] Error notifying new order:", error);
  }
}

/**
 * Send notification for new live chat message
 */
export async function notifyNewChatMessage(conversationId: number, messageId: number): Promise<void> {
  try {
    // Get notification settings
    const settings = await db.getAllSiteSettings();
    const notificationPhone = settings.find(s => s.settingKey === 'whatsapp_notification_phone')?.settingValue;
    const notificationsEnabled = settings.find(s => s.settingKey === 'whatsapp_notifications_enabled')?.settingValue === 'true';
    
    if (!notificationsEnabled || !notificationPhone) {
      console.log("[WhatsApp Notification] Notifications disabled or phone not configured");
      return;
    }
    
    // Get conversation and message details
    const messages = await db.getChatMessages(conversationId);
    const message = messages.find(m => m.id === messageId);
    const conversation = (await db.getAllChatConversations()).find(c => c.id === conversationId);
    
    if (!message || !conversation) {
      console.error("[WhatsApp Notification] Message or conversation not found");
      return;
    }
    
    // Only notify for customer messages (not admin messages)
    if (message.senderType !== 'customer') {
      return;
    }
    
    // Format notification message (Arabic + English)
    const messagePreview = message.content.length > 100 
      ? message.content.substring(0, 100) + '...' 
      : message.content;
    
    const notificationText = `
💬 *رسالة جديدة / New Chat Message*

👤 العميل / Customer: ${conversation.customerName}
📧 Email: ${conversation.customerEmail || 'N/A'}
📱 Phone: ${conversation.customerPhone || 'N/A'}

📝 الرسالة / Message:
"${messagePreview}"

⏰ الوقت / Time: ${new Date(message.createdAt).toLocaleString('ar-EG')}

---
افتح الداشبورد للرد
Open dashboard to reply
    `.trim();
    
    await sendWhatsAppNotification(notificationPhone, notificationText);
  } catch (error) {
    console.error("[WhatsApp Notification] Error notifying new chat message:", error);
  }
}
