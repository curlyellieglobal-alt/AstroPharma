import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { nanoid } from "nanoid";
import { notifyOwnerNewOrder, sendOrderConfirmationEmail } from "./notifications";
import { sendOrderConfirmationEmail as sendCustomerEmail } from "./emailService";
import { contentGenerationRouter } from "./contentGenerationRouters";
import { notificationRouter } from "./notificationRouters";
import { createPaymentIntent, createCheckoutSession, retrievePaymentIntent } from "./stripe";
import { adminRouter } from "./adminRouter";
import { seoRouter } from "./routers/seo";
import { otpRouter } from "./routers/otp";
import { companyNotificationsRouter } from "./routers/companyNotifications";

// Admin-only procedure - DISABLED: Authentication removed
// All dashboard operations now public (no login required)
const adminProcedure = publicProcedure;

export const appRouter = router({
  system: systemRouter,
  contentGeneration: contentGenerationRouter,
  notifications: notificationRouter,
  admin: adminRouter,
  seo: seoRouter,
  otp: otpRouter,
  companyNotifications: companyNotificationsRouter,
  
  // ============= STRIPE PAYMENTS =============
  stripe: router({
    createPaymentIntent: publicProcedure
      .input(z.object({
        amount: z.number(),
        currency: z.string().default('usd'),
      }))
      .mutation(async ({ input }) => {
        return await createPaymentIntent(input.amount, input.currency);
      }),
    
    createCheckoutSession: publicProcedure
      .input(z.object({
        amount: z.number(),
        currency: z.string().default('usd'),
        successUrl: z.string(),
        cancelUrl: z.string(),
        customerEmail: z.string().email().optional(),
        orderId: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await createCheckoutSession({
          amount: input.amount,
          currency: input.currency,
          successUrl: input.successUrl,
          cancelUrl: input.cancelUrl,
          customerEmail: input.customerEmail,
          metadata: input.orderId ? { orderId: input.orderId } : undefined,
        });
      }),
    
    verifyPayment: publicProcedure
      .input(z.object({
        paymentIntentId: z.string(),
      }))
      .query(async ({ input }) => {
        const paymentIntent = await retrievePaymentIntent(input.paymentIntentId);
        return {
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
        };
      }),
  }),
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============= CATEGORIES =============
  categories: router({
    list: publicProcedure.query(async () => {
      return await db.getAllCategories();
    }),
    
    listActive: publicProcedure.query(async () => {
      return await db.getActiveCategories();
    }),
    
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return await db.getCategoryBySlug(input.slug);
      }),
    
    create: adminProcedure
      .input(z.object({
        name: z.string(),
        slug: z.string(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        displayOrder: z.number().default(0),
        isActive: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        await db.createCategory(input);
        return { success: true };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        displayOrder: z.number().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateCategory(id, data);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCategory(input.id);
        return { success: true };
      }),
  }),

  // ============= PRODUCTS =============
  products: router({
    list: publicProcedure.query(async () => {
      return await db.getActiveProducts();
    }),
    
    listByCurrency: publicProcedure
      .input(z.object({ currency: z.string() }))
      .query(async ({ input }) => {
        return await db.getActiveByCurrency(input.currency);
      }),
    
    listAll: adminProcedure.query(async () => {
      return await db.getAllProducts();
    }),
    
    listAllByCurrency: adminProcedure
      .input(z.object({ currency: z.string() }))
      .query(async ({ input }) => {
        return await db.getProductsByCurrency(input.currency);
      }),
    
    featured: publicProcedure.query(async () => {
      return await db.getFeaturedProducts();
    }),
    
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return await db.getProductBySlug(input.slug);
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductById(input.id);
      }),
    
    getByCategory: publicProcedure
      .input(z.object({ categoryId: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductsByCategory(input.categoryId);
      }),
    
    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return await db.searchProducts(input.query);
      }),
    
    create: adminProcedure
      .input(z.object({
        name: z.string(),
        slug: z.string(),
        description: z.string().optional(),
        shortDescription: z.string().optional(),
        price: z.string(),
        compareAtPrice: z.string().optional(),
        costPerItem: z.string().optional(),
        sku: z.string().optional(),
        barcode: z.string().optional(),
        stockQuantity: z.number().default(0),
        trackInventory: z.boolean().default(true),
        allowBackorder: z.boolean().default(false),
        categoryId: z.number().optional(),
        images: z.array(z.string()).optional(),
        weight: z.string().optional(),
        weightUnit: z.enum(["kg", "g", "lb", "oz"]).default("g"),
        dimensions: z.object({
          length: z.number(),
          width: z.number(),
          height: z.number(),
          unit: z.string(),
        }).optional(),
        tags: z.array(z.string()).optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        isActive: z.boolean().default(true),
        isFeatured: z.boolean().default(false),
      }))
      .mutation(async ({ input }) => {
        await db.createProduct(input as any);
        return { success: true };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
        shortDescription: z.string().optional(),
        price: z.string().optional(),
        compareAtPrice: z.string().optional(),
        costPerItem: z.string().optional(),
        sku: z.string().optional(),
        barcode: z.string().optional(),
        stockQuantity: z.number().optional(),
        trackInventory: z.boolean().optional(),
        allowBackorder: z.boolean().optional(),
        categoryId: z.number().optional(),
        images: z.array(z.string()).optional(),
        weight: z.string().optional(),
        weightUnit: z.enum(["kg", "g", "lb", "oz"]).optional(),
        dimensions: z.object({
          length: z.number(),
          width: z.number(),
          height: z.number(),
          unit: z.string(),
        }).optional(),
        tags: z.array(z.string()).optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        isActive: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
        currency: z.string().optional(),
        priceUSD: z.string().optional(),
        priceEGP: z.string().optional(),
        priceEUR: z.string().optional(),
        priceGBP: z.string().optional(),
        priceSAR: z.string().optional(),
        priceAED: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateProduct(id, data as any);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProduct(input.id);
        return { success: true };
      }),
  }),

  // ============= ORDERS =============
  orders: router({
    listAll: adminProcedure.query(async () => {
      return await db.getAllOrders();
    }),
    
    myOrders: protectedProcedure.query(async ({ ctx }) => {
      return await db.getOrdersByUser(ctx.user.id);
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const order = await db.getOrderById(input.id);
        if (!order) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' });
        }
        
        // Check authorization
        if (ctx.user.role !== 'admin' && order.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized to view this order' });
        }
        
        const items = await db.getOrderItems(order.id);
        return { ...order, items };
      }),
    
    getByNumber: publicProcedure
      .input(z.object({ orderNumber: z.string(), email: z.string() }))
      .query(async ({ input }) => {
        const order = await db.getOrderByNumber(input.orderNumber);
        if (!order || order.customerEmail !== input.email) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' });
        }
        
        const items = await db.getOrderItems(order.id);
        return { ...order, items };
      }),
    
    create: publicProcedure
      .input(z.object({
        userId: z.number().optional(),
        customerName: z.string(),
        email: z.string().email(),
        phone: z.string().min(10, 'Phone number is required'),
        shippingAddress: z.string(),
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.number(),
          price: z.string(),
        })),
        paymentMethod: z.string(),
        paymentProvider: z.enum(["stripe", "fawry", "payoneer", "cod", "instapay", "vodafone_cash"]),
      }))
      .mutation(async ({ input }) => {
        // Calculate order totals
        let subtotal = 0;
        const orderItems = [];
        
        for (const item of input.items) {
          const product = await db.getProductById(item.productId);
          if (!product) {
            throw new TRPCError({ code: 'NOT_FOUND', message: `Product ${item.productId} not found` });
          }
          
          // Check stock
          if (product.trackInventory && product.stockQuantity < item.quantity) {
            throw new TRPCError({ 
              code: 'BAD_REQUEST', 
              message: `Insufficient stock for ${product.name}` 
            });
          }
          
          const itemSubtotal = parseFloat(product.price) * item.quantity;
          subtotal += itemSubtotal;
          
          orderItems.push({
            productId: product.id,
            productName: product.name,
            productSku: product.sku || null,
            productImage: product.images?.[0] || null,
            quantity: item.quantity,
            price: product.price,
            subtotal: itemSubtotal.toFixed(2),
          });
        }
        
        const shippingCost = 0; // TODO: Calculate shipping
        const tax = 0; // TODO: Calculate tax
        const total = subtotal + shippingCost + tax;
        
        const orderNumber = `ORD-${nanoid(10).toUpperCase()}`;
        
        const orderId = await db.createOrder({
          orderNumber,
          userId: input.userId || null,
          customerName: input.customerName,
          customerEmail: input.email,
          customerPhone: input.phone || null,
          shippingAddress: input.shippingAddress,
          subtotal: subtotal.toFixed(2),
          shippingCost: shippingCost.toFixed(2),
          tax: tax.toFixed(2),
          total: total.toFixed(2),
          status: "pending",
          paymentStatus: "pending",
          paymentMethod: input.paymentMethod,
          paymentProvider: input.paymentProvider,
        } as any, orderItems as any);
        
        // Update stock quantities
        for (const item of input.items) {
          const product = await db.getProductById(item.productId);
          if (product && product.trackInventory) {
            await db.updateProductStock(item.productId, -item.quantity);
          }
        }
        
        // Send notifications
        try {
          // Create in-app notification
          await db.createNotification({
            userId: null, // System-wide for admins
            type: "order",
            title: `New Order: ${orderNumber}`,
            message: `${input.customerName} placed an order for $${total.toFixed(2)}`,
            link: `/admin/orders`,
            isRead: false,
          });
          
          // Send email confirmation to customer
          const itemsList = orderItems.map(item => ({
            name: item.productName,
            quantity: item.quantity,
            price: item.price,
          }));
          
          await sendCustomerEmail({
            orderId: orderNumber,
            customerName: input.customerName,
            customerEmail: input.email,
            orderTotal: total.toFixed(2),
            orderItems: itemsList,
            shippingAddress: input.shippingAddress,
            orderDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          });
          
          // Send WhatsApp notification
          const { notifyNewOrder } = await import("./whatsappNotification");
          await notifyNewOrder(orderId);
          
          // Send company WhatsApp notification
          try {
            const trpc = await import("./routers");
            const caller = (trpc.appRouter as any).createCaller({ user: null });
            await caller.companyNotifications.sendOrderNotification({
              orderId,
              orderNumber,
              customerName: input.customerName,
              customerEmail: input.email,
              customerPhone: input.phone,
              total: total.toFixed(2),
              currency: 'EGP',
              items: orderItems.map(item => ({
                productName: item.productName,
                quantity: item.quantity,
                price: item.price,
              })),
              shippingAddress: input.shippingAddress,
              paymentMethod: input.paymentMethod,
            });
          } catch (error) {
            console.warn("Failed to send company notification:", error);
          }
        } catch (error) {
          console.error("Failed to send notifications:", error);
        }
        
        return { orderId, orderNumber };
      }),
    
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled", "refunded"]),
      }))
      .mutation(async ({ input }) => {
        await db.updateOrderStatus(input.id, input.status);
        return { success: true };
      }),
    
    updatePaymentStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]),
        transactionId: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.updateOrderPaymentStatus(input.id, input.paymentStatus, input.transactionId);
        return { success: true };
      }),
  }),

  // ============= BLOG POSTS =============
  blog: router({
    listPublished: publicProcedure.query(async () => {
      return await db.getPublishedBlogPosts();
    }),
    
    listAll: adminProcedure.query(async () => {
      return await db.getAllBlogPosts();
    }),
    
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const post = await db.getBlogPostBySlug(input.slug);
        if (post) {
          await db.incrementBlogPostViews(post.id);
        }
        return post;
      }),
    
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getBlogPostById(input.id);
      }),
    
    create: adminProcedure
      .input(z.object({
        title: z.string(),
        slug: z.string(),
        excerpt: z.string().optional(),
        content: z.string(),
        featuredImage: z.string().optional(),
        categoryId: z.number().optional(),
        tags: z.array(z.string()).optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        isPublished: z.boolean().default(false),
      }))
      .mutation(async ({ input, ctx }) => {
        const blogData: any = {
          ...input,
          authorId: ctx.user?.id || 1,
          authorName: ctx.user?.name || "Admin",
          publishedAt: input.isPublished ? new Date() : null,
        };
        await db.createBlogPost(blogData);
        return { success: true };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        slug: z.string().optional(),
        excerpt: z.string().optional(),
        content: z.string().optional(),
        featuredImage: z.string().optional(),
        categoryId: z.number().optional(),
        tags: z.array(z.string()).optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        isPublished: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        
        // If publishing for the first time, set publishedAt
        if (data.isPublished) {
          const existing = await db.getBlogPostById(id);
          if (existing && !existing.isPublished) {
            (data as any).publishedAt = new Date();
          }
        }
        
        await db.updateBlogPost(id, data as any);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteBlogPost(input.id);
        return { success: true };
      }),
  }),

  // ============= MEDIA ASSETS =============
  media: router({
    list: adminProcedure.query(async () => {
      return await db.getAllMediaAssets();
    }),
    
    listByFolder: adminProcedure
      .input(z.object({ folder: z.string() }))
      .query(async ({ input }) => {
        return await db.getMediaAssetsByFolder(input.folder);
      }),
    
    upload: adminProcedure
      .input(z.object({
        fileName: z.string(),
        fileKey: z.string(),
        url: z.string(),
        thumbnailUrl: z.string().optional(),
        mimeType: z.string().optional(),
        fileSize: z.number().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
        folder: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createMediaAsset({
          ...input,
          uploadedBy: ctx.user?.id || 1,
        } as any);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteMediaAsset(input.id);
        return { success: true };
      }),
    
    deleteByUrl: publicProcedure
      .input(z.object({ url: z.string().url() }))
      .mutation(async ({ input }) => {
        try {
          // Extract key from URL
          const url = new URL(input.url);
          const key = url.pathname.substring(1); // Remove leading slash
          
          // Delete from S3 (ignore 404 errors - file may have been deleted already)
          const { storageDelete } = await import("./storage");
          try {
            await storageDelete(key);
          } catch (storageError: any) {
            // If it's a 404, that's okay - the file doesn't exist in S3
            // But we still want to remove it from the database
            if (!storageError.message?.includes("404")) {
              throw storageError;
            }
          }
          
          // Note: Media record in database will remain, but file is deleted from S3
          // This is acceptable since the URL will no longer be accessible
          
          return { success: true, message: "Media deleted successfully" };
        } catch (error: any) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Failed to delete media",
          });
        }
      }),
    
    getUsage: publicProcedure
      .input(z.object({ url: z.string().url() }))
      .query(async ({ input }) => {
        return await db.getMediaUsage(input.url);
      }),
  }),

  // ============= PAGE SECTIONS =============
  pageSections: router({
    list: publicProcedure
      .input(z.object({ pageName: z.string().default("home") }))
      .query(async ({ input }) => {
        return await db.getVisiblePageSections(input.pageName);
      }),
    
    listAll: adminProcedure
      .input(z.object({ pageName: z.string().default("home") }))
      .query(async ({ input }) => {
        return await db.getPageSections(input.pageName);
      }),
    
    create: adminProcedure
      .input(z.object({
        pageName: z.string().default("home"),
        sectionKey: z.string(),
        title: z.string().optional(),
        subtitle: z.string().optional(),
        content: z.string().optional(),
        imageUrl: z.string().optional(),
        ctaText: z.string().optional(),
        ctaLink: z.string().optional(),
        data: z.record(z.string(), z.any()).optional(),
        displayOrder: z.number().default(0),
        isVisible: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        const sectionData: any = input;
        await db.createPageSection(sectionData);
        return { success: true };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        subtitle: z.string().optional(),
        content: z.string().optional(),
        imageUrl: z.string().optional(),
        ctaText: z.string().optional(),
        ctaLink: z.string().optional(),
        data: z.record(z.string(), z.any()).optional(),
        displayOrder: z.number().optional(),
        isVisible: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updatePageSection(id, data as any);
        const updated = await db.getPageSectionById(id);
        return updated;
      }),
    
    toggleVisibility: adminProcedure
      .input(z.object({
        id: z.number(),
        isVisible: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        await db.togglePageSectionVisibility(input.id, input.isVisible);
        return { success: true };
      }),
  }),

  // ============= SEO SETTINGS =============
  seoSettings: router({
    get: publicProcedure
      .input(z.object({ pagePath: z.string() }))
      .query(async ({ input }) => {
        return await db.getSeoSettings(input.pagePath);
      }),
    
    listAll: adminProcedure.query(async () => {
      return await db.getAllSeoSettings();
    }),
    
    upsert: adminProcedure
      .input(z.object({
        pagePath: z.string(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        metaKeywords: z.string().optional(),
        ogTitle: z.string().optional(),
        ogDescription: z.string().optional(),
        ogImage: z.string().optional(),
        schemaMarkup: z.record(z.string(), z.any()).optional(),
        canonicalUrl: z.string().optional(),
        noIndex: z.boolean().default(false),
        noFollow: z.boolean().default(false),
      }))
      .mutation(async ({ input }) => {
        const seoData: any = input;
        await db.upsertSeoSettings(seoData);
        return { success: true };
      }),
  }),

  // ============= LIVE CHAT =============
  chat: router({
    // Create new conversation
    createConversation: publicProcedure
      .input(z.object({
        customerName: z.string(),
        customerEmail: z.string().email().optional(),
        customerPhone: z.string().min(10, 'Phone number is required').optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createChatConversation(input);
      }),
    
    // Send message
    sendMessage: publicProcedure
      .input(z.object({
        conversationId: z.number(),
        senderType: z.enum(["customer", "admin"]),
        messageType: z.enum(["text", "image", "voice", "video"]).default("text"),
        content: z.string(),
        mediaUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const message = await db.createChatMessage(input);
        
        // Send WhatsApp notification for customer messages
        if (input.senderType === "customer") {
          try {
            const { notifyNewChatMessage } = await import("./whatsappNotification");
            await notifyNewChatMessage(input.conversationId, message.id);
          } catch (error) {
            console.error("Failed to send WhatsApp notification:", error);
          }
        }
        
        return message;
      }),
    
    // Get messages for a conversation
    getMessages: publicProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input }) => {
        return await db.getChatMessages(input.conversationId);
      }),
    
    // Get all conversations (admin)
    getConversations: adminProcedure
      .query(async () => {
        return await db.getAllChatConversations();
      }),
    
    // Mark messages as read
    markAsRead: publicProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(async ({ input }) => {
        await db.markChatMessagesAsRead(input.conversationId);
        return { success: true };
      }),
    
    // Close conversation
    closeConversation: adminProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(async ({ input }) => {
        await db.closeChatConversation(input.conversationId);
        return { success: true };
      }),
    
    // AI Chatbot: Auto-greeting for new conversations
    sendAutoGreeting: publicProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(async ({ input }) => {
        const greetingMessage = "مرحباً بك في Curly Ellie! 👋\n\nكيف يمكنني مساعدتك اليوم؟\n\n- استفسار عن المنتجات\n- تتبع طلبك\n- الشحن والإرجاع\n- أسئلة عامة";
        
        await db.createChatMessage({
          conversationId: input.conversationId,
          senderType: "admin",
          messageType: "text",
          content: greetingMessage,
        });
        
        return { success: true };
      }),
    
    // AI Chatbot: Detect intent and auto-respond
    detectIntentAndRespond: publicProcedure
      .input(z.object({ 
        conversationId: z.number(),
        userMessage: z.string() 
      }))
      .mutation(async ({ input }) => {
        const { invokeLLM } = await import("./_core/llm");
        
        // Detect intent using AI
        const intentResponse = await invokeLLM({
          messages: [
            { 
              role: "system", 
              content: "You are an intent classifier for an e-commerce chatbot. Classify the user's message into ONE of these categories: product_inquiry, order_status, shipping_returns, general_question, human_escalation. Return ONLY the category name, nothing else." 
            },
            { role: "user", content: input.userMessage },
          ],
        });
        
        const intentContent = intentResponse.choices[0].message.content;
        const intent = (typeof intentContent === 'string' ? intentContent.trim().toLowerCase() : 'general_question');
        
        // Get saved replies for auto-response
        const savedReplies = await db.listSavedReplies();
        let autoResponse = "";
        
        // Match intent to saved reply
        if (intent.includes("product")) {
          const reply = savedReplies.find(r => r.content.includes("منتج") || r.content.includes("product"));
          autoResponse = reply?.content || "يمكنك تصفح منتجاتنا من الصفحة الرئيسية. هل تحتاج مساعدة في اختيار منتج معين؟";
        } else if (intent.includes("order")) {
          autoResponse = "لتتبع طلبك، يرجى تزويدنا برقم الطلب. يمكنك العثور عليه في بريدك الإلكتروني.";
        } else if (intent.includes("shipping") || intent.includes("return")) {
          autoResponse = "نوفر شحن مجاني للطلبات فوق 500 جنيه. سياسة الإرجاع: 14 يوم من تاريخ الاستلام.";
        } else if (intent.includes("human")) {
          autoResponse = "سيتم تحويلك إلى أحد موظفينا قريباً. شكراً لانتظارك.";
        } else {
          autoResponse = "شكراً لتواصلك معنا. سيرد عليك أحد موظفينا في أقرب وقت ممكن.";
        }
        
        // Send auto-response
        await db.createChatMessage({
          conversationId: input.conversationId,
          senderType: "admin",
          messageType: "text",
          content: autoResponse,
        });
        
        return { intent, autoResponse };
      }),
    
    // Escalate to human admin
    escalateToHuman: publicProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(async ({ input }) => {
        // Mark conversation as requiring human attention
        await db.createChatMessage({
          conversationId: input.conversationId,
          senderType: "admin",
          messageType: "text",
          content: "تم تحويلك إلى موظف بشري. سيتم الرد عليك في أقرب وقت ممكن.",
        });
        
        return { success: true };
      }),
    
    // Translate message to Arabic
    translateMessage: publicProcedure
      .input(z.object({ text: z.string() }))
      .mutation(async ({ input }) => {
        // Use invokeLLM for instant AI translation
        const { invokeLLM } = await import("./_core/llm");
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a translator. Translate the following text to Arabic. Return ONLY the translation, nothing else." },
            { role: "user", content: input.text },
          ],
        });
        const translatedText = response.choices[0].message.content || input.text;
        return { translatedText };
      }),
    
    // Upload media file to S3
    uploadMedia: publicProcedure
      .input(z.object({
        conversationId: z.number(),
        fileData: z.string(), // base64 encoded file
        fileName: z.string(),
        mimeType: z.string(),
        messageType: z.enum(["image", "voice", "video"]),
        fileHash: z.string().optional(), // SHA-256 hash for deduplication
      }))
      .mutation(async ({ input }) => {
        const { storagePut } = await import("./storage");
        
        // Convert base64 to buffer
        const base64Data = input.fileData.split(',')[1] || input.fileData;
        const buffer = Buffer.from(base64Data, 'base64');
        
        // File size validation (16MB limit)
        const maxSize = 16 * 1024 * 1024; // 16MB
        if (buffer.length > maxSize) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'File size exceeds 16MB limit'
          });
        }
        
        // MIME type validation (expanded for cross-browser support)
        const allowedMimeTypes: Record<string, string[]> = {
          image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
          voice: [
            'audio/webm', 'audio/webm;codecs=opus',
            'audio/mp3', 'audio/mpeg', 'audio/mp4',
            'audio/wav', 'audio/ogg', 'audio/ogg;codecs=opus'
          ],
          video: [
            'video/webm', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus',
            'video/mp4', 'video/mp4;codecs=avc1,mp4a',
            'video/quicktime', 'video/x-msvideo'
          ]
        };
        
        const allowed = allowedMimeTypes[input.messageType];
        // Flexible MIME type matching (handles codecs parameters)
        const baseMimeType = input.mimeType.split(';')[0].trim();
        const isAllowed = allowed && allowed.some(type => 
          type.split(';')[0].trim() === baseMimeType
        );
        
        if (!isAllowed) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Invalid file type for ${input.messageType}. Received: ${input.mimeType}`
          });
        }
        
        // Check for duplicate file (if hash provided)
        if (input.fileHash) {
          const existingMessage = await db.findMessageByFileHash(input.fileHash);
          if (existingMessage && existingMessage.mediaUrl) {
            console.log(`[Deduplication] File hash ${input.fileHash.substring(0, 8)}... already exists, reusing URL`);
            return { mediaUrl: existingMessage.mediaUrl, deduplicated: true };
          }
        }
        
        // Generate unique file key
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(7);
        const fileKey = `chat/${input.conversationId}/${timestamp}-${randomSuffix}-${input.fileName}`;
        
        // Upload to S3
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        
        return { mediaUrl: url, deduplicated: false };
      }),
  }),

  // ============= SAVED REPLIES =============
  savedReplies: router({
    // Get all active saved replies (public - for customers)
    getAll: publicProcedure
      .query(async () => {
        return await db.listSavedReplies();
      }),
    
    // List all saved replies (admin)
    list: adminProcedure
      .input(z.object({ adminId: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.listSavedReplies(input.adminId);
      }),
    
    // Get saved reply by ID
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getSavedReplyById(input.id);
      }),
    
    // Create saved reply
    create: adminProcedure
      .input(z.object({
        adminId: z.number(),
        replyType: z.enum(["text", "image", "link"]),
        content: z.string(),
        mediaUrl: z.string().optional(),
        linkUrl: z.string().optional(),
        linkText: z.string().optional(),
        displayOrder: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        return await db.createSavedReply(input);
      }),
    
    // Update saved reply
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        replyType: z.enum(["text", "image", "link"]).optional(),
        content: z.string().optional(),
        mediaUrl: z.string().optional(),
        linkUrl: z.string().optional(),
        linkText: z.string().optional(),
        displayOrder: z.number().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateSavedReply(id, data);
        return { success: true };
      }),
    
    // Delete saved reply
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteSavedReply(input.id);
        return { success: true };
      }),
    
    // Reorder saved reply
    reorder: adminProcedure
      .input(z.object({ id: z.number(), newOrder: z.number() }))
      .mutation(async ({ input }) => {
        await db.reorderSavedReply(input.id, input.newOrder);
        return { success: true };
      }),
  }),

  // ============= SITE SETTINGS =============
  siteSettings: router({
    get: publicProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        return await db.getSiteSetting(input.key);
      }),
    
    getAll: adminProcedure
      .query(async () => {
        return await db.getAllSiteSettings();
      }),
    
    update: adminProcedure
      .input(z.object({
        key: z.string(),
        value: z.string().nullable(),
      }))
      .mutation(async ({ input }) => {
        await db.updateSiteSetting(input.key, input.value || "");
        return { success: true };
      }),
  }),

  // ============= USERS & ROLES =============
  users: router({
    list: adminProcedure.query(async () => {
      return await db.getAllUsers();
    }),
    
    updateRole: adminProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(["user", "admin"]),
      }))
      .mutation(async ({ input }) => {
        await db.updateUserRole(input.userId, input.role);
        return { success: true };
      }),
  }),

  // ============= FOOTER MANAGEMENT =============
  footer: router({
    get: publicProcedure
      .query(async () => {
        const settings = await db.getAllSiteSettings();
        const footerSettings = settings.filter(s => s.settingKey.startsWith('footer_'));
        
        // Convert array to object for easier access
        const footerData: Record<string, string> = {};
        footerSettings.forEach(setting => {
          const key = setting.settingKey.replace('footer_', '');
          footerData[key] = setting.settingValue || '';
        });
        
        return footerData;
      }),
    
    update: publicProcedure
      .input(z.object({
        companyName: z.string().optional(),
        companyDescription: z.string().optional(),
        copyrightText: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        facebookUrl: z.string().optional(),
        instagramUrl: z.string().optional(),
        twitterUrl: z.string().optional(),
        linkedinUrl: z.string().optional(),
        privacyPolicyUrl: z.string().optional(),
        termsOfServiceUrl: z.string().optional(),
        refundPolicyUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Update each setting (upsert: insert or update)
        for (const [key, value] of Object.entries(input)) {
          if (value !== undefined) {
            await db.upsertSiteSetting(`footer_${key}`, value);
          }
        }
        return { success: true };
      }),
  }),

  // ============= NEWSLETTER =============
  newsletter: router({
    subscribe: publicProcedure
      .input(z.object({
        email: z.string().email("Invalid email address"),
      }))
      .mutation(async ({ input }) => {
        try {
          await db.subscribeToNewsletter(input.email);
          return { success: true, message: "Successfully subscribed to newsletter!" };
        } catch (error: any) {
          if (error.message?.includes("Duplicate entry")) {
            return { success: true, message: "You're already subscribed!" };
          }
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to subscribe" });
        }
      }),
    
    list: adminProcedure
      .query(async () => {
        return await db.getAllNewsletterSubscribers();
      }),
    
    unsubscribe: publicProcedure
      .input(z.object({
        email: z.string().email(),
      }))
      .mutation(async ({ input }) => {
        await db.unsubscribeFromNewsletter(input.email);
        return { success: true, message: "Successfully unsubscribed" };
      }),
  }),

  productVariants: router({
    list: publicProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductVariants(input.productId);
      }),
    
    create: adminProcedure
      .input(z.object({
        productId: z.number(),
        name: z.string(),
        sku: z.string().optional(),
        size: z.string().optional(),
        color: z.string().optional(),
        price: z.number().optional(),
        compareAtPrice: z.number().optional(),
        stock: z.number(),
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { price, compareAtPrice, ...data } = input;
        const variantData = {
          ...data,
          ...(price !== undefined && { price: price.toString() }),
          ...(compareAtPrice !== undefined && { compareAtPrice: compareAtPrice.toString() }),
        };
        const id = await db.createProductVariant(variantData);
        return { id };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        sku: z.string().optional(),
        size: z.string().optional(),
        color: z.string().optional(),
        price: z.number().optional(),
        compareAtPrice: z.number().optional(),
        stock: z.number().optional(),
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, price, compareAtPrice, ...data } = input;
        const updateData = {
          ...data,
          ...(price !== undefined && { price: price.toString() }),
          ...(compareAtPrice !== undefined && { compareAtPrice: compareAtPrice.toString() }),
        };
        await db.updateProductVariant(id, updateData);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProductVariant(input.id);
        return { success: true };
      }),
  }),

  reviews: router({
    list: publicProcedure
      .input(z.object({ productId: z.number(), approvedOnly: z.boolean().optional() }))
      .query(async ({ input }) => {
        return await db.getProductReviews(input.productId, input.approvedOnly ?? true);
      }),
    
    create: publicProcedure
      .input(z.object({
        productId: z.number(),
        userId: z.number().optional(),
        authorName: z.string(),
        authorEmail: z.string().email().optional(),
        rating: z.number().min(1).max(5),
        title: z.string().optional(),
        comment: z.string().optional(),
        images: z.array(z.string()).optional(),
        isVerifiedPurchase: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createProductReview(input);
        return { id };
      }),
    
    pending: adminProcedure
      .query(async () => {
        return await db.getAllPendingReviews();
      }),
    
    approve: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.approveReview(input.id);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteReview(input.id);
        return { success: true };
      }),
    
    markHelpful: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.incrementReviewHelpful(input.id);
        return { success: true };
      }),
  }),

  wishlist: router({
    list: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getUserWishlist(ctx.user.id);
      }),
    
    add: protectedProcedure
      .input(z.object({
        productId: z.number(),
        variantId: z.number().optional(),
        priceWhenAdded: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.addToWishlist({
          userId: ctx.user.id,
          ...input,
        });
        return { id };
      }),
    
    remove: protectedProcedure
      .input(z.object({
        productId: z.number(),
        variantId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.removeFromWishlist(ctx.user.id, input.productId, input.variantId);
        return { success: true };
      }),
    
    check: protectedProcedure
      .input(z.object({
        productId: z.number(),
        variantId: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const inWishlist = await db.isInWishlist(ctx.user.id, input.productId, input.variantId);
        return { inWishlist };
      }),
  }),

  // ============= COUPONS & DISCOUNTS =============
  coupons: router({
    list: adminProcedure
      .query(async () => {
        return await db.getAllCoupons();
      }),
    
    listActive: publicProcedure
      .query(async () => {
        return await db.getActiveCoupons();
      }),
    
    getByCode: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        return await db.getCouponByCode(input.code);
      }),
    
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getCouponById(input.id);
      }),
    
    create: adminProcedure
      .input(z.object({
        code: z.string().min(3).max(50),
        description: z.string().optional(),
        discountType: z.enum(["percentage", "fixed"]),
        discountValue: z.number().positive(),
        minPurchaseAmount: z.number().optional(),
        maxDiscountAmount: z.number().optional(),
        usageLimit: z.number().int().positive().optional(),
        perUserLimit: z.number().int().positive().optional(),
        validFrom: z.date(),
        validUntil: z.date().optional(),
        isActive: z.boolean().default(true),
        applicableProducts: z.array(z.number()).optional(),
        applicableCategories: z.array(z.number()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Convert numeric fields to strings for decimal columns
        const dbData: any = { ...input };
        if (dbData.discountValue !== undefined) {
          dbData.discountValue = dbData.discountValue.toString();
        }
        if (dbData.minPurchaseAmount !== undefined) {
          dbData.minPurchaseAmount = dbData.minPurchaseAmount.toString();
        }
        if (dbData.maxDiscountAmount !== undefined) {
          dbData.maxDiscountAmount = dbData.maxDiscountAmount.toString();
        }
        const id = await db.createCoupon({
          ...dbData,
          createdBy: ctx.user?.id || 1, // Default to admin user ID 1
        });
        return { id };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        code: z.string().min(3).max(50).optional(),
        description: z.string().optional(),
        discountType: z.enum(["percentage", "fixed"]).optional(),
        discountValue: z.number().positive().optional(),
        minPurchaseAmount: z.number().optional(),
        maxDiscountAmount: z.number().optional(),
        usageLimit: z.number().int().positive().optional(),
        perUserLimit: z.number().int().positive().optional(),
        validFrom: z.date().optional(),
        validUntil: z.date().optional(),
        isActive: z.boolean().optional(),
        applicableProducts: z.array(z.number()).optional(),
        applicableCategories: z.array(z.number()).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        // Convert numeric fields to strings for decimal columns
        const dbData: any = { ...data };
        if (dbData.discountValue !== undefined) {
          dbData.discountValue = dbData.discountValue.toString();
        }
        if (dbData.minPurchaseAmount !== undefined) {
          dbData.minPurchaseAmount = dbData.minPurchaseAmount.toString();
        }
        if (dbData.maxDiscountAmount !== undefined) {
          dbData.maxDiscountAmount = dbData.maxDiscountAmount.toString();
        }
        await db.updateCoupon(id, dbData);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCoupon(input.id);
        return { success: true };
      }),
    
    validate: publicProcedure
      .input(z.object({
        code: z.string(),
        userId: z.number().optional(),
        cartTotal: z.number(),
        productIds: z.array(z.number()),
        categoryIds: z.array(z.number()),
      }))
      .mutation(async ({ input }) => {
        return await db.validateCoupon(
          input.code,
          input.userId || null,
          input.cartTotal,
          input.productIds,
          input.categoryIds
        );
      }),
  }),

  // ============= FAQ SYSTEM =============
  faq: router({
    // Menus
    listMenus: publicProcedure
      .query(async () => {
        return await db.listFaqMenus();
      }),
    
    getVisibleMenusWithItems: publicProcedure
      .query(async () => {
        return await db.getVisibleFaqMenusWithItems();
      }),
    
    createMenu: adminProcedure
      .input(z.object({
        title: z.string(),
        titleAr: z.string().optional(),
        displayOrder: z.number().default(0),
        isVisible: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        return await db.createFaqMenu(input);
      }),
    
    updateMenu: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        titleAr: z.string().optional(),
        displayOrder: z.number().optional(),
        isVisible: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateFaqMenu(id, data);
        return { success: true };
      }),
    
    deleteMenu: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteFaqMenu(input.id);
        return { success: true };
      }),
    
    // Items
    listItems: publicProcedure
      .input(z.object({ menuId: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.listFaqItems(input.menuId);
      }),
    
    createItem: adminProcedure
      .input(z.object({
        menuId: z.number(),
        question: z.string(),
        questionAr: z.string().optional(),
        answer: z.string(),
        answerAr: z.string().optional(),
        linkUrl: z.string().optional(),
        linkText: z.string().optional(),
        linkTextAr: z.string().optional(),
        displayOrder: z.number().default(0),
        isVisible: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        return await db.createFaqItem(input);
      }),
    
    updateItem: adminProcedure
      .input(z.object({
        id: z.number(),
        question: z.string().optional(),
        questionAr: z.string().optional(),
        answer: z.string().optional(),
        answerAr: z.string().optional(),
        linkUrl: z.string().optional(),
        linkText: z.string().optional(),
        linkTextAr: z.string().optional(),
        displayOrder: z.number().optional(),
        isVisible: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateFaqItem(id, data);
        return { success: true };
      }),
    
    deleteItem: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteFaqItem(input.id);
        return { success: true };
      }),
  }),

  // Custom Pages (Page Builder)
  pages: router({
    list: adminProcedure
      .query(async () => {
        return await db.getAllCustomPages();
      }),
    
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return await db.getCustomPageBySlug(input.slug);
      }),
    
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getCustomPageById(input.id);
      }),
    
    create: adminProcedure
      .input(z.object({
        slug: z.string(),
        title: z.string(),
        titleAr: z.string().optional(),
        content: z.string(),
        contentAr: z.string().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        isPublished: z.boolean().default(false),
      }))
      .mutation(async ({ input }) => {
        return await db.createCustomPage(input);
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        slug: z.string().optional(),
        title: z.string().optional(),
        titleAr: z.string().optional(),
        content: z.string().optional(),
        contentAr: z.string().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        isPublished: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateCustomPage(id, data);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCustomPage(input.id);
        return { success: true };
      }),
  }),
  
  paymentMethods: router({
    list: publicProcedure.query(async () => {
      return await db.getAllPaymentMethods();
    }),
    
    listVisible: publicProcedure.query(async () => {
      return await db.getVisiblePaymentMethods();
    }),
    
    getByProvider: publicProcedure
      .input(z.object({ provider: z.string() }))
      .query(async ({ input }) => {
        return await db.getPaymentMethodByProvider(input.provider);
      }),
    
    updateVisibility: adminProcedure
      .input(z.object({
        provider: z.string(),
        isVisible: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        await db.updatePaymentMethodVisibility(input.provider, input.isVisible);
        return { success: true };
      }),
    
    update: adminProcedure
      .input(z.object({
        provider: z.string(),
        displayName: z.string().optional(),
        description: z.string().optional(),
        isVisible: z.boolean().optional(),
        displayOrder: z.number().optional(),
        icon: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { provider, ...data } = input;
        await db.updatePaymentMethod(provider, data);
        return { success: true };
      }),
    
    initialize: adminProcedure
      .mutation(async () => {
        await db.initializeDefaultPaymentMethods();
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
