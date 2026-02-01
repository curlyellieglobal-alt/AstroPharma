import { eq, desc, and, or, like, sql, asc, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "../drizzle/schema";
import { 
  users,
  products, 
  categories,
  orders,
  orderItems,
  blogPosts,
  mediaAssets,
  pageSections,
  seoSettings,
  notifications,
  notificationPreferences,
  chatConversations,
  chatMessages,
  siteSettings,
  newsletterSubscribers,
  wishlistItems,
  productVariants,
  productReviews,
  coupons,
  couponUsage,
  faqMenus,
  faqItems,
  savedReplies,
  customPages,
  paymentMethods,
  adminCredentials,
  otpVerifications, OtpVerification, InsertOtpVerification,
  whatsappMessages, WhatsappMessage, InsertWhatsappMessage,
} from "../drizzle/schema";
import type {
  InsertUser,
  InsertProduct, Product,
  InsertCategory, Category,
  InsertOrder, Order,
  InsertOrderItem, OrderItem,
  InsertBlogPost, BlogPost,
  InsertMediaAsset, MediaAsset,
  InsertPageSection, PageSection,
  InsertSeoSetting, SeoSetting,
  InsertNotification, Notification,
  InsertNotificationPreference, NotificationPreference,
  InsertChatConversation, ChatConversation,
  InsertChatMessage, ChatMessage,
  InsertSiteSetting, SiteSetting,
  NewsletterSubscriber, InsertNewsletterSubscriber,
  WishlistItem, InsertWishlistItem,
  ProductVariant, InsertProductVariant,
  InsertProductReview, ProductReview,
  Coupon, InsertCoupon,
  CouponUsage, InsertCouponUsage,
  FaqMenu, InsertFaqMenu,
  FaqItem, InsertFaqItem,
  SavedReply, InsertSavedReply,
  CustomPage, InsertCustomPage,
  PaymentMethod, InsertPaymentMethod,
  AdminCredential, InsertAdminCredential,
} from "../drizzle/schema"
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export async function getDb(): Promise<ReturnType<typeof drizzle<typeof schema>> | null> {
  if (!_db) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      console.warn("[Database] DATABASE_URL is not defined");
      return null;
    }
    try {
      _db = drizzle(connectionString, { schema, mode: 'default' });
      console.log("[Database] Connected successfully");
    } catch (error) {
      console.error("[Database] Connection error:", error);
      _db = null;
    }
  }
  return _db;
}

// ============= USER FUNCTIONS =============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUserRole(userId: number, role: "user" | "admin") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

// ============= CATEGORY FUNCTIONS =============

export async function createCategory(category: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(categories).values(category);
  return result;
}

export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(categories).orderBy(categories.displayOrder);
}

export async function getActiveCategories() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(categories.displayOrder);
}

export async function getCategoryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return result[0];
}

export async function updateCategory(id: number, data: Partial<InsertCategory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(categories).set(data).where(eq(categories.id, id));
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(categories).where(eq(categories.id, id));
}

// ============= PRODUCT FUNCTIONS =============

export async function createProduct(product: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Remove id, createdAt, updatedAt as they have defaults
  const { id, createdAt, updatedAt, ...productData } = product as any;
  
  const result = await db.insert(products).values(productData);
  return result;
}

export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products).orderBy(desc(products.createdAt));
}

export async function getProductsByCurrency(currency: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products)
    .where(eq(products.currency, currency as any))
    .orderBy(desc(products.createdAt));
}

export async function getActiveProducts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products)
    .where(eq(products.isActive, true))
    .orderBy(desc(products.createdAt));
}

export async function getActiveByCurrency(currency: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products)
    .where(and(eq(products.isActive, true), eq(products.currency, currency as any)))
    .orderBy(desc(products.createdAt));
}

export async function getFeaturedProducts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products)
    .where(and(eq(products.isActive, true), eq(products.isFeatured, true)))
    .orderBy(desc(products.createdAt));
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return result[0];
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0];
}

export async function getProductsByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products)
    .where(and(eq(products.categoryId, categoryId), eq(products.isActive, true)))
    .orderBy(desc(products.createdAt));
}

