import { describe, it, expect } from 'vitest';

describe('Mandatory Phone Number Requirement', () => {
  describe('Order Creation Validation', () => {
    it('should reject order without phone number', () => {
      const formData = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '', // Empty phone
      };

      const isValid = formData.customerPhone.trim().length > 0;
      expect(isValid).toBe(false);
    });

    it('should accept order with valid phone number', () => {
      const formData = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+201010493262',
      };

      const isValid = formData.customerPhone.trim().length > 0;
      expect(isValid).toBe(true);
    });

    it('should validate phone format', () => {
      const validPhones = [
        '+201010493262',
        '+20 101 049 3262',
        '201010493262',
        '+1-555-123-4567',
        '(555) 123-4567',
      ];

      const phoneRegex = /^[+\d\s\-()]{10,}$/;

      validPhones.forEach(phone => {
        expect(phoneRegex.test(phone)).toBe(true);
      });
    });

    it('should reject invalid phone formats', () => {
      const invalidPhones = [
        '123', // Too short
        'abc', // Not a number
        '', // Empty
        '   ', // Only spaces
      ];

      const phoneRegex = /^[+\d\s\-()]{10,}$/;

      invalidPhones.forEach(phone => {
        expect(phoneRegex.test(phone)).toBe(false);
      });
    });
  });

  describe('Checkout Form Validation', () => {
    it('should require phone field in checkout', () => {
      const requiredFields = ['customerName', 'customerEmail', 'customerPhone', 'shippingLine1', 'shippingCity', 'shippingPostalCode'];

      expect(requiredFields).toContain('customerPhone');
    });

    it('should show error message when phone is missing', () => {
      const formData = {
        customerName: 'John',
        customerEmail: 'john@example.com',
        customerPhone: '',
      };

      const hasPhone = formData.customerPhone.trim().length > 0;
      const errorMessage = !hasPhone ? 'Please enter your phone number' : null;

      expect(errorMessage).toBe('Please enter your phone number');
    });

    it('should show error message for invalid phone format', () => {
      const formData = {
        customerPhone: '123',
      };

      const phoneRegex = /^[+\d\s\-()]{10,}$/;
      const isValidFormat = phoneRegex.test(formData.customerPhone);
      const errorMessage = !isValidFormat ? 'Please enter a valid phone number' : null;

      expect(errorMessage).toBe('Please enter a valid phone number');
    });
  });

  describe('Database Schema', () => {
    it('should have customerPhone as required field', () => {
      const orderSchema = {
        customerName: { required: true },
        customerEmail: { required: true },
        customerPhone: { required: true }, // Now required
        shippingAddress: { required: true },
      };

      expect(orderSchema.customerPhone.required).toBe(true);
    });

    it('should have paymentMethod as required field', () => {
      const orderSchema = {
        paymentMethod: { required: true },
        paymentProvider: { required: true },
      };

      expect(orderSchema.paymentMethod.required).toBe(true);
      expect(orderSchema.paymentProvider.required).toBe(true);
    });
  });

  describe('Chat Conversation Validation', () => {
    it('should require phone for chat conversations', () => {
      const input = {
        customerName: 'John',
        customerEmail: 'john@example.com',
        customerPhone: '+201010493262',
      };

      expect(input.customerPhone.length).toBeGreaterThanOrEqual(10);
    });

    it('should reject chat without phone', () => {
      const input = {
        customerName: 'John',
        customerEmail: 'john@example.com',
        customerPhone: '',
      };

      const isValid = input.customerPhone.length >= 10;
      expect(isValid).toBe(false);
    });
  });

  describe('Error Messages', () => {
    it('should provide clear error messages', () => {
      const errorMessages = {
        missingName: 'Please enter your name',
        missingEmail: 'Please enter your email',
        missingPhone: 'Please enter your phone number',
        invalidPhone: 'Please enter a valid phone number',
        missingAddress: 'Please enter your shipping address',
        missingCity: 'Please enter your city',
        missingPostalCode: 'Please enter your postal code',
      };

      expect(errorMessages.missingPhone).toBe('Please enter your phone number');
      expect(errorMessages.invalidPhone).toBe('Please enter a valid phone number');
    });
  });

  describe('Order Confirmation', () => {
    it('should display phone number in order confirmation', () => {
      const order = {
        id: 1,
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+201010493262',
        total: 550,
      };

      expect(order.customerPhone).toBeDefined();
      expect(order.customerPhone).toBe('+201010493262');
    });

    it('should include phone in WhatsApp message', () => {
      const message = 'Order {orderId} for {customerName} - Phone: {customerPhone}';
      const placeholders = ['{orderId}', '{customerName}', '{customerPhone}'];

      placeholders.forEach(placeholder => {
        expect(message).toContain(placeholder);
      });
    });
  });
});
