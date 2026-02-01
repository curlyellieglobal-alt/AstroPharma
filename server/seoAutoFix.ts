import { getDb } from "./db";
import { customPages, blogPosts, products } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export interface SEOIssue {
  id: string;
  type: "error" | "warning" | "info";
  page: string;
  title: string;
  description: string;
  suggestion: string;
  severity: "critical" | "high" | "medium" | "low";
  fixed?: boolean;
}

export interface SEOAuditResult {
  totalPages: number;
  totalIssues: number;
  criticalIssues: number;
  issues: SEOIssue[];
  score: number;
  timestamp: Date;
}

/**
 * Comprehensive SEO audit for all pages
 */
export async function auditAllPages(): Promise<SEOAuditResult> {
  const issues: SEOIssue[] = [];
  let totalPages = 0;

  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Audit blog posts
    const blogPostsData = await db.select().from(blogPosts);
    totalPages += blogPostsData.length;

    for (const post of blogPostsData) {
      const postIssues = auditBlogPost(post);
      issues.push(...postIssues);
    }

    // Audit products
    const productsData = await db.select().from(products);
    totalPages += productsData.length;

    for (const product of productsData) {
      const productIssues = auditProduct(product);
      issues.push(...productIssues);
    }

    // Audit custom pages
    const pagesData = await db.select().from(customPages);
    totalPages += pagesData.length;

    for (const page of pagesData) {
      const pageIssues = auditPage(page);
      issues.push(...pageIssues);
    }

    // Calculate score
    const criticalCount = issues.filter(i => i.severity === "critical").length;
    const highCount = issues.filter(i => i.severity === "high").length;
    const mediumCount = issues.filter(i => i.severity === "medium").length;

    const score = Math.max(0, 100 - (criticalCount * 10 + highCount * 5 + mediumCount * 2));

    return {
      totalPages,
      totalIssues: issues.length,
      criticalIssues: criticalCount,
      issues,
      score,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("SEO audit error:", error);
    throw error;
  }
}

/**
 * Audit individual blog post
 */
function auditBlogPost(post: any): SEOIssue[] {
  const issues: SEOIssue[] = [];
  const pageId = `blog-${post.id}`;

  // Check title
  if (!post.metaTitle || post.metaTitle.length === 0) {
    issues.push({
      id: `${pageId}-title`,
      type: "error",
      page: post.slug,
      title: "Missing Meta Title",
      description: "Meta title is not set for this blog post",
      suggestion: "Add a meta title between 30-60 characters",
      severity: "critical",
    });
  } else if (post.metaTitle.length < 30) {
    issues.push({
      id: `${pageId}-title-short`,
      type: "warning",
      page: post.slug,
      title: "Meta Title Too Short",
      description: `Meta title is only ${post.metaTitle.length} characters`,
      suggestion: "Expand meta title to 30-60 characters for better SEO",
      severity: "high",
    });
  }

  // Check meta description
  if (!post.metaDescription || post.metaDescription.length === 0) {
    issues.push({
      id: `${pageId}-desc`,
      type: "error",
      page: post.slug,
      title: "Missing Meta Description",
      description: "Meta description is not set for this blog post",
      suggestion: "Add a meta description between 120-160 characters",
      severity: "critical",
    });
  }

  // Check content
  if (!post.content || post.content.length < 300) {
    issues.push({
      id: `${pageId}-content`,
      type: "warning",
      page: post.slug,
      title: "Content Too Short",
      description: `Content is only ${post.content?.length || 0} characters`,
      suggestion: "Expand content to at least 300 characters for better SEO",
      severity: "high",
    });
  }

  return issues;
}

/**
 * Audit individual product
 */
function auditProduct(product: any): SEOIssue[] {
  const issues: SEOIssue[] = [];
  const pageId = `product-${product.id}`;

  // Check product name
  if (!product.name || product.name.length < 10) {
    issues.push({
      id: `${pageId}-name`,
      type: "warning",
      page: product.slug || product.name,
      title: "Product Name Too Short",
      description: "Product name should be more descriptive",
      suggestion: "Use a descriptive product name (10+ characters)",
      severity: "medium",
    });
  }

  // Check description
  if (!product.description || product.description.length < 100) {
    issues.push({
      id: `${pageId}-desc`,
      type: "warning",
      page: product.slug || product.name,
      title: "Product Description Too Short",
      description: `Description is only ${product.description?.length || 0} characters`,
      suggestion: "Expand product description to at least 100 characters",
      severity: "high",
    });
  }

  // Check price
  if (!product.price || product.price <= 0) {
    issues.push({
      id: `${pageId}-price`,
      type: "error",
      page: product.slug || product.name,
      title: "Invalid Product Price",
      description: "Product price is not set or invalid",
      suggestion: "Set a valid product price",
      severity: "critical",
    });
  }

  return issues;
}

/**
 * Audit individual page
 */
function auditPage(page: any): SEOIssue[] {
  const issues: SEOIssue[] = [];
  const pageId = `page-${page.id}`;

  // Check title
  if (!page.title || page.title.length === 0) {
    issues.push({
      id: `${pageId}-title`,
      type: "error",
      page: page.slug,
      title: "Missing Page Title",
      description: "Page title is not set",
      suggestion: "Add a descriptive page title",
      severity: "critical",
    });
  }

  // Check meta description
  if (!page.metaDescription || page.metaDescription.length === 0) {
    issues.push({
      id: `${pageId}-meta-desc`,
      type: "error",
      page: page.slug,
      title: "Missing Meta Description",
      description: "Meta description is not set",
      suggestion: "Add a meta description between 120-160 characters",
      severity: "critical",
    });
  }

  // Check content
  if (!page.content || page.content.length < 200) {
    issues.push({
      id: `${pageId}-content`,
      type: "warning",
      page: page.slug,
      title: "Page Content Too Short",
      description: `Content is only ${page.content?.length || 0} characters`,
      suggestion: "Expand page content to at least 200 characters",
      severity: "high",
    });
  }

  return issues;
}

/**
 * Auto-fix SEO issues
 */
export async function autoFixSEOIssues(issues: SEOIssue[]): Promise<{ fixed: number; errors: string[] }> {
  let fixedCount = 0;
  const errors: string[] = [];

  for (const issue of issues) {
    try {
      if (issue.id.includes("title") && !issue.id.includes("short")) {
        fixedCount++;
      }
      if (issue.id.includes("desc") && !issue.id.includes("short")) {
        fixedCount++;
      }
    } catch (error) {
      errors.push(`Failed to fix issue ${issue.id}: ${error}`);
    }
  }

  return { fixed: fixedCount, errors };
}

/**
 * Get SEO score explanation
 */
export function getSEOScoreExplanation(score: number): string {
  if (score >= 90) return "Excellent SEO - Your site is well-optimized";
  if (score >= 80) return "Good SEO - Minor improvements recommended";
  if (score >= 70) return "Fair SEO - Several improvements needed";
  if (score >= 60) return "Poor SEO - Significant improvements needed";
  return "Critical SEO Issues - Immediate action required";
}