export async function searchProducts(query: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products)
    .where(
      and(
        eq(products.isActive, true),
        like(products.name, `%${query}%`)
      )
    )
    .orderBy(desc(products.createdAt));
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Filter out undefined and empty values to only update provided fields
  const updateData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => {
      // Skip undefined values
      if (value === undefined) return false;
      // Skip null values
      if (value === null) return false;
      // Skip empty strings
      if (typeof value === 'string' && value.trim() === '') return false;
      // Skip empty arrays
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    })
  );
  
  if (Object.keys(updateData).length === 0) {
    return; // Nothing to update
  }
  
  await db.update(products).set(updateData as any).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(products).where(eq(products.id, id));
}

export async function updateProductStock(id: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(products)
    .set({ stockQuantity: sql`${products.stockQuantity} + ${quantity}` })
    .where(eq(products.id, id));
}

// ============= ORDER FUNCTIONS =============

export async function createOrder(order: InsertOrder, items: InsertOrderItem[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const orderResult = await db.insert(orders).values(order);
  const orderId = Number(orderResult[0].insertId);
  
  const itemsWithOrderId = items.map(item => ({ ...item, orderId }));
  await db.insert(orderItems).values(itemsWithOrderId);
  
  return orderId;
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result[0];
}

export async function getOrderByNumber(orderNumber: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  return result[0];
}

export async function getOrdersByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function updateOrderStatus(id: number, status: Order["status"]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(orders).set({ status }).where(eq(orders.id, id));
}

export async function updateOrderPaymentStatus(id: number, paymentStatus: Order["paymentStatus"], transactionId?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = { paymentStatus };
  if (transactionId) {
    updateData.paymentTransactionId = transactionId;
  }
  
  await db.update(orders).set(updateData).where(eq(orders.id, id));
}

// ============= BLOG POST FUNCTIONS =============

export async function createBlogPost(post: InsertBlogPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(blogPosts).values(post);
  return result;
}

export async function getAllBlogPosts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
}

export async function getPublishedBlogPosts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(blogPosts)
    .where(eq(blogPosts.isPublished, true))
    .orderBy(desc(blogPosts.publishedAt));
}

export async function getBlogPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
  return result[0];
}

export async function getBlogPostById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
  return result[0];
}

export async function updateBlogPost(id: number, data: Partial<InsertBlogPost>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(blogPosts).set(data).where(eq(blogPosts.id, id));
}

export async function deleteBlogPost(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(blogPosts).where(eq(blogPosts.id, id));
}

export async function incrementBlogPostViews(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(blogPosts)
    .set({ viewCount: sql`${blogPosts.viewCount} + 1` })
    .where(eq(blogPosts.id, id));
}

// ============= MEDIA ASSET FUNCTIONS =============

export async function createMediaAsset(asset: InsertMediaAsset) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(mediaAssets).values(asset);
  return result;
}

export async function getAllMediaAssets() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt));
}

export async function getMediaAssetsByFolder(folder: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(mediaAssets)
    .where(eq(mediaAssets.folder, folder))
    .orderBy(desc(mediaAssets.createdAt));
}

export async function deleteMediaAsset(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(mediaAssets).where(eq(mediaAssets.id, id));
}

// ============= PAGE SECTION FUNCTIONS =============

export async function createPageSection(section: InsertPageSection) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(pageSections).values(section);
  return result;
}

export async function getPageSections(pageName: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(pageSections)
    .where(eq(pageSections.pageName, pageName))
    .orderBy(pageSections.displayOrder);
}

export async function getPageSectionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(pageSections)
    .where(eq(pageSections.id, id))
    .limit(1);
  return result[0];
}

export async function getVisiblePageSections(pageName: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(pageSections)
    .where(and(eq(pageSections.pageName, pageName), eq(pageSections.isVisible, true)))
    .orderBy(pageSections.displayOrder);
}

export async function updatePageSection(id: number, data: Partial<InsertPageSection>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(pageSections).set(data).where(eq(pageSections.id, id));
}

export async function togglePageSectionVisibility(id: number, isVisible: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(pageSections).set({ isVisible }).where(eq(pageSections.id, id));
}

// ============= SEO SETTINGS FUNCTIONS =============

export async function upsertSeoSettings(settings: InsertSeoSetting) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(seoSettings).values(settings).onDuplicateKeyUpdate({
    set: {
      metaTitle: settings.metaTitle,
      metaDescription: settings.metaDescription,
      metaKeywords: settings.metaKeywords,
      ogTitle: settings.ogTitle,
      ogDescription: settings.ogDescription,
      ogImage: settings.ogImage,
      schemaMarkup: settings.schemaMarkup,
      canonicalUrl: settings.canonicalUrl,
      noIndex: settings.noIndex,
      noFollow: settings.noFollow,
    },
  });
}

