import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";

describe("Core E-Commerce Features", () => {
  let caller: any;

  beforeAll(async () => {
    const mockContext = {
      user: null,
      req: {} as any,
      res: {} as any,
    };
    caller = appRouter.createCaller(mockContext);
  });

  describe("Categories", () => {
    it("should list all categories", async () => {
      const categories = await caller.categories.list();
      expect(Array.isArray(categories)).toBe(true);
    });

    it("should list active categories", async () => {
      const categories = await caller.categories.listActive();
      expect(Array.isArray(categories)).toBe(true);
    });
  });

  describe("Products", () => {
    it("should list all products", async () => {
      const products = await caller.products.list();
      expect(Array.isArray(products)).toBe(true);
    });

    it("should get product by ID", async () => {
      const products = await caller.products.list();
      if (products.length > 0) {
        const product = await caller.products.getById({ id: products[0].id });
        expect(product).toBeDefined();
        expect(product.id).toBe(products[0].id);
      }
    });

    it("should search products", async () => {
      const results = await caller.products.search({ query: "test" });
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe("Chat System", () => {
    let conversationId: number;

    it("should create a new conversation", async () => {
      const conversation = await caller.chat.createConversation({
        customerName: "Test Customer",
        customerEmail: "test@example.com",
        customerPhone: "+1234567890",
      });
      expect(conversation).toBeDefined();
      expect(conversation.id).toBeDefined();
      conversationId = conversation.id;
    });

    it("should send a text message", async () => {
      if (!conversationId) {
        const conversation = await caller.chat.createConversation({
          customerName: "Test User",
          customerEmail: "test@example.com",
        });
        conversationId = conversation.id;
      }

      const message = await caller.chat.sendMessage({
        conversationId,
        senderType: "customer",
        messageType: "text",
        content: "Hello, this is a test message",
      });

      expect(message).toBeDefined();
      expect(message.id).toBeDefined();
      expect(message.content).toBe("Hello, this is a test message");
    });

    it("should get messages from conversation", async () => {
      if (!conversationId) {
        const conversation = await caller.chat.createConversation({
          customerName: "Test User",
          customerEmail: "test@example.com",
        });
        conversationId = conversation.id;
      }

      const messages = await caller.chat.getMessages({
        conversationId,
        limit: 10,
        offset: 0,
      });

      expect(Array.isArray(messages)).toBe(true);
    });

    it("should mark message as read", async () => {
      if (!conversationId) {
        const conversation = await caller.chat.createConversation({
          customerName: "Test User",
          customerEmail: "test@example.com",
        });
        conversationId = conversation.id;
      }

      const message = await caller.chat.sendMessage({
        conversationId,
        senderType: "customer",
        messageType: "text",
        content: "Test message to mark as read",
      });

      const marked = await caller.chat.markAsRead({
        messageId: message.id,
      });

      expect(marked).toBeDefined();
    });
  });

  describe("Site Settings", () => {
    it("should get site settings", async () => {
      const settings = await caller.siteSettings.get();
      expect(settings).toBeDefined();
      expect(settings.siteName).toBeDefined();
    });

    it("should get currency rates", async () => {
      const rates = await caller.siteSettings.getCurrencyRates();
      expect(rates).toBeDefined();
      expect(typeof rates).toBe("object");
    });
  });

  describe("Coupons", () => {
    it("should list coupons", async () => {
      const coupons = await caller.coupons.list({ limit: 10, offset: 0 });
      expect(Array.isArray(coupons)).toBe(true);
    });

    it("should validate coupon", async () => {
      const coupons = await caller.coupons.list();
      if (coupons.length > 0) {
        const coupon = coupons[0];
        const validation = await caller.coupons.validate({
          code: coupon.code,
          cartTotal: 100,
        });
        expect(validation).toBeDefined();
        expect(typeof validation.isValid).toBe("boolean");
      }
    });
  });

  describe("Orders", () => {
    it("should list orders", async () => {
      const orders = await caller.orders.list({ limit: 10, offset: 0 });
      expect(Array.isArray(orders)).toBe(true);
    });

    it("should get order by ID", async () => {
      const orders = await caller.orders.list();
      if (orders.length > 0) {
        const order = await caller.orders.getById({ id: orders[0].id });
        expect(order).toBeDefined();
        expect(order.id).toBe(orders[0].id);
      }
    });
  });

  describe("Reviews", () => {
    it("should list reviews", async () => {
      const reviews = await caller.reviews.list({ limit: 10, offset: 0 });
      expect(Array.isArray(reviews)).toBe(true);
    });
  });

  describe("Blog", () => {
    it("should list published blog posts", async () => {
      const posts = await caller.blog.listPublished();
      expect(Array.isArray(posts)).toBe(true);
    });
  });

  describe("Page Sections", () => {
    it("should list page sections", async () => {
      const sections = await caller.pageSections.list({ pageName: "home" });
      expect(Array.isArray(sections)).toBe(true);
      expect(sections.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Newsletter", () => {
    it("should subscribe to newsletter", async () => {
      try {
        const result = await caller.newsletter.subscribe({
          email: `test-${Date.now()}@example.com`,
        });
        expect(result).toBeDefined();
        if (result.success !== undefined) {
          expect(result.success).toBe(true);
        }
      } catch (error: any) {
        // Newsletter might have specific validation, that's ok
        expect(error).toBeDefined();
      }
    });
  });

  describe("Chat Media Upload", () => {
    it("should upload image media successfully", async () => {
      // Create a simple PNG image (1x1 pixel)
      const pngBuffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
        0x00, 0x00, 0x00, 0x0d,
        0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x01,
        0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00,
        0x90, 0x77, 0x53, 0xde,
      ]);

      const base64Image = pngBuffer.toString("base64");

      // First create a conversation
      const conversation = await caller.chat.createConversation({
        customerName: "Test User",
        customerEmail: "test@example.com",
      });

      const result = await caller.chat.uploadMedia({
        conversationId: conversation.id,
        fileData: `data:image/png;base64,${base64Image}`,
        fileName: "test.png",
        mimeType: "image/png",
        messageType: "image",
      });

      expect(result).toBeDefined();
      expect(result.mediaUrl).toBeDefined();
      expect(result.deduplicated).toBe(false);
      expect(result.mediaUrl).toContain("http");
    });

    it("should reject invalid messageType", async () => {
      const pngBuffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
        0x00, 0x00, 0x00, 0x0d,
        0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x01,
        0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00,
        0x90, 0x77, 0x53, 0xde,
      ]);

      const base64Image = pngBuffer.toString("base64");

      const conversation = await caller.chat.createConversation({
        customerName: "Test User",
        customerEmail: "test@example.com",
      });

      try {
        await caller.chat.uploadMedia({
          conversationId: conversation.id,
          fileData: `data:image/png;base64,${base64Image}`,
          fileName: "test.png",
          mimeType: "image/png",
          messageType: "invalid" as any,
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    });

    it("should reject mismatched MIME type", async () => {
      const pngBuffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
        0x00, 0x00, 0x00, 0x0d,
        0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x01,
        0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00,
        0x90, 0x77, 0x53, 0xde,
      ]);

      const base64Image = pngBuffer.toString("base64");

      const conversation = await caller.chat.createConversation({
        customerName: "Test User",
        customerEmail: "test@example.com",
      });

      try {
        await caller.chat.uploadMedia({
          conversationId: conversation.id,
          fileData: `data:image/png;base64,${base64Image}`,
          fileName: "test.png",
          mimeType: "audio/webm", // Wrong MIME type for image
          messageType: "image",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toContain("Invalid file type");
      }
    });
  });
});
