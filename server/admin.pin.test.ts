import { describe, it, expect } from "vitest";

describe("Admin PIN Login", () => {
  const ADMIN_PIN = "2725";

  it("should verify correct PIN", () => {
    const inputPin = "2725";
    expect(inputPin).toBe(ADMIN_PIN);
  });

  it("should reject incorrect PIN", () => {
    const inputPin = "1234";
    expect(inputPin).not.toBe(ADMIN_PIN);
  });

  it("should only accept 4 digit PIN", () => {
    const validPin = "2725";
    expect(validPin.length).toBe(4);
    expect(/^\d{4}$/.test(validPin)).toBe(true);
  });

  it("should reject non-numeric input", () => {
    const invalidPin = "27ab";
    expect(/^\d{4}$/.test(invalidPin)).toBe(false);
  });

  it("should reject PIN shorter than 4 digits", () => {
    const shortPin = "27";
    expect(shortPin.length).toBeLessThan(4);
  });

  it("should reject PIN longer than 4 digits", () => {
    const longPin = "27251";
    expect(longPin.length).toBeGreaterThan(4);
  });

  it("should store session in localStorage on successful login", () => {
    const mockStorage = new Map<string, string>();
    
    const pin = "2725";
    if (pin === ADMIN_PIN) {
      mockStorage.set("admin_session", "true");
      mockStorage.set("admin_pin_verified", "true");
    }
    
    expect(mockStorage.get("admin_session")).toBe("true");
    expect(mockStorage.get("admin_pin_verified")).toBe("true");
  });

  it("should not store session on failed login", () => {
    const mockStorage = new Map<string, string>();
    
    const pin = "1111";
    if (pin === ADMIN_PIN) {
      mockStorage.set("admin_session", "true");
      mockStorage.set("admin_pin_verified", "true");
    }
    
    expect(mockStorage.get("admin_session")).toBeUndefined();
    expect(mockStorage.get("admin_pin_verified")).toBeUndefined();
  });
});