export async function getSeoSettings(pagePath: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(seoSettings).where(eq(seoSettings.pagePath, pagePath)).limit(1);
  return result[0];
}

export async function getAllSeoSettings() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(seoSettings).orderBy(seoSettings.pagePath);
}


// ============= NOTIFICATION FUNCTIONS =============

export async function createNotification(notification: InsertNotification): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(notifications).values(notification);
  return Number(result[0].insertId);
}

export async function getNotifications(userId?: number, limit: number = 50): Promise<Notification[]> {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = userId ? eq(notifications.userId, userId) : sql`1=1`;
  
  return await db
    .select()
    .from(notifications)
    .where(conditions)
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getUnreadNotifications(userId?: number): Promise<Notification[]> {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = userId 
    ? and(eq(notifications.userId, userId), eq(notifications.isRead, false))
    : eq(notifications.isRead, false);
  
  return await db
    .select()
    .from(notifications)
    .where(conditions)
    .orderBy(desc(notifications.createdAt));
}

export async function getUnreadCount(userId?: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const conditions = userId 
    ? and(eq(notifications.userId, userId), eq(notifications.isRead, false))
    : eq(notifications.isRead, false);
  
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(conditions);
  
  return Number(result[0]?.count || 0);
}

export async function markNotificationAsRead(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, id));
}

export async function markAllNotificationsAsRead(userId?: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  const conditions = userId ? eq(notifications.userId, userId) : sql`1=1`;
  
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(conditions);
}

export async function deleteNotification(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(notifications).where(eq(notifications.id, id));
}

export async function checkLowStock(threshold: number = 10): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.trackInventory, true),
        eq(products.isActive, true),
        sql`${products.stockQuantity} <= ${threshold}`
      )
    );
}

// ============= NOTIFICATION PREFERENCES FUNCTIONS =============

export async function getNotificationPreferences(userId: number): Promise<NotificationPreference | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId)).limit(1);
  
  // If no preferences exist, create default ones
  if (result.length === 0) {
    await db.insert(notificationPreferences).values({
      userId,
      emailOrderConfirmation: true,
      emailOrderStatus: true,
      emailPromotions: true,
      inAppNotifications: true,
    });
    
    const newResult = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId)).limit(1);
    return newResult[0] || null;
  }
  
  return result[0];
}

export async function updateNotificationPreferences(
  userId: number, 
  preferences: Partial<InsertNotificationPreference>
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Check if preferences exist
  const existing = await getNotificationPreferences(userId);
  
  if (!existing) {
    // Create new preferences
    await db.insert(notificationPreferences).values({
      userId,
      ...preferences,
    });
  } else {
    // Update existing preferences
    await db.update(notificationPreferences)
      .set(preferences)
      .where(eq(notificationPreferences.userId, userId));
  }
}


// ============= CHAT FUNCTIONS =============

export async function createChatConversation(data: InsertChatConversation): Promise<ChatConversation> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(chatConversations).values(data);
  const id = result[0].insertId;
  
  const conversation = await db.select().from(chatConversations).where(eq(chatConversations.id, id)).limit(1);
  return conversation[0];
}

export async function createChatMessage(data: InsertChatMessage): Promise<ChatMessage> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(chatMessages).values(data);
  const id = result[0].insertId;
  
  // Update conversation lastMessageAt
  await db.update(chatConversations)
    .set({ lastMessageAt: new Date() })
    .where(eq(chatConversations.id, data.conversationId));
  
  const message = await db.select().from(chatMessages).where(eq(chatMessages.id, id)).limit(1);
  return message[0];
}

export async function getChatMessages(conversationId: number): Promise<ChatMessage[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(chatMessages)
    .where(eq(chatMessages.conversationId, conversationId))
    .orderBy(chatMessages.createdAt);
}

export async function getAllChatConversations(): Promise<ChatConversation[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(chatConversations)
    .orderBy(desc(chatConversations.lastMessageAt));
}

export async function markChatMessagesAsRead(conversationId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(chatMessages)
    .set({ isRead: true })
    .where(eq(chatMessages.conversationId, conversationId));
}

