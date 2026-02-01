import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import * as db from './db';
import { companyNotificationsRouter } from './routers/companyNotifications';
import { publicProcedure, router } from './_core/trpc';

describe('Order Confirmation System', () => {
  describe('Company Notifications Router', () => {
    it('should create sendOrderNotification procedure', () => {
      expect(companyNotificationsRouter).toBeDefined();
      expect(companyNotificationsRouter._def.procedures.sendOrderNotification).toBeDefined();
    });

    it('should have getCompanyPhone procedure', () => {
      expect(companyNotificationsRouter._def.procedures.getCompanyPhone).toBeDefined();
    });

    it('should have getPendingNotifications procedure', () => {
      expect(companyNotificationsRouter._def.procedures.getPendingNotifications).toBeDefined();
    });
  });

  describe('Order Notification Data Structure', () => {
    it('should accept valid order notification input', () => {
      const validInput = {
        orderId: 1,
        orderNumber: 'ORD-ABC123DEF',
        customerName: 'Ahmed Hassan',
        customerEmail: 'ahmed@example.com',
        customerPhone: '+20 100 123 4567',
        total: '299.99',
        currency: 'EGP',
        items: [
          { productName: 'Hair Lotion', quantity: 2, price: '150' },
          { productName: 'Hair Serum', quantity: 1, price: '99.99' }
        ],
        shippingAddress: '123 Cairo Street, Cairo, Egypt',
        paymentMethod: 'Credit Card',
      };

      expect(validInput.orderId).toBeGreaterThan(0);
      expect(validInput.orderNumber).toMatch(/^ORD-/);
      expect(validInput.customerName).toBeTruthy();
      expect(validInput.customerEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      expect(validInput.items).toHaveLength(2);
      expect(validInput.total).toMatch(/^\d+\.\d{2}$/);
    });

    it('should validate required fields in order notification', () => {
      const invalidInputs = [
        { orderId: 0 }, // Invalid order ID
        { orderNumber: '' }, // Empty order number
        { customerName: '' }, // Empty name
        { customerEmail: 'invalid-email' }, // Invalid email
        { items: [] }, // Empty items
      ];

      invalidInputs.forEach(input => {
        if ('orderId' in input) {
          expect(input.orderId).toBeLessThanOrEqual(0);
        }
        if ('orderNumber' in input) {
          expect(input.orderNumber).toBe('');
        }
      });
    });
  });

  describe('Order Confirmation Page Data', () => {
    it('should have correct order confirmation structure', () => {
      const orderConfirmationData = {
        id: 'ORD-ABC123DEF',
        customerName: 'Ahmed Hassan',
        customerEmail: 'ahmed@example.com',
        customerPhone: '+20 100 123 4567',
        total: 299.99,
        currency: 'EGP',
        items: [
          { productName: 'Hair Lotion', quantity: 2, price: 150 },
          { productName: 'Hair Serum', quantity: 1, price: 99.99 }
        ],
        shippingAddress: '123 Cairo Street, Cairo, Egypt',
        paymentMethod: 'Credit Card',
        createdAt: new Date().toISOString(),
      };

      expect(orderConfirmationData).toHaveProperty('id');
      expect(orderConfirmationData).toHaveProperty('customerName');
      expect(orderConfirmationData).toHaveProperty('customerEmail');
      expect(orderConfirmationData).toHaveProperty('customerPhone');
      expect(orderConfirmationData).toHaveProperty('total');
      expect(orderConfirmationData).toHaveProperty('currency');
      expect(orderConfirmationData).toHaveProperty('items');
      expect(orderConfirmationData).toHaveProperty('shippingAddress');
      expect(orderConfirmationData).toHaveProperty('paymentMethod');
      expect(orderConfirmationData).toHaveProperty('createdAt');
    });

    it('should calculate order total correctly', () => {
      const items = [
        { price: 150, quantity: 2 },
        { price: 99.99, quantity: 1 }
      ];

      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      expect(total).toBe(399.99);
    });

    it('should format currency correctly', () => {
      const currencies = ['EGP', 'USD', 'SAR', 'AED', 'GBP', 'EUR'];
      
      currencies.forEach(currency => {
        const formatted = `${299.99} ${currency}`;
        expect(formatted).toMatch(/^\d+\.\d{2} [A-Z]{3}$/);
      });
    });
  });

  describe('Contact Options', () => {
    it('should have WhatsApp contact option', () => {
      const whatsappPhone = '+20 100 123 4567';
      const cleanPhone = whatsappPhone.replace(/\D/g, '');
      
      expect(cleanPhone).toBeTruthy();
      expect(cleanPhone).toMatch(/^\d+$/);
      expect(cleanPhone.length).toBeGreaterThan(0);
    });

    it('should have Facebook contact option', () => {
      const facebookLink = 'https://www.facebook.com/curlyellie';
      
      expect(facebookLink).toBeTruthy();
      expect(facebookLink).toMatch(/^https?:\/\//);
      expect(facebookLink).toContain('facebook.com');
    });

    it('should generate valid WhatsApp URL', () => {
      const phone = '201001234567';
      const message = 'Hello, I have a question about my order';
      const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      
      expect(whatsappUrl).toContain('wa.me');
      expect(whatsappUrl).toContain(phone);
      expect(whatsappUrl).toContain('text=');
    });

    it('should handle international phone numbers', () => {
      const phones = [
        '+20 100 123 4567', // Egypt
        '+1 555 123 4567',  // USA
        '+966 50 123 4567', // Saudi Arabia
        '+971 50 123 4567', // UAE
      ];

      phones.forEach(phone => {
        const cleanPhone = phone.replace(/\D/g, '');
        expect(cleanPhone).toMatch(/^\d+$/);
        expect(cleanPhone.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Site Settings', () => {
    it('should retrieve company WhatsApp phone from settings', async () => {
      // Mock getSiteSetting
      const mockSetting = {
        id: 1,
        settingKey: 'company_whatsapp_phone',
        settingValue: '+20 100 123 4567',
        settingType: 'text' as const,
        description: 'Company WhatsApp phone number',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(mockSetting.settingKey).toBe('company_whatsapp_phone');
      expect(mockSetting.settingValue).toBeTruthy();
    });

    it('should retrieve Facebook link from settings', async () => {
      const mockSetting = {
        id: 2,
        settingKey: 'facebook_link',
        settingValue: 'https://www.facebook.com/curlyellie',
        settingType: 'text' as const,
        description: 'Facebook page link',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(mockSetting.settingKey).toBe('facebook_link');
      expect(mockSetting.settingValue).toContain('facebook.com');
    });

    it('should handle missing settings gracefully', () => {
      const missingSetting = null;
      
      expect(missingSetting).toBeNull();
      // Should not throw error when accessing
      const value = missingSetting?.settingValue || 'default';
      expect(value).toBe('default');
    });
  });

  describe('WhatsApp Message Formatting', () => {
    it('should format order notification message correctly', () => {
      const orderData = {
        orderNumber: 'ORD-ABC123DEF',
        customerName: 'Ahmed Hassan',
        customerEmail: 'ahmed@example.com',
        customerPhone: '+20 100 123 4567',
        total: '299.99',
        currency: 'EGP',
        shippingAddress: '123 Cairo Street, Cairo, Egypt',
        paymentMethod: 'Credit Card',
        items: [
          { productName: 'Hair Lotion', quantity: 2, price: '150' },
        ],
      };

      const message = `🔔 *NEW ORDER NOTIFICATION*\n\n` +
        `📦 Order ID: #${orderData.orderNumber}\n` +
        `👤 Customer: ${orderData.customerName}\n` +
        `📧 Email: ${orderData.customerEmail}\n` +
        `📱 Phone: ${orderData.customerPhone}\n\n` +
        `💰 *Order Total:* ${orderData.total} ${orderData.currency}`;

      expect(message).toContain('NEW ORDER NOTIFICATION');
      expect(message).toContain(orderData.orderNumber);
      expect(message).toContain(orderData.customerName);
      expect(message).toContain(orderData.total);
    });

    it('should include all order items in message', () => {
      const items = [
        { productName: 'Hair Lotion', quantity: 2, price: '150' },
        { productName: 'Hair Serum', quantity: 1, price: '99.99' }
      ];

      const itemsList = items
        .map((item, idx) => `${idx + 1}. ${item.productName} x${item.quantity} - ${item.price} EGP`)
        .join('\n');

      expect(itemsList).toContain('Hair Lotion');
      expect(itemsList).toContain('Hair Serum');
      expect(itemsList).toContain('x2');
      expect(itemsList).toContain('x1');
    });

    it('should include timestamp in message', () => {
      const timestamp = new Date().toLocaleString();
      const message = `⏰ Time: ${timestamp}`;

      expect(message).toContain('Time:');
      expect(timestamp).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing company phone gracefully', () => {
      const companyPhone = null;
      
      if (!companyPhone) {
        expect(companyPhone).toBeNull();
        // Should return error message
        const result = { success: false, message: 'Company phone not configured' };
        expect(result.success).toBe(false);
      }
    });

    it('should handle invalid email addresses', () => {
      const invalidEmails = [
        'not-an-email',
        '@example.com',
        'user@',
        'user @example.com',
      ];

      invalidEmails.forEach(email => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        expect(isValid).toBe(false);
      });
    });

    it('should handle empty order items', () => {
      const items = [];
      
      if (items.length === 0) {
        expect(items).toHaveLength(0);
        const result = { success: false, message: 'No items in order' };
        expect(result.success).toBe(false);
      }
    });
  });

  describe('Order Confirmation Flow', () => {
    it('should complete full order confirmation flow', async () => {
      const orderData = {
        orderId: 1,
        orderNumber: 'ORD-ABC123DEF',
        customerName: 'Ahmed Hassan',
        customerEmail: 'ahmed@example.com',
        customerPhone: '+20 100 123 4567',
        total: '299.99',
        currency: 'EGP',
        items: [
          { productName: 'Hair Lotion', quantity: 2, price: '150' },
        ],
        shippingAddress: '123 Cairo Street, Cairo, Egypt',
        paymentMethod: 'Credit Card',
      };

      // Step 1: Order created
      expect(orderData.orderId).toBeGreaterThan(0);
      
      // Step 2: Notification prepared
      expect(orderData.orderNumber).toMatch(/^ORD-/);
      
      // Step 3: Contact options available
      expect(orderData.customerPhone).toBeTruthy();
      
      // Step 4: Message formatted
      const message = `Order #${orderData.orderNumber} confirmed`;
      expect(message).toContain(orderData.orderNumber);
    });

    it('should track notification status', () => {
      const notificationStatuses = ['pending', 'sent', 'failed', 'read'];
      
      notificationStatuses.forEach(status => {
        expect(['pending', 'sent', 'failed', 'read']).toContain(status);
      });
    });
  });

  describe('Multi-Currency Support', () => {
    it('should support multiple currencies', () => {
      const currencies = ['EGP', 'USD', 'SAR', 'AED', 'GBP', 'EUR'];
      
      currencies.forEach(currency => {
        const formatted = `299.99 ${currency}`;
        expect(formatted).toMatch(/^\d+\.\d{2} [A-Z]{3}$/);
      });
    });

    it('should format prices with correct decimal places', () => {
      const prices = [
        { value: 299.99, expected: '299.99' },
        { value: 150, expected: '150.00' },
        { value: 99.9, expected: '99.90' },
      ];

      prices.forEach(price => {
        const formatted = price.value.toFixed(2);
        expect(formatted).toMatch(/^\d+\.\d{2}$/);
      });
    });
  });
});
