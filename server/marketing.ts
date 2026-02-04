/**
 * Email Marketing and Referral System Procedures
 */

import { getDb } from "./db";
import {
  emailCampaigns,
  emailSubscriptions,
  referralCodes,
  referralRewards,
  otpVerifications,
  orders,
  users,
} from "../drizzle/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

const getDatabase = async () => {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  return db;
};

/**
 * Email Marketing Functions
 */

export async function createEmailCampaign(data: {
  name: string;
  subject: string;
  content: string;
  type: "welcome" | "abandoned_cart" | "product_recommendation" | "promotional" | "newsletter";
  targetAudience: "all_users" | "new_users" | "active_users" | "inactive_users" | "vip_users";
  scheduledAt?: Date;
}) {
  const db = await getDatabase();
  const result = await db.insert(emailCampaigns).values({
    ...data,
    status: "draft",
  });
  return result;
}

export async function scheduleEmailCampaign(campaignId: number, scheduledAt: Date) {
  const db = await getDatabase();
  return await db
    .update(emailCampaigns)
    .set({ status: "scheduled", scheduledAt })
    .where(eq(emailCampaigns.id, campaignId));
}

export async function sendEmailCampaign(campaignId: number) {
  const db = await getDatabase();
  const campaign = await db.query.emailCampaigns.findFirst({
    where: eq(emailCampaigns.id, campaignId),
  });

  if (!campaign) throw new Error("Campaign not found");

  // Get subscribers based on target audience
  let subscribers = await db.query.emailSubscriptions.findMany({
    where: eq(emailSubscriptions.isSubscribed, true),
  });

  // Filter based on target audience
  if (campaign.targetAudience === "new_users") {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    subscribers = subscribers.filter(
      (s: any) => s.createdAt && new Date(s.createdAt) > thirtyDaysAgo
    );
  }

  // Update campaign status
  await db
    .update(emailCampaigns)
    .set({
      status: "sent",
      sentAt: new Date(),
      recipientCount: subscribers.length,
    })
    .where(eq(emailCampaigns.id, campaignId));

  return {
    campaignId,
    recipientCount: subscribers.length,
    sentAt: new Date(),
  };
}

export async function subscribeToEmails(email: string, userId?: number) {
  const db = await getDatabase();
  return await db
    .insert(emailSubscriptions)
    .values({
      email,
      userId,
      isSubscribed: true,
    })
    .onDuplicateKeyUpdate({
      set: { isSubscribed: true },
    });
}

export async function unsubscribeFromEmails(email: string) {
  const db = await getDatabase();
  return await db
    .update(emailSubscriptions)
    .set({
      isSubscribed: false,
      unsubscribedAt: new Date(),
    })
    .where(eq(emailSubscriptions.email, email));
}

export async function getEmailCampaignStats(campaignId: number) {
  const db = await getDatabase();
  const campaign = await db.query.emailCampaigns.findFirst({
    where: eq(emailCampaigns.id, campaignId),
  });

  if (!campaign) throw new Error("Campaign not found");

  return {
    id: campaign.id,
    name: campaign.name,
    status: campaign.status,
    recipientCount: campaign.recipientCount,
    openCount: campaign.openCount,
    clickCount: campaign.clickCount,
    conversionCount: campaign.conversionCount,
    openRate: campaign.recipientCount && campaign.openCount
      ? ((campaign.openCount / campaign.recipientCount) * 100).toFixed(2)
      : "0",
    clickRate: campaign.recipientCount && campaign.clickCount
      ? ((campaign.clickCount / campaign.recipientCount) * 100).toFixed(2)
      : "0",
    conversionRate: campaign.recipientCount && campaign.conversionCount
      ? ((campaign.conversionCount / campaign.recipientCount) * 100).toFixed(2)
      : "0",
  };
}

/**
 * Referral Program Functions
 */

