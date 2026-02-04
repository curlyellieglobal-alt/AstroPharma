import { JSDOM } from 'jsdom';

export interface SEOMetrics {
  url: string;
  title: string;
  h1Tags: string[];
  h2Tags: string[];
  metaDescription: string;
  metaKeywords: string;
  images: {
    total: number;
    withoutAlt: number;
    altTexts: string[];
  };
  links: {
    internal: number;
    external: number;
    broken: number;
  };
  structuredData: {
    hasSchema: boolean;
    types: string[];
  };
  openGraph: {
    title?: string;
    description?: string;
    image?: string;
  };
  twitterCard: {
    card?: string;
    title?: string;
    description?: string;
  };
  canonicalTag: string | null;
  viewport: boolean;
  mobileOptimized: boolean;
  seoScore: number;
  issues: string[];
  recommendations: string[];
}

export async function crawlPage(url: string): Promise<SEOMetrics> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html, { url });
    const document = dom.window.document;

    const metrics: SEOMetrics = {
      url,
      title: document.title || '',
      h1Tags: Array.from(document.querySelectorAll('h1')).map((el: any) => el.textContent || ''),
      h2Tags: Array.from(document.querySelectorAll('h2')).map((el: any) => el.textContent || ''),
      metaDescription: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
      metaKeywords: document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '',
      images: {
        total: document.querySelectorAll('img').length,
        withoutAlt: Array.from(document.querySelectorAll('img')).filter((img: any) => !img.getAttribute('alt')).length,
        altTexts: Array.from(document.querySelectorAll('img')).map((img: any) => img.getAttribute('alt') || ''),
      },
      links: {
        internal: Array.from(document.querySelectorAll('a[href^="/"]')).length,
        external: Array.from(document.querySelectorAll('a[href^="http"]')).length,
        broken: 0, // Would need actual link checking
      },
      structuredData: {
        hasSchema: !!document.querySelector('script[type="application/ld+json"]'),
        types: Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((script: any) => {
          try {
            const data = JSON.parse(script.textContent || '{}');
            return data['@type'] || 'Unknown';
          } catch {
            return 'Invalid';
          }
        }),
      },
      openGraph: {
        title: document.querySelector('meta[property="og:title"]')?.getAttribute('content') || undefined,
        description: document.querySelector('meta[property="og:description"]')?.getAttribute('content') || undefined,
        image: document.querySelector('meta[property="og:image"]')?.getAttribute('content') || undefined,
      },
      twitterCard: {
        card: document.querySelector('meta[name="twitter:card"]')?.getAttribute('content') || undefined,
        title: document.querySelector('meta[name="twitter:title"]')?.getAttribute('content') || undefined,
        description: document.querySelector('meta[name="twitter:description"]')?.getAttribute('content') || undefined,
      },
      canonicalTag: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || null,
      viewport: !!document.querySelector('meta[name="viewport"]'),
      mobileOptimized: !!document.querySelector('meta[name="viewport"]'),
      seoScore: 0,
      issues: [],
      recommendations: [],
    };

    // Calculate SEO score and identify issues
    metrics.seoScore = calculateSEOScore(metrics);
    metrics.issues = identifyIssues(metrics);
    metrics.recommendations = generateRecommendations(metrics);

    return metrics;
  } catch (error) {
    console.error('Error crawling page:', error);
    throw error;
  }
}

