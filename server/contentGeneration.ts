/**
 * LLM-Powered Content Generation
 * Helps admins create product descriptions and blog articles
 */

import { invokeLLM } from "./_core/llm";

export async function generateProductDescription(productInfo: {
  name: string;
  category?: string;
  keyFeatures?: string[];
  targetAudience?: string;
}): Promise<string> {
  const featuresText = productInfo.keyFeatures?.join(", ") || "health benefits";
  
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a professional copywriter specializing in health and wellness products. Create compelling, SEO-optimized product descriptions that highlight benefits and build trust.",
      },
      {
        role: "user",
        content: `Create a detailed product description for "${productInfo.name}", a ${productInfo.category || "health and wellness"} product. Key features: ${featuresText}. Target audience: ${productInfo.targetAudience || "health-conscious consumers"}. Include benefits, usage instructions, and a call to action. Keep it professional and persuasive.`,
      },
    ],
  });

  const messageContent = response.choices[0]?.message?.content;
  return typeof messageContent === 'string' ? messageContent : "";
}

export async function generateBlogArticle(articleInfo: {
  title: string;
  topic: string;
  keywords?: string[];
  targetLength?: "short" | "medium" | "long";
}): Promise<{ content: string; excerpt: string }> {
  const lengthGuide = {
    short: "500-700 words",
    medium: "1000-1500 words",
    long: "2000-3000 words",
  };
  
  const length = lengthGuide[articleInfo.targetLength || "medium"];
  const keywordsText = articleInfo.keywords?.join(", ") || "health, wellness";
  
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a medical and wellness content writer. Create informative, well-researched articles that are both engaging and scientifically accurate. Use a professional yet accessible tone.",
      },
      {
        role: "user",
        content: `Write a comprehensive article titled "${articleInfo.title}" about ${articleInfo.topic}. Target length: ${length}. Include these keywords naturally: ${keywordsText}. Structure the article with clear sections, include scientific backing where appropriate, and make it SEO-friendly. Write in a professional but accessible style.`,
      },
    ],
  });

  const messageContent = response.choices[0]?.message?.content;
  const content = typeof messageContent === 'string' ? messageContent : "";
  
  // Generate excerpt
  const excerptResponse = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a professional editor. Create concise, compelling excerpts that capture the essence of articles.",
      },
      {
        role: "user",
        content: `Create a 2-3 sentence excerpt for this article:\n\n${content.substring(0, 500)}...`,
      },
    ],
  });

  const excerptMessageContent = excerptResponse.choices[0]?.message?.content;
  const excerpt = typeof excerptMessageContent === 'string' ? excerptMessageContent : "";
  
  return { content, excerpt };
}

export async function improveSEO(content: string, targetKeywords: string[]): Promise<{
  improvedContent: string;
  metaDescription: string;
  suggestedTags: string[];
}> {
  const keywordsText = targetKeywords.join(", ");
  
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are an SEO expert. Optimize content for search engines while maintaining readability and natural flow.",
      },
      {
        role: "user",
        content: `Optimize this content for SEO with these target keywords: ${keywordsText}. Return a JSON object with: improvedContent (the optimized text), metaDescription (150-160 characters), and suggestedTags (array of 5-8 relevant tags).\n\nContent:\n${content}`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "seo_optimization",
        strict: true,
        schema: {
          type: "object",
          properties: {
            improvedContent: { type: "string" },
            metaDescription: { type: "string" },
            suggestedTags: { 
              type: "array",
              items: { type: "string" }
            },
          },
          required: ["improvedContent", "metaDescription", "suggestedTags"],
          additionalProperties: false,
        },
      },
    },
  });

  const seoMessageContent = response.choices[0]?.message?.content;
  const result = JSON.parse(typeof seoMessageContent === 'string' ? seoMessageContent : "{}");
  return result;
}
