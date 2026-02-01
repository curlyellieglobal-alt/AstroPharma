/**
 * Notification Routers
 * API endpoints for managing notifications
 */

import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "./db";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const notificationRouter = router({
  // Get all notifications for current user (admin sees all)
  list: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.role === 'admin' ? undefined : ctx.user.id;
      return await db.getNotifications(userId, input?.limit);
    }),

  // Get unread notifications
  unread: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.role === 'admin' ? undefined : ctx.user.id;
    return await db.getUnreadNotifications(userId);
  }),

  // Get unread count
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.role === 'admin' ? undefined : ctx.user.id;
    return await db.getUnreadCount(userId);
  }),

  // Mark notification as read
  markAsRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.markNotificationAsRead(input.id);
      return { success: true };
    }),

  // Mark all notifications as read
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.role === 'admin' ? undefined : ctx.user.id;
    await db.markAllNotificationsAsRead(userId);
    return { success: true };
  }),

  // Delete notification
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteNotification(input.id);
      return { success: true };
    }),

  // Create custom notification (admin only)
  create: adminProcedure
    .input(z.object({
      userId: z.number().optional(),
      type: z.enum(["order", "low_stock", "system", "custom"]),
      title: z.string(),
      message: z.string(),
      link: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createNotification({
        userId: input.userId || null,
        type: input.type,
        title: input.title,
        message: input.message,
        link: input.link || null,
        isRead: false,
      });
      return { id, success: true };
    }),

  // Get user notification preferences
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    return await db.getNotificationPreferences(ctx.user.id);
  }),

  // Update user notification preferences
  updatePreferences: protectedProcedure
    .input(z.object({
      emailOrderConfirmation: z.boolean(),
      emailOrderStatus: z.boolean(),
      emailPromotions: z.boolean(),
      inAppNotifications: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.updateNotificationPreferences(ctx.user.id, input);
      return { success: true };
    }),

  // Check for low stock products and create notifications
  checkLowStock: adminProcedure.mutation(async () => {
    const lowStockProducts = await db.checkLowStock(10);
    
    for (const product of lowStockProducts) {
      await db.createNotification({
        userId: null, // System-wide notification for admins
        type: "low_stock",
        title: "Low Stock Alert",
        message: `Product "${product.name}" is running low on stock. Current quantity: ${product.stockQuantity}`,
        link: `/admin/products`,
        isRead: false,
      });
    }
    
    return { 
      success: true, 
      count: lowStockProducts.length,
      products: lowStockProducts.map(p => ({ id: p.id, name: p.name, stock: p.stockQuantity }))
    };
  }),
});