function calculateSEOScore(metrics: SEOMetrics): number {
  let score = 50; // Base score

  // Title check (10 points)
  if (metrics.title && metrics.title.length >= 30 && metrics.title.length <= 60) {
    score += 10;
  } else if (metrics.title) {
    score += 5;
  }

  // Meta description check (10 points)
  if (metrics.metaDescription && metrics.metaDescription.length >= 120 && metrics.metaDescription.length <= 160) {
    score += 10;
  } else if (metrics.metaDescription) {
    score += 5;
  }

  // H1 tags check (10 points)
  if (metrics.h1Tags.length === 1) {
    score += 10;
  } else if (metrics.h1Tags.length > 0) {
    score += 5;
  }

  // Images with alt text (10 points)
  if (metrics.images.total > 0) {
    const altPercentage = ((metrics.images.total - metrics.images.withoutAlt) / metrics.images.total) * 100;
    if (altPercentage === 100) {
      score += 10;
    } else if (altPercentage >= 80) {
      score += 7;
    } else if (altPercentage >= 50) {
      score += 5;
    }
  }

  // Mobile optimization (10 points)
  if (metrics.mobileOptimized) {
    score += 10;
  }

  // Structured data (10 points)
  if (metrics.structuredData.hasSchema) {
    score += 10;
  }

  // Open Graph tags (10 points)
  if (metrics.openGraph.title && metrics.openGraph.description && metrics.openGraph.image) {
    score += 10;
  } else if (metrics.openGraph.title || metrics.openGraph.description) {
    score += 5;
  }

  // Canonical tag (10 points)
  if (metrics.canonicalTag) {
    score += 10;
  }

  // Links (5 points)
  if (metrics.links.internal > 0 && metrics.links.external > 0) {
    score += 5;
  }

  return Math.min(score, 100);
}

function identifyIssues(metrics: SEOMetrics): string[] {
  const issues: string[] = [];

  if (!metrics.title) {
    issues.push('Missing page title');
  } else if (metrics.title.length < 30) {
    issues.push('Page title is too short (less than 30 characters)');
  } else if (metrics.title.length > 60) {
    issues.push('Page title is too long (more than 60 characters)');
  }

  if (!metrics.metaDescription) {
    issues.push('Missing meta description');
  } else if (metrics.metaDescription.length < 120) {
    issues.push('Meta description is too short (less than 120 characters)');
  } else if (metrics.metaDescription.length > 160) {
    issues.push('Meta description is too long (more than 160 characters)');
  }

  if (metrics.h1Tags.length === 0) {
    issues.push('Missing H1 tag');
  } else if (metrics.h1Tags.length > 1) {
    issues.push('Multiple H1 tags found (should have only one)');
  }

  if (metrics.images.withoutAlt > 0) {
    issues.push(`${metrics.images.withoutAlt} images missing alt text`);
  }

  if (!metrics.mobileOptimized) {
    issues.push('Page is not mobile optimized (missing viewport meta tag)');
  }

  if (!metrics.structuredData.hasSchema) {
    issues.push('Missing structured data (Schema.org)');
  }

  if (!metrics.canonicalTag) {
    issues.push('Missing canonical tag');
  }

  if (!metrics.openGraph.title || !metrics.openGraph.description) {
    issues.push('Incomplete Open Graph tags');
  }

  return issues;
}

function generateRecommendations(metrics: SEOMetrics): string[] {
  const recommendations: string[] = [];

  if (metrics.h1Tags.length === 0) {
    recommendations.push('Add a descriptive H1 tag that includes your main keyword');
  }

  if (metrics.h2Tags.length === 0) {
    recommendations.push('Add H2 and H3 tags to structure your content hierarchically');
  }

  if (metrics.images.withoutAlt > 0) {
    recommendations.push('Add descriptive alt text to all images for better accessibility and SEO');
  }

  if (metrics.links.internal < 3) {
    recommendations.push('Add more internal links to improve site navigation and SEO');
  }

  if (!metrics.structuredData.hasSchema) {
    recommendations.push('Implement Schema.org structured data markup for rich snippets');
  }

  if (!metrics.openGraph.image) {
    recommendations.push('Add Open Graph image tag for better social media sharing');
  }

  if (metrics.metaKeywords.length === 0) {
    recommendations.push('Add relevant keywords to meta keywords tag');
  }

  recommendations.push('Ensure page loads quickly (target under 3 seconds)');
  recommendations.push('Use descriptive, keyword-rich URLs');
  recommendations.push('Create high-quality, original content');

  return recommendations;
}

export async function crawlMultiplePages(urls: string[]): Promise<SEOMetrics[]> {
  const results: SEOMetrics[] = [];
  
  for (const url of urls) {
    try {
      const metrics = await crawlPage(url);
      results.push(metrics);
    } catch (error) {
      console.error(`Error crawling ${url}:`, error);
    }
  }

  return results;
}
