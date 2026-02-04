import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";

export const otpRouter = router({
  // Generate and send OTP
  sendOtp: publicProcedure
    .input(z.object({
      orderId: z.number(),
      phoneNumber: z.string().min(7, "Invalid phone number"),
      countryCode: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        // Generate 6-digit OTP
        const otp = db.generateOtp();
        const expiresAt = db.getOtpExpirationTime(5); // 5 minutes
        
        // Create OTP record in database
        const result = await db.createOtpVerification({
          orderId: input.orderId,
          phoneNumber: `${input.countryCode}${input.phoneNumber}`,
          otp,
          expiresAt: expiresAt.toISOString(),
          isVerified: false as any,
        });

        // TODO: Send SMS via Twilio or other SMS provider
        console.log(`[OTP] Sent OTP ${otp} to ${input.phoneNumber}`);

        return {
          success: true,
          message: "OTP sent to your phone number",
          expiresIn: 300, // 5 minutes in seconds
        };
      } catch (error: any) {
        console.error("[OTP] Error sending OTP:", error);
        return {
          success: false,
          message: "Failed to send OTP",
          error: error.message,
        };
      }
    }),

  // Verify OTP
  verifyOtp: publicProcedure
    .input(z.object({
      orderId: z.number(),
      otp: z.string().length(6, "OTP must be 6 digits"),
    }))
    .mutation(async ({ input }) => {
      try {
        // Get OTP record
        const otpRecord = await db.getOtpVerificationByOrderId(input.orderId);
        
        if (!otpRecord) {
          return {
            success: false,
            message: "OTP not found for this order",
          };
        }

        // Check if OTP is already verified
        if (otpRecord.isVerified) {
          return {
            success: false,
            message: "Phone number already verified",
          };
        }

        // Check if OTP has expired
        const now = new Date();
        const expiresAt = new Date(otpRecord.expiresAt);
        if (now > expiresAt) {
          return {
            success: false,
            message: "OTP has expired",
          };
        }

        // Check if max attempts exceeded
        if (otpRecord.attempts >= otpRecord.maxAttempts) {
          return {
            success: false,
            message: "Maximum OTP attempts exceeded",
          };
        }

        // Verify OTP
        if (otpRecord.otp !== input.otp) {
          // Increment attempts
          await db.updateOtpVerification(otpRecord.id, {
            attempts: otpRecord.attempts + 1,
          });

          return {
            success: false,
            message: `Invalid OTP. ${otpRecord.maxAttempts - otpRecord.attempts - 1} attempts remaining`,
          };
        }

        // Mark as verified
        await db.updateOtpVerification(otpRecord.id, {
          isVerified: true as any,
          verifiedAt: new Date().toISOString(),
        });

        return {
          success: true,
          message: "Phone number verified successfully",
        };
      } catch (error: any) {
        console.error("[OTP] Error verifying OTP:", error);
        return {
          success: false,
          message: "Failed to verify OTP",
          error: error.message,
        };
      }
    }),

  // Resend OTP
  resendOtp: publicProcedure
    .input(z.object({
      orderId: z.number(),
    }))
    .mutation(async ({ input }) => {
      try {
        // Get existing OTP record
        const otpRecord = await db.getOtpVerificationByOrderId(input.orderId);
        
        if (!otpRecord) {
          return {
            success: false,
            message: "OTP not found for this order",
          };
        }

        if (otpRecord.isVerified) {
          return {
            success: false,
            message: "Phone number already verified",
          };
        }

        // Generate new OTP
        const newOtp = db.generateOtp();
        const expiresAt = db.getOtpExpirationTime(5);

        // Update OTP record
        await db.updateOtpVerification(otpRecord.id, {
          otp: newOtp,
          expiresAt: expiresAt.toISOString(),
          attempts: 0,
        });

        // TODO: Send SMS via Twilio or other SMS provider
        console.log(`[OTP] Resent OTP ${newOtp} to ${otpRecord.phoneNumber}`);

        return {
          success: true,
          message: "OTP resent to your phone number",
          expiresIn: 300,
        };
      } catch (error: any) {
        console.error("[OTP] Error resending OTP:", error);
        return {
          success: false,
          message: "Failed to resend OTP",
          error: error.message,
        };
      }
    }),

  // Get OTP status
  getStatus: publicProcedure
    .input(z.object({
      orderId: z.number(),
    }))
    .query(async ({ input }) => {
      try {
        const otpRecord = await db.getOtpVerificationByOrderId(input.orderId);
        
        if (!otpRecord) {
          return {
            found: false,
            verified: false,
          };
        }

        const now = new Date();
        const expiresAt = new Date(otpRecord.expiresAt);
        const isExpired = now > expiresAt;

        return {
          found: true,
          verified: otpRecord.isVerified,
          expired: isExpired,
          attemptsRemaining: otpRecord.maxAttempts - otpRecord.attempts,
          phoneNumber: otpRecord.phoneNumber,
        };
      } catch (error: any) {
        console.error("[OTP] Error getting status:", error);
        return {
          found: false,
          verified: false,
          error: error.message,
        };
      }
    }),
});
