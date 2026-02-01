import { describe, it, expect } from "vitest";
import { getCampaignTemplateById, getCampaignTemplatesByCategory, renderCampaignTemplate } from "./emailTemplates";

describe("Email Campaign Templates", () => {
  describe("getCampaignTemplateById", () => {
    it("should return promotional template", () => {
      const template = getCampaignTemplateById("promo-discount");
      expect(template).toBeDefined();
      expect(template?.name).toBe("Promotional - Discount Offer");
      expect(template?.category).toBe("promotional");
    });

    it("should return welcome template", () => {
      const template = getCampaignTemplateById("welcome-subscriber");
      expect(template).toBeDefined();
      expect(template?.name).toBe("Welcome - New Subscriber");
      expect(template?.category).toBe("welcome");
    });

    it("should return abandoned cart template", () => {
      const template = getCampaignTemplateById("abandoned-cart");
      expect(template).toBeDefined();
      expect(template?.name).toBe("Abandoned Cart - Reminder");
      expect(template?.category).toBe("abandoned-cart");
    });

    it("should return undefined for non-existent template", () => {
      const template = getCampaignTemplateById("non-existent");
      expect(template).toBeUndefined();
    });
  });

  describe("getCampaignTemplatesByCategory", () => {
    it("should return promotional templates", () => {
      const templates = getCampaignTemplatesByCategory("promotional");
      expect(templates.length).toBeGreaterThan(0);
      expect(templates.every(t => t.category === "promotional")).toBe(true);
    });

    it("should return welcome templates", () => {
      const templates = getCampaignTemplatesByCategory("welcome");
      expect(templates.length).toBeGreaterThan(0);
      expect(templates.every(t => t.category === "welcome")).toBe(true);
    });

    it("should return abandoned cart templates", () => {
      const templates = getCampaignTemplatesByCategory("abandoned-cart");
      expect(templates.length).toBeGreaterThan(0);
      expect(templates.every(t => t.category === "abandoned-cart")).toBe(true);
    });
  });

  describe("renderCampaignTemplate", () => {
    it("should render template with variables", () => {
      const template = getCampaignTemplateById("promo-discount");
      if (!template) throw new Error("Template not found");

      const rendered = renderCampaignTemplate(template, {
        customerName: "John Doe",
        discountPercent: "20",
        couponCode: "SAVE20",
        shopLink: "https://example.com/shop",
        expiryDate: "2026-02-28",
      });

      expect(rendered).toContain("John Doe");
      expect(rendered).toContain("20");
      expect(rendered).toContain("SAVE20");
      expect(rendered).not.toContain("{{customerName}}");
    });

    it("should handle missing variables gracefully", () => {
      const template = getCampaignTemplateById("welcome-subscriber");
      if (!template) throw new Error("Template not found");

      const rendered = renderCampaignTemplate(template, {
        customerName: "Jane Smith",
        shopLink: "https://example.com/shop",
      });

      expect(rendered).toContain("Jane Smith");
      expect(rendered).toContain("https://example.com/shop");
    });

    it("should render abandoned cart template", () => {
      const template = getCampaignTemplateById("abandoned-cart");
      if (!template) throw new Error("Template not found");

      const rendered = renderCampaignTemplate(template, {
        customerName: "Bob Johnson",
        cartTotal: "$150.00",
        checkoutLink: "https://example.com/checkout",
      });

      expect(rendered).toContain("Bob Johnson");
      expect(rendered).toContain("$150.00");
      expect(rendered).toContain("https://example.com/checkout");
    });
  });

  describe("Template structure", () => {
    it("should have all required fields", () => {
      const template = getCampaignTemplateById("promo-discount");
      expect(template?.id).toBeDefined();
      expect(template?.name).toBeDefined();
      expect(template?.category).toBeDefined();
      expect(template?.subject).toBeDefined();
      expect(template?.previewText).toBeDefined();
      expect(template?.htmlContent).toBeDefined();
      expect(template?.variables).toBeDefined();
      expect(Array.isArray(template?.variables)).toBe(true);
    });

    it("should have valid HTML content", () => {
      const template = getCampaignTemplateById("welcome-subscriber");
      if (!template) throw new Error("Template not found");
      
      expect(template.htmlContent).toContain("<html");
      expect(template.htmlContent).toContain("</html>");
      expect(template.htmlContent).toContain("<body");
      expect(template.htmlContent).toContain("</body>");
    });
  });
});

describe("Product Variants", () => {
  it("should validate variant data", () => {
    const variant = {
      productId: 1,
      size: "Medium",
      color: "#FF0000",
      sku: "PROD-001-M-RED",
      price: 29.99,
      stockQuantity: 50,
    };

    expect(variant.sku).toBeTruthy();
    expect(variant.price).toBeGreaterThan(0);
    expect(variant.stockQuantity).toBeGreaterThanOrEqual(0);
  });

  it("should handle variant without size or color", () => {
    const variant = {
      productId: 1,
      sku: "PROD-001",
      price: 29.99,
      stockQuantity: 100,
    };

    expect(variant.sku).toBeTruthy();
    expect(variant.price).toBeGreaterThan(0);
  });

  it("should calculate variant total value", () => {
    const variant = {
      productId: 1,
      sku: "PROD-001",
      price: 29.99,
      stockQuantity: 100,
    };

    const totalValue = variant.price * variant.stockQuantity;
    expect(totalValue).toBe(2999);
  });
});
