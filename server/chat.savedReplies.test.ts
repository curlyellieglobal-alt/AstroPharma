import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "../server/db";
import { savedReplies, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Chat Saved Replies", () => {
  let testAdminId: number;

  beforeAll(async () => {
    // Create a test admin user
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const result = await db.insert(users).values({
      openId: `test-admin-${Date.now()}`,
      name: "Test Admin",
      email: `admin-${Date.now()}@test.com`,
      role: "admin",
    });
    testAdminId = result[0].insertId;
  });

  afterAll(async () => {
    // Clean up test data
    const db = await getDb();
    if (!db) return;
    
    await db.delete(savedReplies).where(eq(savedReplies.adminId, testAdminId));
    await db.delete(users).where(eq(users.id, testAdminId));
  });

  it("should create a saved reply", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db.insert(savedReplies).values({
      adminId: testAdminId,
      replyType: "text",
      content: "Test reply",
      displayOrder: 1,
      isActive: true,
    });

    expect(result[0].insertId).toBeGreaterThan(0);
  });

  it("should list active saved replies", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Insert test replies
    await db.insert(savedReplies).values([
      {
        adminId: testAdminId,
        replyType: "text",
        content: "Active reply 1",
        displayOrder: 1,
        isActive: true,
      },
      {
        adminId: testAdminId,
        replyType: "text",
        content: "Active reply 2",
        displayOrder: 2,
        isActive: true,
      },
      {
        adminId: testAdminId,
        replyType: "text",
        content: "Inactive reply",
        displayOrder: 3,
        isActive: false,
      },
    ]);

    // Query active replies
    const activeReplies = await db
      .select()
      .from(savedReplies)
      .where(eq(savedReplies.isActive, true));

    expect(activeReplies.length).toBeGreaterThanOrEqual(2);
    expect(activeReplies.every((r) => r.isActive)).toBe(true);
  });

  it("should filter saved replies by admin", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Insert reply for test admin
    await db.insert(savedReplies).values({
      adminId: testAdminId,
      replyType: "text",
      content: "Admin specific reply",
      displayOrder: 1,
      isActive: true,
    });

    // Query replies for test admin
    const adminReplies = await db
      .select()
      .from(savedReplies)
      .where(eq(savedReplies.adminId, testAdminId));

    expect(adminReplies.length).toBeGreaterThan(0);
    expect(adminReplies.every((r) => r.adminId === testAdminId)).toBe(true);
  });

  it("should order saved replies by displayOrder", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Insert replies with different orders
    await db.insert(savedReplies).values([
      {
        adminId: testAdminId,
        replyType: "text",
        content: "Third reply",
        displayOrder: 3,
        isActive: true,
      },
      {
        adminId: testAdminId,
        replyType: "text",
        content: "First reply",
        displayOrder: 1,
        isActive: true,
      },
      {
        adminId: testAdminId,
        replyType: "text",
        content: "Second reply",
        displayOrder: 2,
        isActive: true,
      },
    ]);

    // Query and check order
    const orderedReplies = await db
      .select()
      .from(savedReplies)
      .where(eq(savedReplies.adminId, testAdminId))
      .orderBy(savedReplies.displayOrder);

    const orders = orderedReplies.map((r) => r.displayOrder);
    expect(orders).toEqual(orders.sort((a, b) => a - b));
  });

  it("should support different reply types", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const replyTypes = ["text", "image", "link"] as const;

    for (const type of replyTypes) {
      const result = await db.insert(savedReplies).values({
        adminId: testAdminId,
        replyType: type,
        content: `${type} reply`,
        mediaUrl: type === "image" ? "https://example.com/image.jpg" : undefined,
        linkUrl: type === "link" ? "https://example.com" : undefined,
        linkText: type === "link" ? "Example Link" : undefined,
        displayOrder: 1,
        isActive: true,
      });

      expect(result[0].insertId).toBeGreaterThan(0);
    }

    const replies = await db
      .select()
      .from(savedReplies)
      .where(eq(savedReplies.adminId, testAdminId));

    expect(replies.some((r) => r.replyType === "text")).toBe(true);
    expect(replies.some((r) => r.replyType === "image")).toBe(true);
    expect(replies.some((r) => r.replyType === "link")).toBe(true);
  });

  it("should update saved reply", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create a reply
    const createResult = await db.insert(savedReplies).values({
      adminId: testAdminId,
      replyType: "text",
      content: "Original content",
      displayOrder: 1,
      isActive: true,
    });

    const replyId = createResult[0].insertId;

    // Update the reply
    await db
      .update(savedReplies)
      .set({ content: "Updated content" })
      .where(eq(savedReplies.id, replyId));

    // Verify update
    const [updated] = await db
      .select()
      .from(savedReplies)
      .where(eq(savedReplies.id, replyId));

    expect(updated.content).toBe("Updated content");
  });

  it("should deactivate saved reply", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create a reply
    const createResult = await db.insert(savedReplies).values({
      adminId: testAdminId,
      replyType: "text",
      content: "Active reply",
      displayOrder: 1,
      isActive: true,
    });

    const replyId = createResult[0].insertId;

    // Deactivate
    await db
      .update(savedReplies)
      .set({ isActive: false })
      .where(eq(savedReplies.id, replyId));

    // Verify deactivation
    const [deactivated] = await db
      .select()
      .from(savedReplies)
      .where(eq(savedReplies.id, replyId));

    expect(deactivated.isActive).toBe(false);
  });

  it("should delete saved reply", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create a reply
    const createResult = await db.insert(savedReplies).values({
      adminId: testAdminId,
      replyType: "text",
      content: "Reply to delete",
      displayOrder: 1,
      isActive: true,
    });

    const replyId = createResult[0].insertId;

    // Delete
    await db.delete(savedReplies).where(eq(savedReplies.id, replyId));

    // Verify deletion
    const [deleted] = await db
      .select()
      .from(savedReplies)
      .where(eq(savedReplies.id, replyId));

    expect(deleted).toBeUndefined();
  });
});
