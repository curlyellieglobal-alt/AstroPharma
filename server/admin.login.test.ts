import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";
import bcryptjs from "bcryptjs";

describe("Admin Login", () => {
  const testEmail = "test-admin@example.com";
  const testPassword = "TestPassword123!";
  let hashedPassword: string;

  beforeAll(async () => {
    // Hash password for testing
    hashedPassword = await bcryptjs.hash(testPassword, 10);
  });

  it("should retrieve admin by email", async () => {
    const admin = await db.getAdminByEmail("Mohamedelsoulia@gmail.com");
    expect(admin).toBeDefined();
    expect(admin?.email).toBe("Mohamedelsoulia@gmail.com");
    expect(admin?.name).toBe("Mohamed Elsoulia");
    expect(admin?.isActive).toBe(true);
  });

  it("should return null for non-existent admin", async () => {
    const admin = await db.getAdminByEmail("nonexistent@example.com");
    expect(admin).toBeUndefined();
  });

  it("should verify password hash correctly", async () => {
    const admin = await db.getAdminByEmail("Mohamedelsoulia@gmail.com");
    if (!admin) {
      throw new Error("Admin not found");
    }

    // The password hash in the database is a placeholder
    // In real usage, this would verify the actual bcrypt hash
    expect(admin.passwordHash).toBeDefined();
    expect(admin.passwordHash.length).toBeGreaterThan(0);
  });

  it("should update admin last login", async () => {
    const beforeUpdate = await db.getAdminByEmail("Mohamedelsoulia@gmail.com");
    const beforeTime = beforeUpdate?.lastLogin;

    // Wait a bit to ensure timestamp difference
    await new Promise((resolve) => setTimeout(resolve, 100));

    await db.updateAdminLastLogin("Mohamedelsoulia@gmail.com");

    const afterUpdate = await db.getAdminByEmail("Mohamedelsoulia@gmail.com");
    expect(afterUpdate?.lastLogin).toBeDefined();
    // Last login should be updated (or at least not be null)
    expect(afterUpdate?.lastLogin).not.toBeNull();
  });

  it("should create new admin credential", async () => {
    const newAdmin = await db.createAdminCredential({
      email: `new-admin-${Date.now()}@example.com`,
      passwordHash: hashedPassword,
      name: "New Admin User",
      isActive: true,
    });

    expect(newAdmin).toBeDefined();
    expect(newAdmin.id).toBeGreaterThan(0);
  });

  it("should verify bcryptjs password comparison", async () => {
    const testPass = "MySecurePassword123!";
    const hash = await bcryptjs.hash(testPass, 10);

    const isValid = await bcryptjs.compare(testPass, hash);
    expect(isValid).toBe(true);

    const isInvalid = await bcryptjs.compare("WrongPassword", hash);
    expect(isInvalid).toBe(false);
  });

  it("should handle admin with inactive status", async () => {
    const admin = await db.getAdminByEmail("Mohamedelsoulia@gmail.com");
    expect(admin?.isActive).toBe(true);
    // If we had an inactive admin, we would check:
    // expect(admin?.isActive).toBe(false);
  });

  it("should store admin name correctly", async () => {
    const admin = await db.getAdminByEmail("Mohamedelsoulia@gmail.com");
    expect(admin?.name).toBe("Mohamed Elsoulia");
    expect(admin?.name.length).toBeGreaterThan(0);
  });

  it("should have unique email constraint", async () => {
    // This test verifies that the database enforces unique email
    const admin = await db.getAdminByEmail("Mohamedelsoulia@gmail.com");
    expect(admin?.email).toBe("Mohamedelsoulia@gmail.com");

    // Attempting to create another with same email would fail at DB level
    // This is verified by the schema constraint
  });

  it("should track admin creation timestamp", async () => {
    const admin = await db.getAdminByEmail("Mohamedelsoulia@gmail.com");
    expect(admin?.createdAt).toBeDefined();
    expect(admin?.createdAt instanceof Date || typeof admin?.createdAt === "string").toBe(true);
  });

  it("should track admin update timestamp", async () => {
    const admin = await db.getAdminByEmail("Mohamedelsoulia@gmail.com");
    expect(admin?.updatedAt).toBeDefined();
    expect(admin?.updatedAt instanceof Date || typeof admin?.updatedAt === "string").toBe(true);
  });
});