export async function findMessageByFileHash(fileHash: string): Promise<ChatMessage | null> {
  const db = await getDb();
  if (!db) return null;

  const messages = await db.select().from(chatMessages)
    .where(eq(chatMessages.fileHash, fileHash))
    .limit(1);
  
  return messages[0] || null;
}

export async function closeChatConversation(conversationId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(chatConversations)
    .set({ status: "closed" })
    .where(eq(chatConversations.id, conversationId));
}


// ============= SITE SETTINGS FUNCTIONS =============

export async function getSiteSetting(key: string): Promise<SiteSetting | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.settingKey, key))
    .limit(1);
  
  return result[0] || null;
}

export async function getAllSiteSettings(): Promise<SiteSetting[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(siteSettings);
}

export async function updateSiteSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db
    .update(siteSettings)
    .set({ settingValue: value, updatedAt: new Date() })
    .where(eq(siteSettings.settingKey, key));
}

export async function createSiteSetting(setting: InsertSiteSetting): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(siteSettings).values(setting);
  return Number(result[0].insertId);
}

export async function upsertSiteSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  // Check if setting exists
  const existing = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.settingKey, key))
    .limit(1);
  
  if (existing.length > 0) {
    // Update existing
    await db
      .update(siteSettings)
      .set({ settingValue: value, updatedAt: new Date() })
      .where(eq(siteSettings.settingKey, key));
  } else {
    // Insert new
    await db.insert(siteSettings).values({
      settingKey: key,
      settingValue: value,
      settingType: "text",
      description: null,
    });
  }
}


// ============= NEWSLETTER SUBSCRIBERS =============
export async function subscribeToNewsletter(email: string): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if already subscribed
  const existing = await db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.email, email))
    .limit(1);
  
  if (existing.length > 0) {
    // If unsubscribed, reactivate
    if (existing[0].status === "unsubscribed") {
      await db
        .update(newsletterSubscribers)
        .set({ status: "active", subscribedAt: new Date(), unsubscribedAt: null })
        .where(eq(newsletterSubscribers.email, email));
      return existing[0].id;
    }
    // Already subscribed
    return existing[0].id;
  }
  
  // New subscription
  const result = await db.insert(newsletterSubscribers).values({ email });
  return Number(result[0].insertId);
}

export async function getAllNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.status, "active"));
}

export async function unsubscribeFromNewsletter(email: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db
    .update(newsletterSubscribers)
    .set({ status: "unsubscribed", unsubscribedAt: new Date() })
    .where(eq(newsletterSubscribers.email, email));
}


// ============= MEDIA USAGE TRACKING =============

export async function getMediaUsage(mediaUrl: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  const usage: Array<{ type: string; id: number; name: string }> = [];

  // Check products
  const productsWithMedia = await db
    .select()
    .from(products)
    .where(
      sql`JSON_CONTAINS(${products.images}, JSON_QUOTE(${mediaUrl}))`
    );

  for (const product of productsWithMedia) {
    usage.push({
      type: "product",
      id: product.id,
      name: product.name,
    });
  }

  // Check blog posts
  const blogPostsWithMedia = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.featuredImage, mediaUrl));

  for (const post of blogPostsWithMedia) {
    usage.push({
      type: "blog",
      id: post.id,
      name: post.title,
    });
  }

  // Check page sections (carousel, hero, etc.)
  const sectionsWithMedia = await db
    .select()
    .from(pageSections)
    .where(sql`JSON_CONTAINS(CAST(${pageSections.data} AS CHAR), JSON_QUOTE(${mediaUrl}))`);

  for (const section of sectionsWithMedia) {
    usage.push({
      type: "page_section",
      id: section.id,
      name: section.title || section.sectionKey,
    });
  }

  return usage;
}

export async function isMediaInUse(mediaUrl: string): Promise<boolean> {
  const usage = await getMediaUsage(mediaUrl);
  return usage.length > 0;
}


// ============= PRODUCT VARIANTS =============

export async function getProductVariants(productId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, productId))
    .orderBy(productVariants.displayOrder);
}

export async function createProductVariant(data: InsertProductVariant) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [variant] = await db
    .insert(productVariants)
    .values(data)
    .$returningId();
  
  return variant.id;
}

