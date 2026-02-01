import { mysqlTable, mysqlSchema, AnyMySqlColumn, index, int, varchar, timestamp, mysqlEnum, json, text, foreignKey, decimal, tinyint } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const adminCredentials = mysqlTable("adminCredentials", {
	id: int().autoincrement().notNull(),
	email: varchar({ length: 320 }).notNull(),
	passwordHash: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	isActive: tinyint().default(1).notNull(),
	lastLogin: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("adminCredentials_email_unique").on(table.email),
]);

export const auditLogs = mysqlTable("auditLogs", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	userName: varchar({ length: 255 }),
	action: mysqlEnum(['create','update','delete']).notNull(),
	entityType: varchar({ length: 100 }).notNull(),
	entityId: int(),
	changes: json(),
	ipAddress: varchar({ length: 45 }),
	userAgent: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const blogPosts = mysqlTable("blogPosts", {
	id: int().autoincrement().notNull(),
	title: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull(),
	excerpt: text(),
	content: text().notNull(),
	featuredImage: text(),
	authorId: int().notNull(),
	authorName: varchar({ length: 255 }),
	categoryId: int(),
	tags: json(),
	metaTitle: varchar({ length: 255 }),
	metaDescription: text(),
	isPublished: tinyint().default(0).notNull(),
	publishedAt: timestamp({ mode: 'string' }),
	viewCount: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("blogPosts_slug_unique").on(table.slug),
]);

export const categories = mysqlTable("categories", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull(),
	description: text(),
	imageUrl: text(),
	displayOrder: int().default(0),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("categories_slug_unique").on(table.slug),
]);

