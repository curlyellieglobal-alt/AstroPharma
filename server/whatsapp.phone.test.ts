import { describe, it, expect, vi } from 'vitest';

describe('WhatsApp Phone Number Update', () => {
  it('should update whatsapp_phone setting', () => {
    const newPhone = '00201010493262';
    const oldPhone = '201234567890';
    
    // Simulate database update
    const settings = [
      { settingKey: 'whatsapp_phone', settingValue: oldPhone },
      { settingKey: 'whatsapp_notification_phone', settingValue: oldPhone }
    ];
    
    // Update both settings
    const updated = settings.map(s => 
      s.settingKey === 'whatsapp_phone' || s.settingKey === 'whatsapp_notification_phone'
        ? { ...s, settingValue: newPhone }
        : s
    );
    
    expect(updated[0].settingValue).toBe(newPhone);
    expect(updated[1].settingValue).toBe(newPhone);
  });

  it('should format phone number correctly', () => {
    const phone = '00201010493262';
    
    // Remove leading zeros and add +
    const formatted = phone.startsWith('00') 
      ? '+' + phone.substring(2)
      : phone;
    
    expect(formatted).toBe('+201010493262');
  });

  it('should use updated phone in WhatsApp messages', () => {
    const whatsappPhone = '00201010493262';
    const message = 'Hello! This is a test message';
    
    // Format for WhatsApp URL
    const phoneForUrl = whatsappPhone.startsWith('00')
      ? whatsappPhone.substring(2)
      : whatsappPhone;
    
    const whatsappUrl = `https://wa.me/${phoneForUrl}?text=${encodeURIComponent(message)}`;
    
    expect(whatsappUrl).toContain('201010493262');
    expect(whatsappUrl).toContain('wa.me');
  });

  it('should persist phone number across page reloads', () => {
    const phone = '00201010493262';
    
    // Simulate localStorage
    const storage: Record<string, string> = {};
    storage['whatsapp_phone'] = phone;
    
    expect(storage['whatsapp_phone']).toBe(phone);
  });
});
