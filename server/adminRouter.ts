import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { nanoid } from "nanoid";
import { router, publicProcedure } from "./_core/trpc";
import { z } from "zod";

export const adminRouter = router({
  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(6),
    }))
    .mutation(async ({ input, ctx }) => {
      const admin = await db.getAdminByEmail(input.email);
      if (!admin) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      if (!admin.isActive) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Account is disabled',
        });
      }

      // Simple password comparison (in production, use proper hashing)
      if (input.password !== admin.passwordHash) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      await db.updateAdminLastLogin(admin.email);
      const token = nanoid(32);
      ctx.res?.setHeader('Set-Cookie', `admin_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`);

      return {
        success: true,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
        },
      };
    }),

  // WhatsApp Settings Management
  whatsapp: router({
    getSettings: publicProcedure
      .query(async () => {
        const phone = await db.getSiteSetting('whatsapp_phone');
        const notificationPhone = await db.getSiteSetting('whatsapp_notification_phone');
        const enabled = await db.getSiteSetting('whatsapp_enabled');
        const notificationsEnabled = await db.getSiteSetting('whatsapp_notifications_enabled');
        const messageTemplate = await db.getSiteSetting('whatsapp_message_template');

        return {
          phone: (phone?.settingValue) || '+20',
          notificationPhone: (notificationPhone?.settingValue) || '+20',
          enabled: (enabled?.settingValue) === 'true',
          notificationsEnabled: (notificationsEnabled?.settingValue) === 'true',
          messageTemplate: (messageTemplate?.settingValue) || 'Hello! Thank you for your order.',
        };
      }),

    updatePhone: publicProcedure
      .input(z.object({
        phone: z.string().regex(/^\+\d{10,15}$/, 'Invalid phone format. Use +20XXXXXXXXXX'),
        type: z.enum(['customer', 'notification']),
      }))
      .mutation(async ({ input }) => {
        const settingKey = input.type === 'customer' ? 'whatsapp_phone' : 'whatsapp_notification_phone';
        
        try {
          await db.updateSiteSetting(settingKey, input.phone);
          
          return {
            success: true,
            message: `WhatsApp ${input.type} phone updated successfully`,
            phone: input.phone,
          };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update phone number',
          });
        }
      }),

    updateMessageTemplate: publicProcedure
      .input(z.object({
        template: z.string().min(10).max(1000),
      }))
      .mutation(async ({ input }) => {
        try {
          await db.updateSiteSetting('whatsapp_message_template', input.template);
          
          return {
            success: true,
            message: 'Message template updated successfully',
          };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update message template',
          });
        }
      }),

    toggleFeature: publicProcedure
      .input(z.object({
        feature: z.enum(['enabled', 'notificationsEnabled']),
        value: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        const settingKey = input.feature === 'enabled' ? 'whatsapp_enabled' : 'whatsapp_notifications_enabled';
        
        try {
          await db.updateSiteSetting(settingKey, input.value ? 'true' : 'false');
          
          return {
            success: true,
            message: `WhatsApp ${input.feature} set to ${input.value}`,
          };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update feature setting',
          });
        }
      }),
  }),
});
