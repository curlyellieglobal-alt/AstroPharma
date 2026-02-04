import React, { useEffect } from "react";
import { trpc } from "@/lib/trpc";

interface SEOProps {
  pagePath: string;
  defaultTitle?: string;
  defaultDescription?: string;
}

export function SEO({ pagePath, defaultTitle = "CurlyEllie - Premium Hair Care", defaultDescription = "Premium hair care solutions for curly hair" }: SEOProps) {
  const { data: seo } = trpc.seo.get.useQuery({ pagePath });

  useEffect(() => {
    const title = seo?.metaTitle || defaultTitle;
    const description = seo?.metaDescription || defaultDescription;
    const keywords = seo?.metaKeywords || "";
    
    // Update Title
    document.title = title;

    // Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // Update Meta Keywords
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', keywords);
    }

    // Update Open Graph Tags
    const ogTags = [
      { property: 'og:title', content: seo?.ogTitle || title },
      { property: 'og:description', content: seo?.ogDescription || description },
      { property: 'og:image', content: seo?.ogImage || '/curly-ellie-logo.png' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: window.location.href }
    ];

    ogTags.forEach(tag => {
      let element = document.querySelector(`meta[property="${tag.property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', tag.property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', tag.content);
    });

    // Update Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', seo?.canonicalUrl || window.location.href);

    // Schema Markup
    if (seo?.schemaMarkup) {
      try {
        const scriptId = 'seo-schema-markup';
        let script = document.getElementById(scriptId);
        if (!script) {
          script = document.createElement('script');
          script.id = scriptId;
          script.type = 'application/ld+json';
          document.head.appendChild(script);
        }
        script.textContent = seo.schemaMarkup;
      } catch (e) {
        console.error("Failed to inject schema markup", e);
      }
    }

  }, [seo, defaultTitle, defaultDescription]);

  return null;
}
