import { getAllProducts } from "./db";

/**
 * Generate dynamic sitemap.xml content
 * This should be called by a route handler to serve the sitemap
 */
export async function generateSitemap(baseUrl: string): Promise<string> {
  const staticPages = [
    { url: "/", priority: "1.0", changefreq: "weekly" },
    { url: "/products", priority: "0.9", changefreq: "daily" },
    { url: "/about", priority: "0.7", changefreq: "monthly" },
    { url: "/blog", priority: "0.8", changefreq: "weekly" },
    { url: "/contact", priority: "0.6", changefreq: "monthly" },
    { url: "/faq", priority: "0.7", changefreq: "monthly" },
    { url: "/privacy", priority: "0.5", changefreq: "yearly" },
    { url: "/terms", priority: "0.5", changefreq: "yearly" },
  ];

  // Get all products from database
  let productPages: Array<{ url: string; priority: string; changefreq: string }> = [];
  try {
    const allProducts = await getAllProducts();

    productPages = allProducts.map((product: any) => ({
      url: `/products/${product.slug}`,
      priority: "0.8",
      changefreq: "weekly",
    }));
  } catch (error) {
    console.error("Error fetching products for sitemap:", error);
  }

  // Combine all pages
  const allPages = [...staticPages, ...productPages];

  // Generate XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  allPages.forEach((page) => {
    xml += "  <url>\n";
    xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += "  </url>\n";
  });

  xml += "</urlset>";

  return xml;
}

/**
 * Generate sitemap index for large sites
 */
export function generateSitemapIndex(baseUrl: string): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  xml += "  <sitemap>\n";
  xml += `    <loc>${baseUrl}/sitemap.xml</loc>\n`;
  xml += "  </sitemap>\n";
  xml += "</sitemapindex>";

  return xml;
}
