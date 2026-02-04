import { notifyOwner } from "./_core/notification";
import { generateOrderConfirmationEmail, generateOrderStatusEmail, generateWelcomeEmail } from "./emailTemplates";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send email notification
 * Note: This is a simplified implementation using the owner notification system.
 * For production, integrate with a proper email service like SendGrid, AWS SES, or Resend.
 */
export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  try {
    // For now, we'll notify the owner about the email that should be sent
    // In production, replace this with actual email service integration
    await notifyOwner({
      title: `Email to ${params.to}`,
      content: `Subject: ${params.subject}\n\nAn email should be sent to the customer. Please integrate with an email service provider (SendGrid, AWS SES, or Resend) to enable automatic email delivery.`
    });
    
    console.log(`[Email Service] Would send email to ${params.to}: ${params.subject}`);
    return true;
  } catch (error) {
    console.error("[Email Service] Failed to send email:", error);
    return false;
  }
}

interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  orderTotal: string;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: string;
  }>;
  shippingAddress: string;
  orderDate: string;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<boolean> {
  const html = generateOrderConfirmationEmail(data);
  return sendEmail({
    to: data.customerEmail,
    subject: `Order Confirmation #${data.orderId} - Curly Ellie`,
    html
  });
}

interface StatusUpdateData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  status: string;
  trackingNumber?: string;
}

export async function sendOrderStatusEmail(data: StatusUpdateData): Promise<boolean> {
  const html = generateOrderStatusEmail(data);
  return sendEmail({
    to: data.customerEmail,
    subject: `Order #${data.orderId} Status Update - Curly Ellie`,
    html
  });
}

export async function sendWelcomeEmail(customerName: string, customerEmail: string): Promise<boolean> {
  const html = generateWelcomeEmail(customerName, customerEmail);
  return sendEmail({
    to: customerEmail,
    subject: "Welcome to Curly Ellie!",
    html
  });
}