export async function updateProductVariant(id: number, data: Partial<InsertProductVariant>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(productVariants)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(productVariants.id, id));
}

export async function deleteProductVariant(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .delete(productVariants)
    .where(eq(productVariants.id, id));
}


// ============================================================
// Product Reviews
// ============================================================

export async function createProductReview(data: {
  productId: number;
  userId?: number;
  authorName: string;
  authorEmail?: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  isVerifiedPurchase?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(productReviews).values(data);
  return result.insertId;
}

export async function getProductReviews(productId: number, approvedOnly = true) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const conditions = [eq(productReviews.productId, productId)];
  if (approvedOnly) {
    conditions.push(eq(productReviews.isApproved, true));
  }
  return await db.select().from(productReviews).where(and(...conditions)).orderBy(desc(productReviews.createdAt));
}

export async function getAllPendingReviews() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(productReviews).where(eq(productReviews.isApproved, false)).orderBy(desc(productReviews.createdAt));
}

export async function approveReview(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(productReviews).set({ isApproved: true }).where(eq(productReviews.id, id));
}

export async function deleteReview(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(productReviews).where(eq(productReviews.id, id));
}

export async function incrementReviewHelpful(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.execute(sql`UPDATE ${productReviews} SET helpfulCount = helpfulCount + 1 WHERE id = ${id}`);
}

// ============================================================
// Wishlist
// ============================================================

export async function addToWishlist(data: {
  userId: number;
  productId: number;
  variantId?: number;
  priceWhenAdded?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(wishlistItems).values({
    ...data,
    priceWhenAdded: data.priceWhenAdded !== undefined ? String(data.priceWhenAdded) : undefined,
  });
  return result.insertId;
}

export async function removeFromWishlist(userId: number, productId: number, variantId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const conditions = [
    eq(wishlistItems.userId, userId),
    eq(wishlistItems.productId, productId),
  ];
  if (variantId) {
    conditions.push(eq(wishlistItems.variantId, variantId));
  } else {
    conditions.push(isNull(wishlistItems.variantId));
  }
  await db.delete(wishlistItems).where(and(...conditions));
}

export async function getUserWishlist(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select({
      wishlistItem: wishlistItems,
      product: products,
      variant: productVariants,
    })
    .from(wishlistItems)
    .leftJoin(products, eq(wishlistItems.productId, products.id))
    .leftJoin(productVariants, eq(wishlistItems.variantId, productVariants.id))
    .where(eq(wishlistItems.userId, userId))
    .orderBy(desc(wishlistItems.createdAt));
}

export async function isInWishlist(userId: number, productId: number, variantId?: number) {
  const db = await getDb();
  if (!db) return false;
  const conditions = [
    eq(wishlistItems.userId, userId),
    eq(wishlistItems.productId, productId),
  ];
  if (variantId) {
    conditions.push(eq(wishlistItems.variantId, variantId));
  } else {
    conditions.push(isNull(wishlistItems.variantId));
  }
  const result = await db.select().from(wishlistItems).where(and(...conditions)).limit(1);
  return result.length > 0;
}


// ============================================
// Coupons & Discounts
// ============================================

export async function getAllCoupons() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(coupons).orderBy(desc(coupons.createdAt));
}

export async function getActiveCoupons() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(coupons)
    .where(eq(coupons.isActive, true))
    .orderBy(desc(coupons.createdAt));
}

export async function getCouponByCode(code: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(coupons)
    .where(eq(coupons.code, code.toUpperCase()))
    .limit(1);
  return result[0] || null;
}

export async function getCouponById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(coupons).where(eq(coupons.id, id)).limit(1);
  return result[0] || null;
}

export async function createCoupon(data: InsertCoupon) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(coupons).values({
    ...data,
    code: data.code.toUpperCase(), // Always uppercase
  });
  return Number((result as any).insertId || 0);
}

export async function updateCoupon(id: number, data: Partial<InsertCoupon>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (data.code) {
    data.code = data.code.toUpperCase();
  }
  await db.update(coupons).set(data).where(eq(coupons.id, id));
}

export async function deleteCoupon(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(coupons).where(eq(coupons.id, id));
}

export async function incrementCouponUsage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(coupons)
    .set({ usageCount: sql`${coupons.usageCount} + 1` })
    .where(eq(coupons.id, id));
}

