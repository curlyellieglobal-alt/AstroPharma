/**
 * Email notification templates for customer communications
 */

interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  orderTotal: string;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: string;
  }>;
  shippingAddress: string;
  orderDate: string;
}

interface StatusUpdateData {
  orderId: string;
  customerName: string;
  status: string;
  trackingNumber?: string;
}

export function generateOrderConfirmationEmail(data: OrderEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #9f1239 0%, #be123c 100%); color: white; padding: 40px 20px; text-align: center; }
    .header img { max-width: 200px; height: auto; margin-bottom: 20px; }
    .content { padding: 40px 20px; }
    .order-details { background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .order-item { border-bottom: 1px solid #e0e0e0; padding: 15px 0; }
    .order-item:last-child { border-bottom: none; }
    .total { font-size: 20px; font-weight: bold; color: #9f1239; margin-top: 20px; text-align: right; }
    .button { display: inline-block; background-color: #9f1239; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { background-color: #1f2937; color: #9ca3af; padding: 30px 20px; text-align: center; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Order Confirmed!</h1>
      <p>Thank you for your purchase</p>
    </div>
    
    <div class="content">
      <p>Hi ${data.customerName},</p>
      <p>We're excited to confirm that we've received your order! Your Curly Ellie products will be prepared with care and shipped to you soon.</p>
      
      <div class="order-details">
        <h2 style="margin-top: 0;">Order #${data.orderId}</h2>
        <p><strong>Order Date:</strong> ${data.orderDate}</p>
        
        <h3>Items Ordered:</h3>
        ${data.orderItems.map(item => `
          <div class="order-item">
            <div style="display: flex; justify-content: space-between;">
              <div>
                <strong>${item.name}</strong><br>
                <span style="color: #666;">Quantity: ${item.quantity}</span>
              </div>
              <div style="text-align: right;">
                <strong>$${item.price}</strong>
              </div>
            </div>
          </div>
        `).join('')}
        
        <div class="total">
          Total: $${data.orderTotal}
        </div>
      </div>
      
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
        <strong>Shipping Address:</strong><br>
        ${data.shippingAddress.replace(/\n/g, '<br>')}
      </div>
      
      <p>You'll receive another email with tracking information once your order ships.</p>
      
      <div style="text-align: center;">
        <a href="https://your-domain.com/orders/${data.orderId}" class="button">Track Your Order</a>
      </div>
      
      <p>If you have any questions, please don't hesitate to contact us.</p>
      <p>Best regards,<br>The Curly Ellie Team</p>
    </div>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} Curly Ellie. All rights reserved.</p>
      <p>This email was sent to ${data.customerEmail}</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function generateOrderStatusEmail(data: StatusUpdateData): string {
  const statusMessages: Record<string, { title: string; message: string }> = {
    processing: {
      title: "Your Order is Being Processed",
      message: "We're preparing your order for shipment. You'll receive a tracking number soon!"
    },
    shipped: {
      title: "Your Order Has Shipped!",
      message: "Great news! Your Curly Ellie products are on their way to you."
    },
    delivered: {
      title: "Your Order Has Been Delivered",
      message: "Your package has been delivered. We hope you love your new products!"
    },
    cancelled: {
      title: "Order Cancelled",
      message: "Your order has been cancelled. If you have any questions, please contact us."
    }
  };

  const statusInfo = statusMessages[data.status] || {
    title: "Order Status Update",
    message: `Your order status has been updated to: ${data.status}`
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Status Update</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #9f1239 0%, #be123c 100%); color: white; padding: 40px 20px; text-align: center; }
    .content { padding: 40px 20px; }
    .status-box { background-color: #f0fdf4; border: 2px solid #22c55e; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
    .button { display: inline-block; background-color: #9f1239; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { background-color: #1f2937; color: #9ca3af; padding: 30px 20px; text-align: center; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${statusInfo.title}</h1>
      <p>Order #${data.orderId}</p>
    </div>
    
    <div class="content">
      <p>Hi ${data.customerName},</p>
      <p>${statusInfo.message}</p>
      
      <div class="status-box">
        <h2 style="margin: 0; color: #22c55e;">Status: ${data.status.toUpperCase()}</h2>
        ${data.trackingNumber ? `
          <p style="margin: 10px 0 0 0;">
            <strong>Tracking Number:</strong> ${data.trackingNumber}
          </p>
        ` : ''}
      </div>
      
      <div style="text-align: center;">
        <a href="https://your-domain.com/orders/${data.orderId}" class="button">View Order Details</a>
      </div>
      
      <p>Thank you for choosing Curly Ellie!</p>
      <p>Best regards,<br>The Curly Ellie Team</p>
    </div>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} Curly Ellie. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function generateWelcomeEmail(customerName: string, customerEmail: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Curly Ellie</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #9f1239 0%, #be123c 100%); color: white; padding: 40px 20px; text-align: center; }
    .content { padding: 40px 20px; }
    .button { display: inline-block; background-color: #9f1239; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { background-color: #1f2937; color: #9ca3af; padding: 30px 20px; text-align: center; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Curly Ellie!</h1>
      <p>We're thrilled to have you join us</p>
    </div>
    
    <div class="content">
      <p>Hi ${customerName},</p>
      <p>Thank you for creating an account with Curly Ellie! We're excited to be part of your hair care journey.</p>
      
      <p>Our premium hair lotion is formulated with advanced ingredients to give you healthy, beautiful curls. Here's what you can expect:</p>
      
      <ul>
        <li>Medical-grade formula for optimal hair health</li>
        <li>Non-sticky, lightweight texture</li>
        <li>Natural ingredients safe for all hair types</li>
        <li>Long-lasting results</li>
      </ul>
      
      <div style="text-align: center;">
        <a href="https://your-domain.com/products" class="button">Shop Now</a>
      </div>
      
      <p>If you have any questions, our team is here to help!</p>
      <p>Best regards,<br>The Curly Ellie Team</p>
    </div>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} Curly Ellie. All rights reserved.</p>
      <p>This email was sent to ${customerEmail}</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}


// Campaign Templates
export interface CampaignTemplate {
  id: string;
  name: string;
  category: 'promotional' | 'welcome' | 'abandoned-cart' | 'custom';
  subject: string;
  previewText: string;
  htmlContent: string;
  variables: string[];
}

export const campaignTemplates: CampaignTemplate[] = [
  {
    id: 'promo-discount',
    name: 'Promotional - Discount Offer',
    category: 'promotional',
    subject: '🎉 Exclusive Discount Inside - {{discountPercent}}% Off Hair Care Products',
    previewText: 'Limited time offer on premium hair care solutions',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; }
    .discount-badge { background: #ff6b6b; color: white; font-size: 48px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .cta-button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; }
    .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>CurlyEllie Hair Care</h1>
      <p>Premium Solutions for Beautiful Curls</p>
    </div>
    
    <div class="content">
      <h2>Hello {{customerName}},</h2>
      <p>We're thrilled to offer you an exclusive discount on our premium hair care collection!</p>
      
      <div class="discount-badge">{{discountPercent}}% OFF</div>
      
      <p>Use code <strong>{{couponCode}}</strong> at checkout to claim your discount.</p>
      <p style="text-align: center;">
        <a href="{{shopLink}}" class="cta-button">Shop Now</a>
      </p>
      
      <p><em>Offer valid until {{expiryDate}}</em></p>
    </div>
    
    <div class="footer">
      <p>&copy; 2026 CurlyEllie Hair Care. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `,
    variables: ['customerName', 'discountPercent', 'couponCode', 'shopLink', 'expiryDate'],
  },
  
  {
    id: 'welcome-subscriber',
    name: 'Welcome - New Subscriber',
    category: 'welcome',
    subject: 'Welcome to CurlyEllie! 🌸 Get 20% Off Your First Order',
    previewText: 'Start your hair care journey with us',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; }
    .coupon-code { background: #f5576c; color: white; padding: 15px; text-align: center; border-radius: 5px; font-size: 24px; font-weight: bold; margin: 20px 0; }
    .cta-button { background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; }
    .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to CurlyEllie! 🌸</h1>
      <p>Your Journey to Beautiful Curls Starts Here</p>
    </div>
    
    <div class="content">
      <h2>Hello {{customerName}},</h2>
      <p>Thank you for joining the CurlyEllie family!</p>
      
      <h3>Your Welcome Gift:</h3>
      <div class="coupon-code">WELCOME20</div>
      <p style="text-align: center;">Use this code for <strong>20% off</strong> your first order!</p>
      
      <p style="text-align: center;">
        <a href="{{shopLink}}" class="cta-button">Start Shopping</a>
      </p>
    </div>
    
    <div class="footer">
      <p>&copy; 2026 CurlyEllie Hair Care. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `,
    variables: ['customerName', 'shopLink'],
  },
  
  {
    id: 'abandoned-cart',
    name: 'Abandoned Cart - Reminder',
    category: 'abandoned-cart',
    subject: 'You Left Something Behind! 🛒 Complete Your Order',
    previewText: 'Don\'t miss out on your hair care essentials',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; }
    .cart-total { background: #f0f0f0; padding: 15px; border-radius: 5px; text-align: right; font-size: 18px; font-weight: bold; margin: 15px 0; }
    .discount-offer { background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0; }
    .cta-button { background: #fa709a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; }
    .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>You Left Something Behind! 🛒</h1>
      <p>Complete Your Order Now</p>
    </div>
    
    <div class="content">
      <h2>Hi {{customerName}},</h2>
      <p>We noticed you left some amazing hair care products in your cart. Don't miss out!</p>
      
      <div class="cart-total">Total: {{cartTotal}}</div>
      
      <div class="discount-offer">
        <strong>Hurry! Use code COMEBACK10 for 10% off</strong>
        <p>This offer expires in 24 hours!</p>
      </div>
      
      <p style="text-align: center;">
        <a href="{{checkoutLink}}" class="cta-button">Complete Your Order</a>
      </p>
    </div>
    
    <div class="footer">
      <p>&copy; 2026 CurlyEllie Hair Care. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `,
    variables: ['customerName', 'cartTotal', 'checkoutLink'],
  },
];

export function getCampaignTemplateById(id: string): CampaignTemplate | undefined {
  return campaignTemplates.find(t => t.id === id);
}

export function getCampaignTemplatesByCategory(category: CampaignTemplate['category']): CampaignTemplate[] {
  return campaignTemplates.filter(t => t.category === category);
}

export function renderCampaignTemplate(template: CampaignTemplate, variables: Record<string, any>): string {
  let content = template.htmlContent;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    content = content.replace(regex, String(value));
  });
  
  return content;
}
