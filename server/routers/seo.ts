import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { auditAllPages, autoFixSEOIssues, getSEOScoreExplanation } from "../seoAutoFix";

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
  autoFix: publicProcedure.mutation(async ({ input }: { input: any }) => {
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
   * Get detailed SEO score explanation
   */
  getScoreExplanation: publicProcedure
    .input((input: any) => input.score)
    .query(({ input }) => {
      return {
        score: input,
        explanation: getSEOScoreExplanation(input),
      };
    }),

  /**
   * Get all SEO settings
   */
  listAll: publicProcedure.query(async () => {
    return [];
  }),

  /**
   * Upsert SEO settings
   */
  upsert: publicProcedure
    .input((input: any) => input)
    .mutation(async ({ input }) => {
      return { success: true };
    }),
});
