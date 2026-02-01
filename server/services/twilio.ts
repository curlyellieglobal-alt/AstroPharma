import twilio from 'twilio';

/**
 * Twilio SMS Service
 * Handles sending OTP and notification SMS messages
 */

let twilioClient: ReturnType<typeof twilio> | null = null;

export function initTwilio(accountSid: string, authToken: string) {
  try {
    twilioClient = twilio(accountSid, authToken);
    console.log('[Twilio] Client initialized successfully');
    return true;
  } catch (error) {
    console.error('[Twilio] Failed to initialize client:', error);
    return false;
  }
}

export async function sendOtpSms(
  phoneNumber: string,
  otp: string,
  expiryMinutes: number = 5
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!twilioClient) {
    return {
      success: false,
      error: 'Twilio client not initialized. Please configure Twilio credentials.',
    };
  }

  const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!twilioPhoneNumber) {
    return {
      success: false,
      error: 'TWILIO_PHONE_NUMBER not configured',
    };
  }

  try {
    const message = await twilioClient.messages.create({
      body: `Your verification code is: ${otp}\n\nValid for ${expiryMinutes} minutes.\n\nDo not share this code with anyone.`,
      from: twilioPhoneNumber,
      to: phoneNumber,
    });

    console.log(`[Twilio] OTP sent to ${phoneNumber}. Message ID: ${message.sid}`);

    return {
      success: true,
      messageId: message.sid,
    };
  } catch (error: any) {
    console.error('[Twilio] Failed to send OTP SMS:', error);
    return {
      success: false,
      error: error.message || 'Failed to send SMS',
    };
  }
}

export async function sendOrderConfirmationSms(
  phoneNumber: string,
  orderNumber: string,
  total: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!twilioClient) {
    return {
      success: false,
      error: 'Twilio client not initialized',
    };
  }

  const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!twilioPhoneNumber) {
    return {
      success: false,
      error: 'TWILIO_PHONE_NUMBER not configured',
    };
  }

  try {
    const message = await twilioClient.messages.create({
      body: `Order Confirmed!\n\nOrder #${orderNumber}\nTotal: ${total}\n\nThank you for your purchase!`,
      from: twilioPhoneNumber,
      to: phoneNumber,
    });

    console.log(`[Twilio] Order confirmation sent to ${phoneNumber}. Message ID: ${message.sid}`);

    return {
      success: true,
      messageId: message.sid,
    };
  } catch (error: any) {
    console.error('[Twilio] Failed to send order confirmation SMS:', error);
    return {
      success: false,
      error: error.message || 'Failed to send SMS',
    };
  }
}

export async function sendOrderStatusSms(
  phoneNumber: string,
  orderNumber: string,
  status: string,
  trackingUrl?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!twilioClient) {
    return {
      success: false,
      error: 'Twilio client not initialized',
    };
  }

  const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!twilioPhoneNumber) {
    return {
      success: false,
      error: 'TWILIO_PHONE_NUMBER not configured',
    };
  }

  try {
    let body = `Order #${orderNumber}\nStatus: ${status}`;
    if (trackingUrl) {
      body += `\n\nTrack your order: ${trackingUrl}`;
    }

    const message = await twilioClient.messages.create({
      body,
      from: twilioPhoneNumber,
      to: phoneNumber,
    });

    console.log(`[Twilio] Order status SMS sent to ${phoneNumber}. Message ID: ${message.sid}`);

    return {
      success: true,
      messageId: message.sid,
    };
  } catch (error: any) {
    console.error('[Twilio] Failed to send order status SMS:', error);
    return {
      success: false,
      error: error.message || 'Failed to send SMS',
    };
  }
}

export function getTwilioClient() {
  return twilioClient;
}

export function isTwilioInitialized(): boolean {
  return twilioClient !== null;
}
