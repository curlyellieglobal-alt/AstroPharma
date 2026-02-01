import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTRPCMsw } from "trpc-msw";
import { appRouter } from "./routers";
import type { inferProcedureInput } from "@trpc/server";

describe("CurlyEllie Complete Features", () => {
  describe("Products API", () => {
    it("should list all products", async () => {
      const caller = appRouter.createCaller({} as any);
      const products = await caller.products.list();
      
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBeGreaterThan(0);
      expect(products[0]).toHaveProperty("id");
      expect(products[0]).toHaveProperty("name");
      expect(products[0]).toHaveProperty("price");
    });

    it("should get product by ID", async () => {
      const caller = appRouter.createCaller({} as any);
      const product = await caller.products.getById({ id: 1 });
      
      if (product) {
        expect(product).toHaveProperty("id");
        expect(product).toHaveProperty("name");
        expect(product).toHaveProperty("price");
        expect(product).toHaveProperty("stockQuantity");
      }
    });

    it("should search products by name", async () => {
      const caller = appRouter.createCaller({} as any);
      const results = await caller.products.search({ query: "Curly" });
      
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe("Orders API", () => {
    it("should list all orders", async () => {
      const caller = appRouter.createCaller({} as any);
      const orders = await caller.orders.listAll();
      
      expect(Array.isArray(orders)).toBe(true);
    });

    it("should create an order with items", async () => {
      const caller = appRouter.createCaller({} as any);
      
      const order = await caller.orders.create({
        items: [
          {
            productId: 1,
            quantity: 2,
            price: 29.99,
          },
        ],
        customerName: "Test Customer",
        email: "test@example.com",
        phone: "+1234567890",
        shippingAddress: "123 Test St",
        shippingCity: "Test City",
        shippingPostalCode: "12345",
        totalAmount: 59.98,
        paymentMethod: "stripe",
        currency: "USD",
      });

      expect(order).toHaveProperty("id");
      expect(order).toHaveProperty("orderNumber");
      expect(order).toHaveProperty("totalAmount");
      expect(order.totalAmount).toBe(59.98);
    });

    it("should update order status", async () => {
      const caller = appRouter.createCaller({} as any);
      
      // First create an order
      const order = await caller.orders.create({
        items: [{ productId: 1, quantity: 1, price: 29.99 }],
        customerName: "Test",
        email: "test@example.com",
        phone: "+1234567890",
        shippingAddress: "123 Test St",
        shippingCity: "Test City",
        shippingPostalCode: "12345",
        totalAmount: 29.99,
        paymentMethod: "stripe",
        currency: "USD",
      });

      // Then update its status
      const updated = await caller.orders.updateStatus({
        orderId: order.id,
        status: "processing",
      });

      expect(updated).toHaveProperty("status");
      expect(updated.status).toBe("processing");
    });
  });

  describe("Chat System", () => {
    it("should create a conversation", async () => {
      const caller = appRouter.createCaller({} as any);
      
      const conversation = await caller.chat.createConversation({
        title: "Test Conversation",
      });

      expect(conversation).toHaveProperty("id");
      expect(conversation).toHaveProperty("title");
      expect(conversation.title).toBe("Test Conversation");
    });

    it("should send a message", async () => {
      const caller = appRouter.createCaller({} as any);
      
      // Create conversation first
      const conversation = await caller.chat.createConversation({
        title: "Test Chat",
      });

      // Send message
      const message = await caller.chat.sendMessage({
        conversationId: conversation.id,
        content: "Hello, this is a test message",
        messageType: "text",
      });

      expect(message).toHaveProperty("id");
      expect(message).toHaveProperty("content");
      expect(message.content).toBe("Hello, this is a test message");
    });

    it("should get conversation messages", async () => {
      const caller = appRouter.createCaller({} as any);
      
      // Create conversation
      const conversation = await caller.chat.createConversation({
        title: "Test Messages",
      });

      // Send message
      await caller.chat.sendMessage({
        conversationId: conversation.id,
        content: "Test message",
        messageType: "text",
      });

      // Get messages
      const messages = await caller.chat.getMessages({
        conversationId: conversation.id,
      });

      expect(Array.isArray(messages)).toBe(true);
      expect(messages.length).toBeGreaterThan(0);
    });

    it("should upload media to chat", async () => {
      const caller = appRouter.createCaller({} as any);
      
      // Create conversation
      const conversation = await caller.chat.createConversation({
        title: "Media Test",
      });

      // Upload media
      const base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
      
      const media = await caller.chat.uploadMedia({
        conversationId: conversation.id,
        data: base64Image,
        messageType: "image",
        mimeType: "image/png",
      });

      expect(media).toHaveProperty("url");
      expect(media).toHaveProperty("messageType");
      expect(media.messageType).toBe("image");
    });
  });

  describe("Categories API", () => {
    it("should list all categories", async () => {
      const caller = appRouter.createCaller({} as any);
      const categories = await caller.categories.list();
      
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
    });

    it("should list active categories", async () => {
      const caller = appRouter.createCaller({} as any);
      const categories = await caller.categories.listActive();
      
      expect(Array.isArray(categories)).toBe(true);
      categories.forEach(cat => {
        expect(cat).toHaveProperty("isActive");
        expect(cat.isActive).toBe(true);
      });
    });
  });

  describe("Coupons API", () => {
    it("should list all coupons", async () => {
      const caller = appRouter.createCaller({} as any);
      const coupons = await caller.coupons.list();
      
      expect(Array.isArray(coupons)).toBe(true);
    });

    it("should validate a coupon code", async () => {
      const caller = appRouter.createCaller({} as any);
      
      const result = await caller.coupons.validate({
        code: "WELCOME10",
        userId: undefined,
        cartTotal: 100,
        productIds: [1, 2],
        categoryIds: [1],
      });

      expect(result).toHaveProperty("valid");
      expect(typeof result.valid).toBe("boolean");
    });
  });

  describe("Blog API", () => {
    it("should list published blog posts", async () => {
      const caller = appRouter.createCaller({} as any);
      const posts = await caller.blog.listPublished();
      
      expect(Array.isArray(posts)).toBe(true);
    });
  });

  describe("Page Sections API", () => {
    it("should get page sections", async () => {
      const caller = appRouter.createCaller({} as any);
      const sections = await caller.pageSections.get();
      
      expect(Array.isArray(sections)).toBe(true);
    });
  });

  describe("Reviews API", () => {
    it("should list reviews", async () => {
      const caller = appRouter.createCaller({} as any);
      const reviews = await caller.reviews.list({ limit: 10, offset: 0 });
      
      expect(Array.isArray(reviews)).toBe(true);
    });
  });

  describe("Integration Tests", () => {
    it("should complete a full order flow", async () => {
      const caller = appRouter.createCaller({} as any);

      // 1. Get products
      const products = await caller.products.list();
      expect(products.length).toBeGreaterThan(0);

      // 2. Create order
      const order = await caller.orders.create({
        items: [
          {
            productId: products[0].id,
            quantity: 1,
            price: products[0].price,
          },
        ],
        customerName: "Integration Test",
        email: "integration@test.com",
        phone: "+1234567890",
        shippingAddress: "123 Test St",
        shippingCity: "Test City",
        shippingPostalCode: "12345",
        totalAmount: products[0].price,
        paymentMethod: "stripe",
        currency: "USD",
      });

      expect(order).toHaveProperty("id");
      expect(order).toHaveProperty("orderNumber");

      // 3. Update order status
      const updated = await caller.orders.updateStatus({
        orderId: order.id,
        status: "processing",
      });

      expect(updated.status).toBe("processing");
    });

    it("should complete a full chat flow", async () => {
      const caller = appRouter.createCaller({} as any);

      // 1. Create conversation
      const conversation = await caller.chat.createConversation({
        title: "Integration Test Chat",
      });

      expect(conversation).toHaveProperty("id");

      // 2. Send message
      const message = await caller.chat.sendMessage({
        conversationId: conversation.id,
        content: "Integration test message",
        messageType: "text",
      });

      expect(message).toHaveProperty("id");

      // 3. Get messages
      const messages = await caller.chat.getMessages({
        conversationId: conversation.id,
      });

      expect(messages.length).toBeGreaterThan(0);
      expect(messages[0].content).toBe("Integration test message");
    });
  });
});
