import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const companyNotificationsRouter = router({
  /**
   * Send WhatsApp notification to company when a new order is created
   */
  sendOrderNotification: publicProcedure
    .input(z.object({
      orderId: z.number(),
      orderNumber: z.string(),
      customerName: z.string(),
      customerEmail: z.string(),
      customerPhone: z.string(),
      total: z.string(),
      currency: z.string(),
      items: z.array(z.object({
        productName: z.string(),
        quantity: z.number(),
        price: z.string(),
      })),
      shippingAddress: z.string(),
      paymentMethod: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        // Get company WhatsApp number from site settings
        const companyPhoneSetting = await db.getSiteSetting('company_whatsapp_phone');
        
        if (!companyPhoneSetting?.settingValue) {
          console.warn("Company WhatsApp phone not configured in site settings");
          return { success: false, message: "Company phone not configured" };
        }

        const companyPhone = companyPhoneSetting.settingValue;
        
        // Format the order details message
        const itemsList = input.items
          .map((item, idx) => `${idx + 1}. ${item.productName} x${item.quantity} - ${item.price} ${input.currency}`)
          .join('\n');

        const message = `🔔 *NEW ORDER NOTIFICATION*\n\n` +
          `📦 Order ID: #${input.orderNumber}\n` +
          `👤 Customer: ${input.customerName}\n` +
          `📧 Email: ${input.customerEmail}\n` +
          `📱 Phone: ${input.customerPhone}\n\n` +
          `💰 *Order Total:* ${input.total} ${input.currency}\n` +
          `💳 Payment Method: ${input.paymentMethod}\n\n` +
          `📍 *Delivery Address:*\n${input.shippingAddress}\n\n` +
          `📋 *Order Items:*\n${itemsList}\n\n` +
          `⏰ Time: ${new Date().toLocaleString()}\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━`;

        // Save WhatsApp message record to database
        await db.createWhatsappMessage({
          orderId: input.orderId,
          phoneNumber: companyPhone,
          messageType: 'order_confirmation',
          messageContent: message,
          status: 'pending',
        } as any);

        // Send via WhatsApp Business API (if available)
        try {
          const { sendWhatsAppNotification } = await import("../whatsappNotification");
          await sendWhatsAppNotification(companyPhone, message);
        } catch (error) {
          console.warn("Failed to send WhatsApp via service:", error);
          // Continue anyway - message is saved in database for manual follow-up
        }

        return { 
          success: true, 
          message: "Order notification queued for delivery" 
        };
      } catch (error) {
        console.error("Error sending order notification:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send order notification',
        });
      }
    }),

  /**
   * Get company WhatsApp phone number
   */
  getCompanyPhone: publicProcedure.query(async () => {
    try {
      const setting = await db.getSiteSetting('company_whatsapp_phone');
      return setting?.settingValue || null;
    } catch (error) {
      console.error("Error fetching company phone:", error);
      return null;
    }
  }),

  /**
   * Get all pending notifications for company
   */
  getPendingNotifications: publicProcedure.query(async () => {
    try {
      const db_instance = await db.getDb();
      if (!db_instance) return [];

      // This would require adding a query to db.ts
      // For now, return empty array
      return [];
    } catch (error) {
      console.error("Error fetching pending notifications:", error);
      return [];
    }
  }),
});