export async function generateReferralCode(userId: number, discountPercentage: number = 10) {
  const db = await getDatabase();
  const code = `REF${userId}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const result = await db.insert(referralCodes).values({
    userId,
    code,
    discountPercentage,
    maxUses: null, // unlimited
  });

  return { code, discountPercentage };
}

export async function getReferralCode(userId: number) {
  const db = await getDatabase();
  const code = await db.query.referralCodes.findFirst({
    where: and(eq(referralCodes.userId, userId), eq(referralCodes.isActive, true)),
  });

  return code;
}

export async function validateReferralCode(code: string) {
  const db = await getDatabase();
  const referralCode = await db.query.referralCodes.findFirst({
    where: and(
      eq(referralCodes.code, code),
      eq(referralCodes.isActive, true),
      lte(referralCodes.expiresAt, new Date())
    ),
  });

  if (!referralCode) throw new Error("Invalid or expired referral code");

  if (referralCode.maxUses && referralCode.currentUses && referralCode.currentUses >= referralCode.maxUses) {
    throw new Error("Referral code has reached maximum uses");
  }

  return referralCode;
}

export async function applyReferral(referralCode: string, referredUserId: number, orderId: number) {
  const db = await getDatabase();
  const code = await validateReferralCode(referralCode);

  // Create referral reward
  const rewardAmount = (code.discountPercentage / 100) * 1000; // Assuming 1000 EGP average order

  const reward = await db.insert(referralRewards).values({
    referrerId: code.userId,
    referredUserId,
    referralCode,
    orderId,
    rewardAmount: rewardAmount.toString(),
    rewardType: "discount",
    status: "pending",
  });

  // Increment referral code uses
  await db
    .update(referralCodes)
    .set({ currentUses: (code.currentUses || 0) + 1 })
    .where(eq(referralCodes.id, code.id));

  // Update referral stats
  const stats = await db.query.otpVerifications.findFirst({
    where: eq(otpVerifications.userId, code.userId),
  });

  if (stats) {
    await db
      .update(otpVerifications)
      .set({
        totalReferrals: (stats.totalReferrals || 0) + 1,
        totalRewardsEarned: (parseFloat(stats.totalRewardsEarned?.toString() || "0") + parseFloat(rewardAmount.toString())).toString(),
      })
      .where(eq(otpVerifications.userId, code.userId));
  } else {
    await db.insert(otpVerifications).values({
      userId: code.userId,
      totalReferrals: 1,
      totalRewardsEarned: rewardAmount.toString(),
    });
  }

  return reward;
}

export async function getReferralStats(userId: number) {
  const db = await getDatabase();
  const [stats] = await db.select().from(otpVerifications).where(eq(otpVerifications.userId, userId)).limit(1);

  return (
    stats || {
      userId,
      totalReferrals: 0,
      successfulReferrals: 0,
      totalRewardsEarned: 0,
      totalRewardsPaid: 0,
    }
  );
}

export async function approveReferralReward(rewardId: number) {
  const db = await getDatabase();
  return await db
    .update(referralRewards)
    .set({ status: "approved" })
    .where(eq(referralRewards.id, rewardId));
}

export async function payReferralReward(rewardId: number) {
  const db = await getDatabase();
  const [reward] = await db.select().from(referralRewards).where(eq(referralRewards.id, rewardId)).limit(1);

  if (!reward) throw new Error("Reward not found");

  await db
    .update(referralRewards)
    .set({ status: "paid" })
    .where(eq(referralRewards.id, rewardId));

  // Update stats
  const [stats] = await db.select().from(otpVerifications).where(eq(otpVerifications.userId, reward.referrerId)).limit(1);

  if (stats) {
    await db
      .update(otpVerifications)
      .set({
        totalRewardsPaid: (parseFloat(stats.totalRewardsPaid?.toString() || "0") + parseFloat(reward.rewardAmount.toString())).toString(),
      })
      .where(eq(otpVerifications.userId, reward.referrerId));
  }

  return reward;
}

export async function getReferralLeaderboard(limit: number = 10) {
  const db = await getDatabase();
  const topReferrers = await db.select().from(otpVerifications).orderBy((stats: any) => [desc(stats.totalRewardsEarned)]).limit(limit);

  return topReferrers.map((stat: any) => ({
    userId: stat.userId,
    totalReferrals: stat.totalReferrals,
    totalRewardsEarned: stat.totalRewardsEarned,
  }));
}
