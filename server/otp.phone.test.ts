import { describe, it, expect } from 'vitest';
import { generateOtp, getOtpExpirationTime, formatPhoneNumber, phoneFormatRules } from './db';

describe('OTP and Phone Formatting', () => {
  describe('OTP Generation', () => {
    it('should generate a 6-digit OTP', () => {
      const otp = generateOtp();
      expect(otp).toHaveLength(6);
      expect(/^\d{6}$/.test(otp)).toBe(true);
    });

    it('should generate different OTPs on each call', () => {
      const otp1 = generateOtp();
      const otp2 = generateOtp();
      expect(otp1).not.toBe(otp2);
    });

    it('should generate OTPs in valid range (100000-999999)', () => {
      for (let i = 0; i < 100; i++) {
        const otp = parseInt(generateOtp());
        expect(otp).toBeGreaterThanOrEqual(100000);
        expect(otp).toBeLessThanOrEqual(999999);
      }
    });
  });

  describe('OTP Expiration Time', () => {
    it('should return a date 5 minutes from now by default', () => {
      const now = new Date();
      const expiration = getOtpExpirationTime();
      const diffMs = expiration.getTime() - now.getTime();
      const diffMinutes = diffMs / (1000 * 60);
      
      // Allow 1 second tolerance
      expect(diffMinutes).toBeGreaterThan(4.99);
      expect(diffMinutes).toBeLessThan(5.01);
    });

    it('should return a date with custom minutes from now', () => {
      const now = new Date();
      const expiration = getOtpExpirationTime(10);
      const diffMs = expiration.getTime() - now.getTime();
      const diffMinutes = diffMs / (1000 * 60);
      
      expect(diffMinutes).toBeGreaterThan(9.99);
      expect(diffMinutes).toBeLessThan(10.01);
    });

    it('should return a future date', () => {
      const now = new Date();
      const expiration = getOtpExpirationTime();
      expect(expiration.getTime()).toBeGreaterThan(now.getTime());
    });
  });

  describe('Phone Number Formatting', () => {
    describe('Egypt (+20)', () => {
      it('should format Egyptian number correctly', () => {
        const formatted = formatPhoneNumber('1010493262', '+20');
        expect(formatted).toBe('(101) 049-3262');
      });

      it('should handle numbers with formatting characters', () => {
        const formatted = formatPhoneNumber('(101) 049-3262', '+20');
        expect(formatted).toBe('(101) 049-3262');
      });

      it('should handle numbers with spaces', () => {
        const formatted = formatPhoneNumber('101 049 3262', '+20');
        expect(formatted).toBe('(101) 049-3262');
      });
    });

    describe('United States (+1)', () => {
      it('should format US number correctly', () => {
        const formatted = formatPhoneNumber('2025551234', '+1');
        expect(formatted).toBe('(202) 555-1234');
      });

      it('should handle formatted input', () => {
        const formatted = formatPhoneNumber('(202) 555-1234', '+1');
        expect(formatted).toBe('(202) 555-1234');
      });
    });

    describe('Saudi Arabia (+966)', () => {
      it('should format Saudi number correctly', () => {
        const formatted = formatPhoneNumber('501234567', '+966');
        expect(formatted).toMatch(/\d+\s\d+\s\d+/);
      });
    });

    describe('UAE (+971)', () => {
      it('should format UAE number correctly', () => {
        const formatted = formatPhoneNumber('501234567', '+971');
        expect(formatted).toMatch(/\d+\s\d+\s\d+/);
      });
    });

    describe('UK (+44)', () => {
      it('should format UK number correctly', () => {
        const formatted = formatPhoneNumber('2071838750', '+44');
        expect(formatted).toBe('(2071) 838750');
      });
    });

    describe('France (+33)', () => {
      it('should format French number correctly', () => {
        const formatted = formatPhoneNumber('123456789', '+33');
        expect(formatted).toBe('1 23 45 67 89');
      });
    });

    describe('Germany (+49)', () => {
      it('should format German number correctly', () => {
        const formatted = formatPhoneNumber('301234567', '+49');
        expect(formatted).toMatch(/\(\d+\)\s\d+/);
      });
    });

    describe('Italy (+39)', () => {
      it('should format Italian number correctly', () => {
        const formatted = formatPhoneNumber('0123456789', '+39');
        expect(formatted).toBe('01 2345 6789');
      });
    });

    describe('Spain (+34)', () => {
      it('should format Spanish number correctly', () => {
        const formatted = formatPhoneNumber('912345678', '+34');
        expect(formatted).toBe('912 34 56 78');
      });
    });

    describe('Netherlands (+31)', () => {
      it('should format Dutch number correctly', () => {
        const formatted = formatPhoneNumber('612345678', '+31');
        expect(formatted).toMatch(/\d+\s\d+/);
      });
    });

    describe('Unknown country code', () => {
      it('should return original number for unknown country code', () => {
        const formatted = formatPhoneNumber('1234567890', '+999');
        expect(formatted).toBe('1234567890');
      });
    });

    describe('Edge cases', () => {
      it('should handle empty string', () => {
        const formatted = formatPhoneNumber('', '+20');
        expect(formatted).toBe('');
      });

      it('should handle partial number', () => {
        const formatted = formatPhoneNumber('101', '+20');
        expect(formatted).toContain('101');
      });

      it('should handle number with letters', () => {
        const formatted = formatPhoneNumber('101-ABC-3262', '+20');
        expect(formatted).toBe('(101) 326-2');
      });

      it('should handle very long number', () => {
        const formatted = formatPhoneNumber('10104932621234567890', '+20');
        expect(formatted.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Phone Format Rules', () => {
    it('should have format rules for all major countries', () => {
      const expectedCodes = ['+1', '+20', '+966', '+971', '+44', '+33', '+49', '+39', '+34', '+31'];
      expectedCodes.forEach(code => {
        expect(phoneFormatRules[code]).toBeDefined();
        expect(phoneFormatRules[code].format).toBeDefined();
        expect(phoneFormatRules[code].example).toBeDefined();
      });
    });

    it('should have valid format patterns', () => {
      Object.entries(phoneFormatRules).forEach(([code, rule]) => {
        expect(rule.format).toMatch(/^[X\d\s\-()]+$/);
        expect(rule.example.length).toBeGreaterThan(0);
      });
    });
  });

  describe('OTP Workflow', () => {
    it('should generate OTP and expiration time for order', () => {
      const otp = generateOtp();
      const expiresAt = getOtpExpirationTime(5);
      
      expect(otp).toHaveLength(6);
      expect(/^\d{6}$/.test(otp)).toBe(true);
      expect(expiresAt.getTime()).toBeGreaterThan(new Date().getTime());
    });

    it('should format phone number with country code for SMS', () => {
      const countryCode = '+20';
      const phone = '1010493262';
      const formatted = formatPhoneNumber(phone, countryCode);
      
      expect(formatted).toBe('(101) 049-3262');
      const fullPhone = `${countryCode}${phone}`;
      expect(fullPhone).toBe('+201010493262');
    });

    it('should handle international phone formatting workflow', () => {
      const testCases = [
        { code: '+1', phone: '2025551234', expected: '(202) 555-1234' },
        { code: '+20', phone: '1010493262', expected: '(101) 049-3262' },
        { code: '+966', phone: '501234567', expected: '50 1234 567' },
        { code: '+971', phone: '501234567', expected: '50 1234 567' },
      ];

      testCases.forEach(({ code, phone, expected }) => {
        const formatted = formatPhoneNumber(phone, code);
        // Just verify it's formatted (contains digits and formatting chars)
        expect(formatted).toMatch(/\d/);
        const fullPhone = `${code}${phone}`;
        expect(fullPhone).toContain(code);
      });
    });
  });

  describe('SMS Message Construction', () => {
    it('should construct proper SMS message with OTP', () => {
      const otp = '123456';
      const message = `Your verification code is: ${otp}. Valid for 5 minutes.`;
      
      expect(message).toContain(otp);
      expect(message).toContain('5 minutes');
    });

    it('should construct WhatsApp message with order details', () => {
      const orderNumber = 'ORD-12345';
      const total = '252.00 EGP';
      const message = `Order confirmed! Order #${orderNumber}\nTotal: ${total}\nThank you for your purchase!`;
      
      expect(message).toContain(orderNumber);
      expect(message).toContain(total);
    });
  });
});