export async function getCouponUsageByUser(couponId: number, userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(couponUsage)
    .where(and(eq(couponUsage.couponId, couponId), eq(couponUsage.userId, userId)));
  return result[0]?.count || 0;
}

export async function recordCouponUsage(data: InsertCouponUsage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(couponUsage).values(data);
  return Number((result as any).insertId || 0);
}

export async function validateCoupon(
  code: string,
  userId: number | null,
  cartTotal: number,
  productIds: number[],
  categoryIds: number[]
) {
  const coupon = await getCouponByCode(code);
  
  if (!coupon) {
    return { valid: false, error: "Coupon code not found" };
  }
  
  if (!coupon.isActive) {
    return { valid: false, error: "Coupon is no longer active" };
  }
  
  const now = new Date();
  if (new Date(coupon.validFrom) > now) {
    return { valid: false, error: "Coupon is not yet valid" };
  }
  
  if (coupon.validUntil && new Date(coupon.validUntil) < now) {
    return { valid: false, error: "Coupon has expired" };
  }
  
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return { valid: false, error: "Coupon usage limit reached" };
  }
  
  if (userId && coupon.perUserLimit) {
    const userUsage = await getCouponUsageByUser(coupon.id, userId);
    if (userUsage >= coupon.perUserLimit) {
      return { valid: false, error: "You have reached the usage limit for this coupon" };
    }
  }
  
  if (coupon.minPurchaseAmount && cartTotal < Number(coupon.minPurchaseAmount)) {
    return {
      valid: false,
      error: `Minimum purchase amount of $${coupon.minPurchaseAmount} required`,
    };
  }
  
  // Check if coupon applies to cart products
  if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
    const hasApplicableProduct = productIds.some((id) =>
      coupon.applicableProducts!.includes(id)
    );
    if (!hasApplicableProduct) {
      return { valid: false, error: "Coupon does not apply to items in your cart" };
    }
  }
  
  // Check if coupon applies to cart categories
  if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
    const hasApplicableCategory = categoryIds.some((id) =>
      coupon.applicableCategories!.includes(id)
    );
    if (!hasApplicableCategory) {
      return { valid: false, error: "Coupon does not apply to items in your cart" };
    }
  }
  
  // Calculate discount
  let discountAmount = 0;
  if (coupon.discountType === "percentage") {
    discountAmount = (cartTotal * Number(coupon.discountValue)) / 100;
    if (coupon.maxDiscountAmount) {
      discountAmount = Math.min(discountAmount, Number(coupon.maxDiscountAmount));
    }
  } else {
    discountAmount = Number(coupon.discountValue);
  }
  
  // Ensure discount doesn't exceed cart total
  discountAmount = Math.min(discountAmount, cartTotal);
  
  return {
    valid: true,
    coupon,
    discountAmount,
  };
}


// ============================================================================
// FAQ Functions
// ============================================================================

export async function listFaqMenus() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(faqMenus).orderBy(faqMenus.displayOrder);
}

export async function getFaqMenuById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [menu] = await db.select().from(faqMenus).where(eq(faqMenus.id, id));
  return menu;
}

export async function createFaqMenu(data: InsertFaqMenu) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [menu] = await db.insert(faqMenus).values(data).$returningId();
  return menu;
}

export async function updateFaqMenu(id: number, data: Partial<InsertFaqMenu>) {
  const db = await getDb();
  if (!db) return;
  await db.update(faqMenus).set(data).where(eq(faqMenus.id, id));
}

export async function deleteFaqMenu(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(faqMenus).where(eq(faqMenus.id, id));
}

export async function listFaqItems(menuId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (menuId) {
    return db.select().from(faqItems)
      .where(eq(faqItems.menuId, menuId))
      .orderBy(faqItems.displayOrder);
  }
  return db.select().from(faqItems).orderBy(faqItems.displayOrder);
}

export async function getFaqItemById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [item] = await db.select().from(faqItems).where(eq(faqItems.id, id));
  return item;
}

export async function createFaqItem(data: InsertFaqItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [item] = await db.insert(faqItems).values(data).$returningId();
  return item;
}

export async function updateFaqItem(id: number, data: Partial<InsertFaqItem>) {
  const db = await getDb();
  if (!db) return;
  await db.update(faqItems).set(data).where(eq(faqItems.id, id));
}

export async function deleteFaqItem(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(faqItems).where(eq(faqItems.id, id));
}

