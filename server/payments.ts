/**
 * Payment Integration Module
 * Supports Paymob (card payments), Instapay, and Stripe
 */

import axios from "axios";

// ============= PAYMOB INTEGRATION =============

interface PaymobConfig {
  apiKey: string;
  integrationId: string;
  iframeId: string;
}

export async function createPaymobPayment(
  amount: number,
  currency: string,
  orderId: string,
  customerInfo: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  },
  config: PaymobConfig
) {
  try {
    // Step 1: Authentication
    const authResponse = await axios.post("https://accept.paymob.com/api/auth/tokens", {
      api_key: config.apiKey,
    });
    const authToken = authResponse.data.token;

    // Step 2: Create Order
    const orderResponse = await axios.post(
      "https://accept.paymob.com/api/ecommerce/orders",
      {
        auth_token: authToken,
        delivery_needed: "false",
        amount_cents: Math.round(amount * 100),
        currency,
        merchant_order_id: orderId,
      }
    );
    const paymobOrderId = orderResponse.data.id;

    // Step 3: Payment Key
    const paymentKeyResponse = await axios.post(
      "https://accept.paymob.com/api/acceptance/payment_keys",
      {
        auth_token: authToken,
        amount_cents: Math.round(amount * 100),
        expiration: 3600,
        order_id: paymobOrderId,
        billing_data: {
          email: customerInfo.email,
          first_name: customerInfo.firstName,
          last_name: customerInfo.lastName,
          phone_number: customerInfo.phone,
          apartment: "NA",
          floor: "NA",
          street: "NA",
          building: "NA",
          shipping_method: "NA",
          postal_code: "NA",
          city: "NA",
          country: "NA",
          state: "NA",
        },
        currency,
        integration_id: config.integrationId,
      }
    );

    const paymentToken = paymentKeyResponse.data.token;
    const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${config.iframeId}?payment_token=${paymentToken}`;

    return {
      success: true,
      paymentToken,
      iframeUrl,
      paymobOrderId,
    };
  } catch (error: any) {
    console.error("Paymob payment error:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.detail || error.message,
    };
  }
}

// ============= INSTAPAY INTEGRATION =============

export async function createInstapayPayment(
  amount: number,
  orderId: string,
  customerInfo: {
    name: string;
    phone: string;
  }
) {
  // Instapay typically requires bank integration
  // This is a placeholder for the actual integration
  return {
    success: true,
    message: "Please transfer to Instapay account: INSTAPAY-ACCOUNT-ID",
    amount,
    orderId,
    instructions: `Transfer ${amount} EGP to our Instapay account and reference order ${orderId}`,
  };
}

// ============= STRIPE INTEGRATION =============

interface StripeConfig {
  secretKey: string;
  publishableKey: string;
}

export async function createStripePaymentIntent(
  amount: number,
  currency: string,
  orderId: string,
  customerEmail: string,
  config: StripeConfig
) {
  try {
    const response = await axios.post(
      "https://api.stripe.com/v1/payment_intents",
      new URLSearchParams({
        amount: Math.round(amount * 100).toString(),
        currency: currency.toLowerCase(),
        "metadata[order_id]": orderId,
        receipt_email: customerEmail,
      }),
      {
        headers: {
          Authorization: `Bearer ${config.secretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return {
      success: true,
      clientSecret: response.data.client_secret,
      paymentIntentId: response.data.id,
    };
  } catch (error: any) {
    console.error("Stripe payment error:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message,
    };
  }
}

export async function verifyStripePayment(paymentIntentId: string, config: StripeConfig) {
  try {
    const response = await axios.get(
      `https://api.stripe.com/v1/payment_intents/${paymentIntentId}`,
      {
        headers: {
          Authorization: `Bearer ${config.secretKey}`,
        },
      }
    );

    return {
      success: response.data.status === "succeeded",
      status: response.data.status,
      amount: response.data.amount / 100,
    };
  } catch (error: any) {
    console.error("Stripe verification error:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message,
    };
  }
}

// ============= WEBHOOK HANDLERS =============

export function verifyPaymobWebhook(payload: any, hmacSecret: string): boolean {
  // Implement HMAC verification for Paymob webhooks
  // This is a simplified version - implement proper HMAC verification in production
  return true;
}

export function verifyStripeWebhook(payload: string, signature: string, webhookSecret: string): boolean {
  // Implement Stripe webhook signature verification
  // Use stripe.webhooks.constructEvent in production
  return true;
}