export const chatConversations = mysqlTable("chatConversations", {
	id: int().autoincrement().notNull(),
	customerName: varchar({ length: 255 }).notNull(),
	customerEmail: varchar({ length: 320 }),
	customerPhone: varchar({ length: 50 }),
	status: mysqlEnum(['active','closed']).default('active').notNull(),
	lastMessageAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const chatMessages = mysqlTable("chatMessages", {
	id: int().autoincrement().notNull(),
	conversationId: int().notNull().references(() => chatConversations.id, { onDelete: "cascade" } ),
	senderType: mysqlEnum(['customer','admin']).notNull(),
	messageType: mysqlEnum(['text','image','voice','video']).default('text').notNull(),
	content: text().notNull(),
	mediaUrl: text(),
	fileHash: varchar({ length: 64 }),
	isRead: tinyint().default(0).notNull(),
	isDelivered: tinyint().default(0).notNull(),
	deliveredAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const couponUsage = mysqlTable("couponUsage", {
	id: int().autoincrement().notNull(),
	couponId: int().notNull().references(() => coupons.id, { onDelete: "cascade" } ),
	userId: int().references(() => users.id, { onDelete: "set null" } ),
	orderId: int().references(() => orders.id, { onDelete: "set null" } ),
	discountAmount: decimal({ precision: 10, scale: 2 }).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const coupons = mysqlTable("coupons", {
	id: int().autoincrement().notNull(),
	code: varchar({ length: 50 }).notNull(),
	description: text(),
	discountType: mysqlEnum(['percentage','fixed']).notNull(),
	discountValue: decimal({ precision: 10, scale: 2 }).notNull(),
	minPurchaseAmount: decimal({ precision: 10, scale: 2 }),
	maxDiscountAmount: decimal({ precision: 10, scale: 2 }),
	usageLimit: int(),
	usageCount: int().default(0).notNull(),
	perUserLimit: int(),
	validFrom: timestamp({ mode: 'string' }).notNull(),
	validUntil: timestamp({ mode: 'string' }),
	isActive: tinyint().default(1).notNull(),
	applicableProducts: json(),
	applicableCategories: json(),
	createdBy: int().notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("coupons_code_unique").on(table.code),
]);

export const customPages = mysqlTable("customPages", {
	id: int().autoincrement().notNull(),
	slug: varchar({ length: 255 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	titleAr: varchar({ length: 255 }),
	content: text().notNull(),
	contentAr: text(),
	metaTitle: varchar({ length: 255 }),
	metaDescription: text(),
	isPublished: tinyint().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("customPages_slug_unique").on(table.slug),
]);

export const faqItems = mysqlTable("faqItems", {
	id: int().autoincrement().notNull(),
	menuId: int().notNull().references(() => faqMenus.id, { onDelete: "cascade" } ),
	question: text().notNull(),
	questionAr: text(),
	answer: text().notNull(),
	answerAr: text(),
	linkUrl: varchar({ length: 500 }),
	linkText: varchar({ length: 255 }),
	linkTextAr: varchar({ length: 255 }),
	displayOrder: int().default(0).notNull(),
	isVisible: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const faqMenus = mysqlTable("faqMenus", {
	id: int().autoincrement().notNull(),
	title: varchar({ length: 255 }).notNull(),
	titleAr: varchar({ length: 255 }),
	displayOrder: int().default(0).notNull(),
	isVisible: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const mediaAssets = mysqlTable("mediaAssets", {
	id: int().autoincrement().notNull(),
	fileName: varchar({ length: 255 }).notNull(),
	fileKey: varchar({ length: 500 }).notNull(),
	url: text().notNull(),
	thumbnailUrl: text(),
	mimeType: varchar({ length: 100 }),
	fileSize: int(),
	width: int(),
	height: int(),
	uploadedBy: int().notNull(),
	folder: varchar({ length: 255 }),
	tags: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const newsletterSubscribers = mysqlTable("newsletterSubscribers", {
	id: int().autoincrement().notNull(),
	email: varchar({ length: 320 }).notNull(),
	status: mysqlEnum(['active','unsubscribed']).default('active').notNull(),
	subscribedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	unsubscribedAt: timestamp({ mode: 'string' }),
},
(table) => [
	index("newsletterSubscribers_email_unique").on(table.email),
]);

export const notificationPreferences = mysqlTable("notificationPreferences", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	emailOrderConfirmation: tinyint().default(1).notNull(),
	emailOrderStatus: tinyint().default(1).notNull(),
	emailPromotions: tinyint().default(1).notNull(),
	inAppNotifications: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	pushNotifications: tinyint().default(1).notNull(),
	telegramNotifications: tinyint().default(0).notNull(),
},
(table) => [
	index("notificationPreferences_userId_unique").on(table.userId),
]);

export const notifications = mysqlTable("notifications", {
	id: int().autoincrement().notNull(),
	userId: int(),
	type: mysqlEnum(['order','low_stock','system','custom','message','user']).notNull(),
	title: varchar({ length: 255 }).notNull(),
	message: text().notNull(),
	link: varchar({ length: 500 }),
	isRead: tinyint().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	entityType: varchar({ length: 50 }),
	entityId: int(),
});

export const orderItems = mysqlTable("orderItems", {
	id: int().autoincrement().notNull(),
	orderId: int().notNull(),
	productId: int().notNull(),
	productName: varchar({ length: 255 }).notNull(),
	productSku: varchar({ length: 100 }),
	productImage: text(),
	quantity: int().notNull(),
	price: decimal({ precision: 10, scale: 2 }).notNull(),
	subtotal: decimal({ precision: 10, scale: 2 }).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const orders = mysqlTable("orders", {
	id: int().autoincrement().notNull(),
	orderNumber: varchar({ length: 50 }).notNull(),
	userId: int(),
	customerName: varchar({ length: 255 }).notNull(),
	customerEmail: varchar({ length: 320 }).notNull(),
	customerPhone: varchar({ length: 50 }),
	shippingAddress: json().notNull(),
	billingAddress: json(),
	subtotal: decimal({ precision: 10, scale: 2 }).notNull(),
	shippingCost: decimal({ precision: 10, scale: 2 }).default('0.00').notNull(),
	tax: decimal({ precision: 10, scale: 2 }).default('0.00').notNull(),
	total: decimal({ precision: 10, scale: 2 }).notNull(),
	status: mysqlEnum(['pending','processing','shipped','delivered','cancelled','refunded']).default('pending').notNull(),
	paymentStatus: mysqlEnum(['pending','paid','failed','refunded']).default('pending').notNull(),
	paymentMethod: varchar({ length: 50 }),
	paymentProvider: mysqlEnum(['stripe','fawry','payoneer','cod','instapay','vodafone_cash']),
	paymentReceiptUrl: text(),
	paymentTransactionId: varchar({ length: 255 }),
	notes: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("orders_orderNumber_unique").on(table.orderNumber),
]);

export const pageSections = mysqlTable("pageSections", {
	id: int().autoincrement().notNull(),
	pageName: varchar({ length: 100 }).default('home').notNull(),
	sectionKey: varchar({ length: 100 }).notNull(),
	title: varchar({ length: 255 }),
	subtitle: text(),
	content: text(),
	imageUrl: text(),
	ctaText: varchar({ length: 100 }),
	ctaLink: varchar({ length: 500 }),
	data: json(),
	displayOrder: int().default(0),
	isVisible: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const paymentMethods = mysqlTable("paymentMethods", {
	id: int().autoincrement().notNull(),
	provider: mysqlEnum(['stripe','fawry','payoneer','cod','instapay','vodafone_cash']).notNull(),
	displayName: varchar({ length: 255 }).notNull(),
	description: text(),
	isVisible: tinyint().default(1).notNull(),
	displayOrder: int().default(0),
	icon: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("paymentMethods_provider_unique").on(table.provider),
]);

export const productReviews = mysqlTable("productReviews", {
	id: int().autoincrement().notNull(),
	productId: int().notNull().references(() => products.id, { onDelete: "cascade" } ),
	userId: int().references(() => users.id, { onDelete: "set null" } ),
	authorName: varchar({ length: 255 }).notNull(),
	authorEmail: varchar({ length: 320 }),
	rating: int().notNull(),
	title: varchar({ length: 255 }),
	comment: text(),
	images: json(),
	isVerifiedPurchase: tinyint().default(0).notNull(),
	isApproved: tinyint().default(0).notNull(),
	helpfulCount: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const productVariants = mysqlTable("productVariants", {
	id: int().autoincrement().notNull(),
	productId: int().notNull().references(() => products.id, { onDelete: "cascade" } ),
	name: varchar({ length: 255 }).notNull(),
	sku: varchar({ length: 100 }),
	price: decimal({ precision: 10, scale: 2 }),
	compareAtPrice: decimal({ precision: 10, scale: 2 }),
	stock: int().default(0).notNull(),
	size: varchar({ length: 50 }),
	color: varchar({ length: 50 }),
	imageUrl: text(),
	isActive: tinyint().default(1).notNull(),
	displayOrder: int().default(0),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("productVariants_sku_unique").on(table.sku),
]);

export const products = mysqlTable("products", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull(),
	description: text(),
	shortDescription: text(),
	price: decimal({ precision: 10, scale: 2 }).notNull(),
	currency: mysqlEnum(['USD','EGP','EUR','GBP','SAR','AED']).default('EGP').notNull(),
	compareAtPrice: decimal({ precision: 10, scale: 2 }),
	costPerItem: decimal({ precision: 10, scale: 2 }),
	sku: varchar({ length: 100 }),
	barcode: varchar({ length: 100 }),
	stockQuantity: int().default(0).notNull(),
	trackInventory: tinyint().default(1).notNull(),
	allowBackorder: tinyint().default(0).notNull(),
	categoryId: int(),
	images: json(),
	weight: decimal({ precision: 10, scale: 2 }),
	weightUnit: mysqlEnum(['kg','g','lb','oz']).default('g'),
	dimensions: json(),
	tags: json(),
	metaTitle: varchar({ length: 255 }),
	metaDescription: text(),
	isActive: tinyint().default(1).notNull(),
	isFeatured: tinyint().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	priceUsd: decimal({ precision: 10, scale: 2 }),
	priceEgp: decimal({ precision: 10, scale: 2 }),
	priceEur: decimal({ precision: 10, scale: 2 }),
	priceGbp: decimal({ precision: 10, scale: 2 }),
	priceSar: decimal({ precision: 10, scale: 2 }),
	priceAed: decimal({ precision: 10, scale: 2 }),
},
(table) => [
	index("products_slug_unique").on(table.slug),
]);

export const savedReplies = mysqlTable("savedReplies", {
	id: int().autoincrement().notNull(),
	adminId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	replyType: mysqlEnum(['text','image','link']).default('text').notNull(),
	content: text().notNull(),
	mediaUrl: text(),
	linkUrl: text(),
	linkText: varchar({ length: 255 }),
	displayOrder: int().default(0).notNull(),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const seoSettings = mysqlTable("seoSettings", {
	id: int().autoincrement().notNull(),
	pagePath: varchar({ length: 255 }).notNull(),
	metaTitle: varchar({ length: 255 }),
	metaDescription: text(),
	metaKeywords: text(),
	ogTitle: varchar({ length: 255 }),
	ogDescription: text(),
	ogImage: text(),
	schemaMarkup: json(),
	canonicalUrl: text(),
	noIndex: tinyint().default(0).notNull(),
	noFollow: tinyint().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("seoSettings_pagePath_unique").on(table.pagePath),
]);

export const siteSettings = mysqlTable("siteSettings", {
	id: int().autoincrement().notNull(),
	settingKey: varchar({ length: 255 }).notNull(),
	settingValue: text(),
	settingType: mysqlEnum(['text','number','boolean','json']).default('text').notNull(),
	description: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("siteSettings_settingKey_unique").on(table.settingKey),
]);

export const users = mysqlTable("users", {
	id: int().autoincrement().notNull(),
	openId: varchar({ length: 64 }).notNull(),
	name: text(),
	email: varchar({ length: 320 }),
	loginMethod: varchar({ length: 64 }),
	role: mysqlEnum(['user','admin']).default('user').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	lastSignedIn: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("users_openId_unique").on(table.openId),
]);

export const wishlistItems = mysqlTable("wishlistItems", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	productId: int().notNull().references(() => products.id, { onDelete: "cascade" } ),
	variantId: int().references(() => productVariants.id, { onDelete: "set null" } ),
	priceWhenAdded: decimal({ precision: 10, scale: 2 }),
	notifyOnPriceDrop: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const otpVerifications = mysqlTable("otpVerifications", {
	id: int().autoincrement().notNull(),
	orderId: int().notNull().references(() => orders.id, { onDelete: "cascade" } ),
	phoneNumber: varchar({ length: 20 }).notNull(),
	otp: varchar({ length: 6 }).notNull(),
	attempts: int().default(0).notNull(),
	maxAttempts: int().default(3).notNull(),
	isVerified: tinyint().default(0).notNull(),
	verifiedAt: timestamp({ mode: 'string' }),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export type OtpVerification = typeof otpVerifications.$inferSelect;
export type InsertOtpVerification = typeof otpVerifications.$inferInsert;

export const whatsappMessages = mysqlTable("whatsappMessages", {
	id: int().autoincrement().notNull(),
	orderId: int().notNull().references(() => orders.id, { onDelete: "cascade" } ),
	phoneNumber: varchar({ length: 20 }).notNull(),
	messageType: mysqlEnum(['order_confirmation','order_update','order_shipped','order_delivered']).notNull(),
	messageContent: text().notNull(),
	status: mysqlEnum(['pending','sent','failed','read']).default('pending').notNull(),
	externalMessageId: varchar({ length: 255 }),
	errorMessage: text(),
	sentAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export type WhatsappMessage = typeof whatsappMessages.$inferSelect;
export type InsertWhatsappMessage = typeof whatsappMessages.$inferInsert;