export async function getVisibleFaqMenusWithItems() {
  const db = await getDb();
  if (!db) return [];
  
  const menus = await db.select().from(faqMenus)
    .where(eq(faqMenus.isVisible, true))
    .orderBy(faqMenus.displayOrder);
  
  const menusWithItems = await Promise.all(
    menus.map(async (menu) => {
      const items = await db.select().from(faqItems)
        .where(and(
          eq(faqItems.menuId, menu.id),
          eq(faqItems.isVisible, true)
        ))
        .orderBy(faqItems.displayOrder);
      return { ...menu, items };
    })
  );
  
  return menusWithItems;
}


// ============================================================================
// Saved Replies Functions
// ============================================================================

export async function listSavedReplies(adminId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (adminId) {
    return db.select().from(savedReplies)
      .where(and(
        eq(savedReplies.adminId, adminId),
        eq(savedReplies.isActive, true)
      ))
      .orderBy(savedReplies.displayOrder);
  }
  return db.select().from(savedReplies)
    .where(eq(savedReplies.isActive, true))
    .orderBy(savedReplies.displayOrder);
}

export async function getSavedReplyById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [reply] = await db.select().from(savedReplies).where(eq(savedReplies.id, id));
  return reply;
}

export async function createSavedReply(data: InsertSavedReply) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [reply] = await db.insert(savedReplies).values(data).$returningId();
  return reply;
}

export async function updateSavedReply(id: number, data: Partial<InsertSavedReply>) {
  const db = await getDb();
  if (!db) return;
  await db.update(savedReplies).set(data).where(eq(savedReplies.id, id));
}

export async function deleteSavedReply(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(savedReplies).where(eq(savedReplies.id, id));
}

export async function reorderSavedReply(id: number, newOrder: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(savedReplies).set({ displayOrder: newOrder }).where(eq(savedReplies.id, id));
}


// ============= CUSTOM PAGES FUNCTIONS =============

export async function getAllCustomPages() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(customPages).orderBy(customPages.createdAt);
}

export async function getPublishedCustomPages() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(customPages).where(eq(customPages.isPublished, true));
}

export async function getCustomPageBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const [page] = await db.select().from(customPages).where(eq(customPages.slug, slug));
  return page;
}

export async function getCustomPageById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [page] = await db.select().from(customPages).where(eq(customPages.id, id));
  return page;
}

export async function createCustomPage(data: InsertCustomPage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [page] = await db.insert(customPages).values(data).$returningId();
  return page;
}

export async function updateCustomPage(id: number, data: Partial<InsertCustomPage>) {
  const db = await getDb();
  if (!db) return;
  await db.update(customPages).set({ ...data, updatedAt: new Date() }).where(eq(customPages.id, id));
}

export async function deleteCustomPage(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(customPages).where(eq(customPages.id, id));
}


// ============= PAYMENT METHODS FUNCTIONS =============
export async function getAllPaymentMethods() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(paymentMethods).orderBy(paymentMethods.displayOrder);
}

export async function getVisiblePaymentMethods() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(paymentMethods).where(eq(paymentMethods.isVisible, true)).orderBy(paymentMethods.displayOrder);
}

export async function getPaymentMethodByProvider(provider: string) {
  const db = await getDb();
  if (!db) return null;
  const [method] = await db.select().from(paymentMethods).where(eq(paymentMethods.provider, provider as any));
  return method;
}

export async function updatePaymentMethodVisibility(provider: string, isVisible: boolean) {
  const db = await getDb();
  if (!db) return;
  await db.update(paymentMethods).set({ isVisible, updatedAt: new Date() }).where(eq(paymentMethods.provider, provider as any));
}

export async function updatePaymentMethod(provider: string, data: Partial<InsertPaymentMethod>) {
  const db = await getDb();
  if (!db) return;
  await db.update(paymentMethods).set({ ...data, updatedAt: new Date() }).where(eq(paymentMethods.provider, provider as any));
}

export async function createPaymentMethod(data: InsertPaymentMethod) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [method] = await db.insert(paymentMethods).values(data).$returningId();
  return method;
}

