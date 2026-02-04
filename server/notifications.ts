/**
 * Notification Module
 * Handles email notifications for orders and customer updates
 */

import { notifyOwner } from "./_core/notification";

export async function notifyOwnerNewOrder(orderData: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: string;
  items: Array<{ productName: string; quantity: number; price: string }>;
}) {
  const itemsList = orderData.items
    .map((item) => `- ${item.productName} x${item.quantity} ($${item.price})`)
    .join("\n");

  const content = `
New Order Received!

Order Number: ${orderData.orderNumber}
Customer: ${orderData.customerName}
Email: ${orderData.customerEmail}
Total: $${orderData.total}

Items:
${itemsList}

Please log in to the admin dashboard to view full order details and manage the order.
  `.trim();

  return await notifyOwner({
    title: `New Order: ${orderData.orderNumber}`,
    content,
  });
}

export async function notifyOwnerOrderStatusChange(orderData: {
  orderNumber: string;
  customerName: string;
  oldStatus: string;
  newStatus: string;
}) {
  const content = `
Order Status Updated

Order Number: ${orderData.orderNumber}
Customer: ${orderData.customerName}
Status changed from "${orderData.oldStatus}" to "${orderData.newStatus}"
  `.trim();

  return await notifyOwner({
    title: `Order Status Changed: ${orderData.orderNumber}`,
    content,
  });
}

// Note: For customer email notifications, you would typically integrate with an email service
// like SendGrid, Mailgun, or AWS SES. The implementation below is a placeholder.

export async function sendOrderConfirmationEmail(orderData: {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  total: string;
  items: Array<{ productName: string; quantity: number; price: string }>;
}) {
  // TODO: Integrate with email service provider
  console.log(`[Email] Order confirmation sent to ${orderData.customerEmail}`);
  console.log(`Order Number: ${orderData.orderNumber}`);
  console.log(`Total: $${orderData.total}`);
  
  return {
    success: true,
    message: "Order confirmation email sent",
  };
}

export async function sendOrderStatusUpdateEmail(orderData: {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  status: string;
}) {
  // TODO: Integrate with email service provider
  console.log(`[Email] Order status update sent to ${orderData.customerEmail}`);
  console.log(`Order Number: ${orderData.orderNumber}`);
  console.log(`Status: ${orderData.status}`);
  
  return {
    success: true,
    message: "Order status update email sent",
  };
}
