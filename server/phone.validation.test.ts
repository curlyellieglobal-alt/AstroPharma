import { describe, it, expect } from 'vitest';

describe('Phone Number Validation with Country Codes', () => {
  // Phone validation function
  const validatePhone = (phone: string, countryCode: string) => {
    // Combine country code with phone number
    const fullPhone = `${countryCode}${phone}`;
    
    // Extract digits only
    const phoneDigits = phone.replace(/\D/g, '');
    
    return {
      isValid: phoneDigits.length >= 7,
      fullPhone,
      digitCount: phoneDigits.length,
    };
  };

  describe('Valid Phone Numbers', () => {
    it('should accept Egyptian phone number with +20 country code', () => {
      const result = validatePhone('1010493262', '+20');
      expect(result.isValid).toBe(true);
      expect(result.fullPhone).toBe('+201010493262');
      expect(result.digitCount).toBe(10);
    });

    it('should accept US phone number with +1 country code', () => {
      const result = validatePhone('2025551234', '+1');
      expect(result.isValid).toBe(true);
      expect(result.fullPhone).toBe('+12025551234');
      expect(result.digitCount).toBe(10);
    });

    it('should accept Saudi Arabian phone number with +966 country code', () => {
      const result = validatePhone('501234567', '+966');
      expect(result.isValid).toBe(true);
      expect(result.fullPhone).toBe('+966501234567');
      expect(result.digitCount).toBe(9);
    });

    it('should accept UAE phone number with +971 country code', () => {
      const result = validatePhone('501234567', '+971');
      expect(result.isValid).toBe(true);
      expect(result.fullPhone).toBe('+971501234567');
      expect(result.digitCount).toBe(9);
    });

    it('should accept UK phone number with +44 country code', () => {
      const result = validatePhone('2071838750', '+44');
      expect(result.isValid).toBe(true);
      expect(result.fullPhone).toBe('+442071838750');
      expect(result.digitCount).toBe(10);
    });

    it('should accept phone with formatting characters (spaces, hyphens, parentheses)', () => {
      const result = validatePhone('(101) 049-3262', '+20');
      expect(result.isValid).toBe(true);
      expect(result.digitCount).toBe(10);
    });

    it('should accept minimum valid phone (7 digits)', () => {
      const result = validatePhone('1234567', '+1');
      expect(result.isValid).toBe(true);
      expect(result.digitCount).toBe(7);
    });
  });

  describe('Invalid Phone Numbers', () => {
    it('should reject phone with less than 7 digits', () => {
      const result = validatePhone('123456', '+20');
      expect(result.isValid).toBe(false);
      expect(result.digitCount).toBe(6);
    });

    it('should reject empty phone number', () => {
      const result = validatePhone('', '+20');
      expect(result.isValid).toBe(false);
      expect(result.digitCount).toBe(0);
    });

    it('should reject phone with only formatting characters', () => {
      const result = validatePhone('() -', '+20');
      expect(result.isValid).toBe(false);
      expect(result.digitCount).toBe(0);
    });

    it('should reject phone with only 6 digits', () => {
      const result = validatePhone('123456', '+966');
      expect(result.isValid).toBe(false);
      expect(result.digitCount).toBe(6);
    });
  });

  describe('Country Code Formatting', () => {
    it('should correctly format Egyptian number', () => {
      const result = validatePhone('1010493262', '+20');
      expect(result.fullPhone).toBe('+201010493262');
    });

    it('should correctly format US number', () => {
      const result = validatePhone('2025551234', '+1');
      expect(result.fullPhone).toBe('+12025551234');
    });

    it('should correctly format Saudi number', () => {
      const result = validatePhone('501234567', '+966');
      expect(result.fullPhone).toBe('+966501234567');
    });

    it('should correctly format UAE number', () => {
      const result = validatePhone('501234567', '+971');
      expect(result.fullPhone).toBe('+971501234567');
    });

    it('should handle different country codes', () => {
      const countryCodes = ['+1', '+20', '+44', '+33', '+49', '+966', '+971'];
      const phone = '1234567890';
      
      countryCodes.forEach(code => {
        const result = validatePhone(phone, code);
        expect(result.fullPhone).toMatch(new RegExp(`^${code.replace('+', '\\+')}`));
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle phone with leading zeros', () => {
      const result = validatePhone('001010493262', '+20');
      expect(result.isValid).toBe(true);
      expect(result.digitCount).toBe(12);
    });

    it('should handle phone with plus sign in input (should not double up)', () => {
      const result = validatePhone('+1010493262', '+20');
      // Plus sign is not a digit, so it gets filtered out
      expect(result.digitCount).toBe(10);
      expect(result.isValid).toBe(true);
    });

    it('should handle very long phone numbers', () => {
      const result = validatePhone('10104932621234567890', '+20');
      expect(result.isValid).toBe(true);
      expect(result.digitCount).toBe(20);
    });

    it('should handle phone with mixed formatting', () => {
      const result = validatePhone('+20 (101) 049-3262', '+20');
      expect(result.isValid).toBe(true);
      // +20 in the phone input adds 2 more digits (2 and 0), so total is 12
      expect(result.digitCount).toBe(12);
    });
  });

  describe('Common Country Codes', () => {
    const testCases = [
      { code: '+1', country: 'United States', phone: '2025551234', expected: true },
      { code: '+20', country: 'Egypt', phone: '1010493262', expected: true },
      { code: '+966', country: 'Saudi Arabia', phone: '501234567', expected: true },
      { code: '+971', country: 'UAE', phone: '501234567', expected: true },
      { code: '+44', country: 'UK', phone: '2071838750', expected: true },
      { code: '+33', country: 'France', phone: '123456789', expected: true },
      { code: '+49', country: 'Germany', phone: '30123456', expected: true },
      { code: '+39', country: 'Italy', phone: '0123456789', expected: true },
      { code: '+34', country: 'Spain', phone: '912345678', expected: true },
      { code: '+31', country: 'Netherlands', phone: '612345678', expected: true },
    ];

    testCases.forEach(({ code, country, phone, expected }) => {
      it(`should validate ${country} (${code}) phone number`, () => {
        const result = validatePhone(phone, code);
        expect(result.isValid).toBe(expected);
      });
    });
  });

  describe('Form Submission Scenarios', () => {
    it('should accept valid form submission with country code', () => {
      const countryCode = '+20';
      const phone = '1010493262';
      const result = validatePhone(phone, countryCode);
      
      expect(result.isValid).toBe(true);
      expect(result.fullPhone).toBe('+201010493262');
    });

    it('should reject form submission with missing phone', () => {
      const countryCode = '+20';
      const phone = '';
      const result = validatePhone(phone, countryCode);
      
      expect(result.isValid).toBe(false);
    });

    it('should reject form submission with invalid phone', () => {
      const countryCode = '+20';
      const phone = '123';
      const result = validatePhone(phone, countryCode);
      
      expect(result.isValid).toBe(false);
    });

    it('should accept form with country code change', () => {
      // User changes from +20 to +1
      const result1 = validatePhone('1010493262', '+20');
      const result2 = validatePhone('2025551234', '+1');
      
      expect(result1.isValid).toBe(true);
      expect(result2.isValid).toBe(true);
      expect(result1.fullPhone).toBe('+201010493262');
      expect(result2.fullPhone).toBe('+12025551234');
    });
  });
});
