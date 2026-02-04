import * as db from "./db";

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

  let productPages: Array<{ url: string; priority: string; changefreq: string }> = [];
  let blogPages: Array<{ url: string; priority: string; changefreq: string }> = [];

  try {
    const allProducts = await db.getAllProducts();
    productPages = allProducts.map((product: any) => ({
      url: `/products/${product.slug}`,
      priority: "0.8",
      changefreq: "weekly",
    }));

    const allPosts = await db.getAllBlogPosts();
    blogPages = allPosts.map((post: any) => ({
      url: `/blog/${post.slug}`,
      priority: "0.7",
      changefreq: "monthly",
    }));
  } catch (error) {
    console.error("Error fetching data for sitemap:", error);
  }

  const allPages = [...staticPages, ...productPages, ...blogPages];

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
