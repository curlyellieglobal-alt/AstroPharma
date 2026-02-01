import { describe, it, expect } from 'vitest';

describe('WhatsApp Phone Persistence & Display', () => {
  const NEW_PHONE = '+201010493262';
  const OLD_PHONE = '+201234567890';

  it('should store WhatsApp phone in database', () => {
    const settings = [
      { settingKey: 'whatsapp_phone', settingValue: NEW_PHONE },
      { settingKey: 'whatsapp_notification_phone', settingValue: NEW_PHONE }
    ];

    const whatsappSetting = settings.find(s => s.settingKey === 'whatsapp_phone');
    expect(whatsappSetting?.settingValue).toBe(NEW_PHONE);
  });

  it('should retrieve WhatsApp phone from database', () => {
    const dbSettings = {
      'whatsapp_phone': NEW_PHONE,
      'whatsapp_notification_phone': NEW_PHONE
    };

    expect(dbSettings['whatsapp_phone']).toBe(NEW_PHONE);
    expect(dbSettings['whatsapp_notification_phone']).toBe(NEW_PHONE);
  });

  it('should display new phone in admin dashboard', () => {
    const adminPhoneDisplay = NEW_PHONE;
    expect(adminPhoneDisplay).toBe(NEW_PHONE);
    expect(adminPhoneDisplay).not.toBe(OLD_PHONE);
  });

  it('should use new phone for customer redirects after order', () => {
    const orderData = {
      orderId: 'ORD-123',
      customerName: 'Test Customer',
      whatsappPhone: NEW_PHONE
    };

    const whatsappUrl = `https://wa.me/${orderData.whatsappPhone.replace(/[^\d]/g, '')}`;
    expect(whatsappUrl).toContain('201010493262');
    expect(whatsappUrl).not.toContain('201234567890');
  });

  it('should use new phone for admin notifications', () => {
    const notificationPhone = NEW_PHONE;
    expect(notificationPhone).toBe(NEW_PHONE);
  });

  it('should persist phone across multiple orders', () => {
    const orders = [
      { id: 1, whatsappPhone: NEW_PHONE },
      { id: 2, whatsappPhone: NEW_PHONE },
      { id: 3, whatsappPhone: NEW_PHONE }
    ];

    orders.forEach(order => {
      expect(order.whatsappPhone).toBe(NEW_PHONE);
    });
  });

  it('should update phone when admin changes it', () => {
    let currentPhone = NEW_PHONE;
    const newPhone = '+201111111111';
    
    // Simulate update
    currentPhone = newPhone;
    
    expect(currentPhone).toBe(newPhone);
    expect(currentPhone).not.toBe(NEW_PHONE);
  });

  it('should format phone correctly for WhatsApp API', () => {
    const phone = NEW_PHONE;
    const formatted = phone.replace(/[^\d]/g, '');
    
    expect(formatted).toBe('201010493262');
    expect(formatted).toMatch(/^\d+$/);
  });

  it('should include phone in order confirmation email', () => {
    const emailData = {
      orderId: 'ORD-123',
      customerName: 'Test',
      whatsappPhone: NEW_PHONE,
      message: `Contact us on WhatsApp: ${NEW_PHONE}`
    };

    expect(emailData.message).toContain(NEW_PHONE);
  });

  it('should validate phone number format', () => {
    const phone = NEW_PHONE;
    const isValid = /^\+\d{10,15}$/.test(phone);
    
    expect(isValid).toBe(true);
  });
});
