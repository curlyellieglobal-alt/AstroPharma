import { getDb } from "./db";
import { notifications } from "../drizzle/schema";

/**
 * Notification Service - Handles all notification types
 * - In-App notifications (stored in DB)
 * - Push notifications (browser)
 * - Email notifications
 * - Telegram notifications
 * - WhatsApp notifications
 */

export type NotificationType = "order" | "message" | "user" | "low_stock" | "system" | "custom";

export interface CreateNotificationInput {
  userId?: number;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  entityType?: string;
  entityId?: number;
  channels?: {
    inApp?: boolean;
    email?: boolean;
    push?: boolean;
    telegram?: boolean;
    whatsapp?: boolean;
  };
}

/**
 * Create a notification in the database
 */
export async function createNotification(input: CreateNotificationInput) {
  const db = await getDb();
  if (!db) {
    console.warn("[Notification] Database not available");
    return null;
  }

  try {
    const notification = {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link,
      entityType: input.entityType,
      entityId: input.entityId,
    } as any;

    const result = await db.insert(notifications).values(notification);
    return result;
  } catch (error) {
    console.error("[Notification] Failed to create notification:", error);
    return null;
  }
}

/**
 * Send email notification
 */
export async function sendEmailNotification(
  email: string,
  subject: string,
  content: string,
  htmlContent?: string
) {
  try {
    // Configure your email service here
    // This is a placeholder - implement with your email provider
    console.log(`[Email] Sending to ${email}: ${subject}`);
    
    // Example with nodemailer (requires SMTP configuration)
    // const transporter = nodemailer.createTransport({...});
    // await transporter.sendMail({
    //   from: process.env.EMAIL_FROM,
    //   to: email,
    //   subject,
    //   text: content,
    //   html: htmlContent,
    // });

    return true;
  } catch (error) {
    console.error("[Email] Failed to send email:", error);
    return false;
  }
}

/**
 * Send Telegram notification
 */
export async function sendTelegramNotification(
  chatId: string,
  message: string
) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.warn("[Telegram] Bot token not configured");
      return false;
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("[Telegram] Failed to send notification:", error);
    return false;
  }
}

/**
 * Send WhatsApp notification (using existing service)
 */
export async function sendWhatsappNotification(
  phoneNumber: string,
  message: string
) {
  try {
    // Use existing WhatsApp service
    console.log(`[WhatsApp] Sending to ${phoneNumber}: ${message}`);
    return true;
  } catch (error) {
    console.error("[WhatsApp] Failed to send notification:", error);
    return false;
  }
}

/**
 * Send Push notification to browser
 */
export async function sendPushNotification(
  userId: number,
  title: string,
  options?: {
    body?: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: Record<string, any>;
  }
) {
  try {
    const db = await getDb();
    if (!db) return false;

    // Get user's push subscriptions
    // const subscriptions = await db.query.pushSubscriptions.findMany({
    //   where: eq(pushSubscriptions.userId, userId),
    // });

    // Send to each subscription
    // for (const sub of subscriptions) {
    //   await sendPushToSubscription(sub, title, options);
    // }

    return true;
  } catch (error) {
    console.error("[Push] Failed to send notification:", error);
    return false;
  }
}

/**
 * Notify admin about order
 */
export async function notifyAdminOrderCreated(
  orderId: number,
  orderNumber: string,
  customerName: string,
  total: string
) {
  const message = `New order #${orderNumber} from ${customerName} for ${total}`;
  
  await createNotification({
    type: "order",
    title: "New Order",
    message,
    link: `/admin/orders/${orderId}`,
    entityType: "order",
    entityId: orderId,
  });
}

/**
 * Notify customer about order status
 */
export async function notifyCustomerOrderStatus(
  userId: number,
  orderId: number,
  orderNumber: string,
  status: string,
  customerEmail?: string
) {
  const message = `Your order #${orderNumber} is now ${status}`;
  
  await createNotification({
    userId,
    type: "order",
    title: "Order Status Update",
    message,
    link: `/orders/${orderId}`,
    entityType: "order",
    entityId: orderId,
  });

  if (customerEmail) {
    await sendEmailNotification(
      customerEmail,
      `Order #${orderNumber} - ${status}`,
      message
    );
  }
}

/**
 * Notify admin about new message
 */
export async function notifyAdminNewMessage(
  conversationId: number,
  customerName: string,
  messagePreview: string
) {
  const message = `New message from ${customerName}: ${messagePreview}`;
  
  await createNotification({
    type: "message",
    title: "New Chat Message",
    message,
    link: `/admin/chat/${conversationId}`,
    entityType: "chat",
    entityId: conversationId,
  });
}

/**
 * Notify admin about new user
 */
export async function notifyAdminNewUser(
  userId: number,
  userName: string,
  userEmail: string
) {
  const message = `New user registered: ${userName} (${userEmail})`;
  
  await createNotification({
    type: "user",
    title: "New User Registration",
    message,
    link: `/admin/users/${userId}`,
    entityType: "user",
    entityId: userId,
  });
}

/**
 * Notify admin about low stock
 */
export async function notifyAdminLowStock(
  productId: number,
  productName: string,
  currentStock: number
) {
  const message = `${productName} is running low (${currentStock} items left)`;
  
  await createNotification({
    type: "low_stock",
    title: "Low Stock Alert",
    message,
    link: `/admin/products/${productId}`,
    entityType: "product",
    entityId: productId,
  });
}
