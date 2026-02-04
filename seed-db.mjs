import { getDb } from './server/db.ts';
import { 
  categories, 
  products, 
  siteSettings,
  pageSections
} from './drizzle/schema.ts';

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    const db = await getDb();

    // 1. Add Categories
    console.log('📁 Adding categories...');
    try {
      await db.insert(categories).values([
        {
          name: 'Hair Care',
          slug: 'hair-care',
          description: 'Premium hair care products',
          displayOrder: 1,
          isActive: true,
        },
        {
          name: 'Styling Products',
          slug: 'styling-products',
          description: 'Professional styling solutions',
          displayOrder: 2,
          isActive: true,
        },
        {
          name: 'Treatments',
          slug: 'treatments',
          description: 'Hair treatments and masks',
          displayOrder: 3,
          isActive: true,
        },
      ]);
      console.log('✅ Categories added');
    } catch (e) {
      console.log('⚠️ Categories already exist or error:', e.message);
    }

    // 2. Add Products
    console.log('🛍️ Adding products...');
    try {
      await db.insert(products).values([
        {
          name: 'Curly Hair Lotion',
          slug: 'curly-hair-lotion',
          description: 'Premium lotion for curly hair - provides moisture and definition',
          categoryId: 1,
          sku: 'CHL-001',
          basePrice: 29.99,
          stock: 100,
          isFeatured: true,
          isActive: true,
          images: JSON.stringify([
            'https://via.placeholder.com/400x400?text=Curly+Hair+Lotion'
          ]),
        },
        {
          name: 'Curl Defining Cream',
          slug: 'curl-defining-cream',
          description: 'Define and enhance your natural curls with our professional cream',
          categoryId: 1,
          sku: 'CDC-001',
          basePrice: 24.99,
          stock: 75,
          isFeatured: true,
          isActive: true,
          images: JSON.stringify([
            'https://via.placeholder.com/400x400?text=Curl+Defining+Cream'
          ]),
        },
        {
          name: 'Deep Conditioning Mask',
          slug: 'deep-conditioning-mask',
          description: 'Intensive treatment for dry and damaged curls',
          categoryId: 3,
          sku: 'DCM-001',
          basePrice: 34.99,
          stock: 50,
          isFeatured: true,
          isActive: true,
          images: JSON.stringify([
            'https://via.placeholder.com/400x400?text=Deep+Conditioning+Mask'
          ]),
        },
        {
          name: 'Anti-Frizz Serum',
          slug: 'anti-frizz-serum',
          description: 'Smooth and shine-enhancing serum for all curl types',
          categoryId: 2,
          sku: 'AFS-001',
          basePrice: 19.99,
          stock: 120,
          isFeatured: false,
          isActive: true,
          images: JSON.stringify([
            'https://via.placeholder.com/400x400?text=Anti-Frizz+Serum'
          ]),
        },
        {
          name: 'Curl Gel - Strong Hold',
          slug: 'curl-gel-strong-hold',
          description: 'Professional-grade gel for long-lasting curl definition',
          categoryId: 2,
          sku: 'CG-001',
          basePrice: 16.99,
          stock: 150,
          isFeatured: false,
          isActive: true,
          images: JSON.stringify([
            'https://via.placeholder.com/400x400?text=Curl+Gel'
          ]),
        },
        {
          name: 'Hydrating Leave-In Conditioner',
          slug: 'hydrating-leave-in-conditioner',
          description: 'Lightweight leave-in conditioner for daily hydration',
          categoryId: 1,
          sku: 'HLC-001',
          basePrice: 22.99,
          stock: 80,
          isFeatured: false,
          isActive: true,
          images: JSON.stringify([
            'https://via.placeholder.com/400x400?text=Leave-In+Conditioner'
          ]),
        },
      ]);
      console.log('✅ Products added');
    } catch (e) {
      console.log('⚠️ Products already exist or error:', e.message);
    }

    // 3. Add Site Settings
    console.log('⚙️ Adding site settings...');
    try {
      await db.insert(siteSettings).values({
        siteName: 'CurlyEllie',
        siteDescription: 'Premium Hair Care Products for Curly Hair',
        logo: 'https://via.placeholder.com/200x50?text=CurlyEllie',
        favicon: 'https://via.placeholder.com/32x32?text=CE',
        defaultCurrency: 'USD',
        whatsappNumber: '+1234567890',
        supportEmail: 'support@curlyellie.com',
        socialLinks: JSON.stringify({
          facebook: 'https://facebook.com/curlyellie',
          instagram: 'https://instagram.com/curlyellie',
          twitter: 'https://twitter.com/curlyellie',
          tiktok: 'https://tiktok.com/@curlyellie',
        }),
        currencyRates: JSON.stringify({
          USD: 1,
          EGP: 30.5,
          EUR: 0.92,
          GBP: 0.79,
          SAR: 3.75,
          AED: 3.67,
        }),
      });
      console.log('✅ Site Settings added');
    } catch (e) {
      console.log('⚠️ Site Settings already exist or error:', e.message);
    }

    // 4. Add Page Sections (Hero, Product Details, Carousel)
    console.log('📄 Adding page sections...');
    try {
      await db.insert(pageSections).values([
        {
          pageName: 'home',
          sectionKey: 'hero',
          title: 'Welcome to CurlyEllie',
          subtitle: 'Premium Hair Care for Beautiful Curls',
          content: JSON.stringify({
            heading: 'Discover Your Perfect Curl',
            description: 'Professional hair care products designed for curly hair',
            ctaText: 'Shop Now',
            ctaLink: '/products',
            backgroundImage: 'https://via.placeholder.com/1200x400?text=Hero+Banner',
          }),
          isActive: true,
          displayOrder: 1,
        },
        {
          pageName: 'home',
          sectionKey: 'product_details',
          title: 'Featured Products',
          subtitle: 'Our Best Sellers',
          content: JSON.stringify({
            description: 'Check out our most popular products loved by customers',
            showFeaturedOnly: true,
          }),
          isActive: true,
          displayOrder: 2,
        },
        {
          pageName: 'home',
          sectionKey: 'carousel',
          title: 'Product Carousel',
          subtitle: 'Browse Our Collection',
          content: JSON.stringify({
            autoplay: true,
            interval: 5000,
            showArrows: true,
            showDots: true,
          }),
          isActive: true,
          displayOrder: 3,
        },
        {
          pageName: 'home',
          sectionKey: 'video',
          title: 'How to Use',
          subtitle: 'Tutorial Videos',
          content: JSON.stringify({
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            description: 'Learn how to get the most out of our products',
          }),
          isActive: true,
          displayOrder: 4,
        },
      ]);
      console.log('✅ Page Sections added');
    } catch (e) {
      console.log('⚠️ Page Sections already exist or error:', e.message);
    }

    console.log('\n✅ Database seeding completed!');
    console.log('📊 Summary:');
    console.log('   - 3 Categories');
    console.log('   - 6 Products');
    console.log('   - Site Settings');
    console.log('   - 4 Page Sections');
    console.log('\n🚀 Your CurlyEllie store is now ready!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

seedDatabase();
