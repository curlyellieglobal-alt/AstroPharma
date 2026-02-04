/**
 * Content Generation Routers
 * Admin-only endpoints for LLM-powered content generation
 */

import { z } from "zod";
import { router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { generateProductDescription, generateBlogArticle, improveSEO } from "./contentGeneration";

// Admin-only procedure
import { protectedProcedure } from "./_core/trpc";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const contentGenerationRouter = router({
  generateProductDescription: adminProcedure
    .input(z.object({
      name: z.string(),
      category: z.string().optional(),
      keyFeatures: z.array(z.string()).optional(),
      targetAudience: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const description = await generateProductDescription(input);
      return { description };
    }),

  generateBlogArticle: adminProcedure
    .input(z.object({
      title: z.string(),
      topic: z.string(),
      keywords: z.array(z.string()).optional(),
      targetLength: z.enum(["short", "medium", "long"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const result = await generateBlogArticle(input);
      return result;
    }),

  improveSEO: adminProcedure
    .input(z.object({
      content: z.string(),
      targetKeywords: z.array(z.string()),
    }))
    .mutation(async ({ input }) => {
      const result = await improveSEO(input.content, input.targetKeywords);
      return result;
    }),
});
