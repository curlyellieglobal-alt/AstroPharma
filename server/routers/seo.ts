import { publicProcedure, adminProcedure, router } from "../_core/trpc";
import { auditAllPages, autoFixSEOIssues, getSEOScoreExplanation } from "../seoAutoFix";
import * as db from "../db";
import { z } from "zod";

export const seoRouter = router({
  /**
   * Run comprehensive SEO audit on all pages
   */
  auditAll: publicProcedure.query(async () => {
    try {
      const result = await auditAllPages();
      return {
        success: true,
        data: result,
        explanation: getSEOScoreExplanation(result.score),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to run SEO audit",
      };
    }
  }),

  /**
   * Auto-fix detected SEO issues
   */
  autoFix: adminProcedure.mutation(async () => {
    try {
      const auditResult = await auditAllPages();
      const fixResult = await autoFixSEOIssues(auditResult.issues);
      return {
        success: true,
        data: {
          totalIssues: auditResult.totalIssues,
          fixed: fixResult.fixed,
          errors: fixResult.errors,
          message: `Fixed ${fixResult.fixed} out of ${auditResult.totalIssues} issues`,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to auto-fix SEO issues",
      };
    }
  }),

  /**
   * Get SEO settings for a specific page
   */
  get: publicProcedure
    .input(z.object({ pagePath: z.string() }))
    .query(async ({ input }) => {
      return await db.getSeoSettings(input.pagePath);
    }),

  /**
   * Get all SEO settings
   */
  listAll: adminProcedure.query(async () => {
    return await db.getAllSeoSettings();
  }),

  /**
   * Upsert SEO settings
   */
  upsert: adminProcedure
    .input(z.object({
      pagePath: z.string(),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      metaKeywords: z.string().optional(),
      ogTitle: z.string().optional(),
      ogDescription: z.string().optional(),
      ogImage: z.string().optional(),
      schemaMarkup: z.string().optional(),
      canonicalUrl: z.string().optional(),
      noIndex: z.boolean().optional(),
      noFollow: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      await db.upsertSeoSettings(input as any);
      return { success: true };
    }),
});