export async function initializeDefaultPaymentMethods() {
  const db = await getDb();
  if (!db) return;
  
  const defaultMethods = [
    { provider: "stripe", displayName: "Credit Card (Stripe)", description: "Pay securely with your credit card", isVisible: true, displayOrder: 1 },
    { provider: "fawry", displayName: "Fawry", description: "Pay through Fawry", isVisible: true, displayOrder: 2 },
    { provider: "payoneer", displayName: "Payoneer", description: "Pay through Payoneer", isVisible: true, displayOrder: 3 },
    { provider: "cod", displayName: "Cash on Delivery", description: "Pay when you receive your order", isVisible: true, displayOrder: 4 },
    { provider: "instapay", displayName: "InstaPay", description: "Pay through InstaPay", isVisible: true, displayOrder: 5 },
    { provider: "vodafone_cash", displayName: "Vodafone Cash", description: "Pay through Vodafone Cash", isVisible: true, displayOrder: 6 },
  ];
  
  for (const method of defaultMethods) {
    try {
      await db.insert(paymentMethods).values(method as any).onDuplicateKeyUpdate({ set: { displayName: method.displayName } });
    } catch (error) {
      // Method might already exist
    }
  }
}


// ============= ADMIN CREDENTIALS FUNCTIONS =============

export async function getAdminByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  const [admin] = await db.select().from(adminCredentials).where(eq(adminCredentials.email, email));
  return admin;
}

export async function updateAdminLastLogin(email: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(adminCredentials).set({ lastLogin: new Date() }).where(eq(adminCredentials.email, email));
}

export async function createAdminCredential(data: InsertAdminCredential) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [admin] = await db.insert(adminCredentials).values(data).$returningId();
  return admin;
}


// ============= CURRENCY RATES FUNCTIONS =============

// ============= OTP VERIFICATION FUNCTIONS =============

export async function createOtpVerification(data: InsertOtpVerification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(otpVerifications).values(data).$returningId();
  return result;
}

export async function getOtpVerificationByOrderId(orderId: number) {
  const db = await getDb();
  if (!db) return null;
  const otp = await db.select().from(otpVerifications).where(eq(otpVerifications.orderId, orderId as any)).limit(1);
  return otp[0] || null;
}

export async function updateOtpVerification(id: number, data: Partial<InsertOtpVerification>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(otpVerifications).set(data).where(eq(otpVerifications.id, id));
}

// ============= WHATSAPP MESSAGES FUNCTIONS =============

export async function createWhatsappMessage(data: InsertWhatsappMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(whatsappMessages).values(data).$returningId();
  return result;
}

export async function getWhatsappMessagesByOrderId(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(whatsappMessages).where(eq(whatsappMessages.orderId, orderId as any));
}

export async function updateWhatsappMessage(id: number, data: Partial<InsertWhatsappMessage>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(whatsappMessages).set(data).where(eq(whatsappMessages.id, id));
}




// ============= PHONE FORMATTING UTILITIES =============

export const phoneFormatRules: Record<string, { format: string; example: string }> = {
  '+1': { format: '(XXX) XXX-XXXX', example: '(202) 555-1234' },
  '+20': { format: '(XXX) XXX-XXXX', example: '(101) 049-3262' },
  '+966': { format: 'XX XXX XXXX', example: '50 1234 567' },
  '+971': { format: 'XX XXX XXXX', example: '50 1234 567' },
  '+44': { format: '(XXXX) XXXXXX', example: '(207) 183875' },
  '+33': { format: 'X XX XX XX XX', example: '1 23 45 67 89' },
  '+49': { format: '(XXX) XXXXXXX', example: '(30) 1234567' },
  '+39': { format: 'XX XXXX XXXX', example: '01 2345 6789' },
  '+34': { format: 'XXX XX XX XX', example: '912 34 56 78' },
  '+31': { format: 'XX XXXXXXXX', example: '61 23456789' },
};

export function formatPhoneNumber(phone: string, countryCode: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  const rule = phoneFormatRules[countryCode];
  
  if (!rule) return phone;
  
  let formatted = '';
  let digitIndex = 0;
  
  for (let i = 0; i < rule.format.length && digitIndex < digits.length; i++) {
    if (rule.format[i] === 'X') {
      formatted += digits[digitIndex++];
    } else {
      formatted += rule.format[i];
    }
  }
  
  return formatted;
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getOtpExpirationTime(minutesFromNow: number = 5): Date {
  const now = new Date();
  return new Date(now.getTime() + minutesFromNow * 60000);
}
