import { relations } from "drizzle-orm/relations";
import { chatConversations, chatMessages, coupons, couponUsage, users, orders, faqMenus, faqItems, products, productReviews, productVariants, savedReplies, wishlistItems } from "./schema";

export const chatMessagesRelations = relations(chatMessages, ({one}) => ({
	chatConversation: one(chatConversations, {
		fields: [chatMessages.conversationId],
		references: [chatConversations.id]
	}),
}));

export const chatConversationsRelations = relations(chatConversations, ({many}) => ({
	chatMessages: many(chatMessages),
}));

export const couponUsageRelations = relations(couponUsage, ({one}) => ({
	coupon: one(coupons, {
		fields: [couponUsage.couponId],
		references: [coupons.id]
	}),
	user: one(users, {
		fields: [couponUsage.userId],
		references: [users.id]
	}),
	order: one(orders, {
		fields: [couponUsage.orderId],
		references: [orders.id]
	}),
}));

export const couponsRelations = relations(coupons, ({many}) => ({
	couponUsages: many(couponUsage),
}));

export const usersRelations = relations(users, ({many}) => ({
	couponUsages: many(couponUsage),
	productReviews: many(productReviews),
	savedReplies: many(savedReplies),
	wishlistItems: many(wishlistItems),
}));

export const ordersRelations = relations(orders, ({many}) => ({
	couponUsages: many(couponUsage),
}));

export const faqItemsRelations = relations(faqItems, ({one}) => ({
	faqMenu: one(faqMenus, {
		fields: [faqItems.menuId],
		references: [faqMenus.id]
	}),
}));

export const faqMenusRelations = relations(faqMenus, ({many}) => ({
	faqItems: many(faqItems),
}));

export const productReviewsRelations = relations(productReviews, ({one}) => ({
	product: one(products, {
		fields: [productReviews.productId],
		references: [products.id]
	}),
	user: one(users, {
		fields: [productReviews.userId],
		references: [users.id]
	}),
}));

export const productsRelations = relations(products, ({many}) => ({
	productReviews: many(productReviews),
	productVariants: many(productVariants),
	wishlistItems: many(wishlistItems),
}));

export const productVariantsRelations = relations(productVariants, ({one, many}) => ({
	product: one(products, {
		fields: [productVariants.productId],
		references: [products.id]
	}),
	wishlistItems: many(wishlistItems),
}));

export const savedRepliesRelations = relations(savedReplies, ({one}) => ({
	user: one(users, {
		fields: [savedReplies.adminId],
		references: [users.id]
	}),
}));

export const wishlistItemsRelations = relations(wishlistItems, ({one}) => ({
	user: one(users, {
		fields: [wishlistItems.userId],
		references: [users.id]
	}),
	product: one(products, {
		fields: [wishlistItems.productId],
		references: [products.id]
	}),
	productVariant: one(productVariants, {
		fields: [wishlistItems.variantId],
		references: [productVariants.id]
	}),
}));