import { getDb } from './server/db.ts';
import { products } from './drizzle/schema.ts';

async function seedProducts() {
  console.log('🌱 Adding products to database...');

  try {
    const db = await getDb();

    // Add Products with correct column names
    console.log('🛍️ Adding 6 products...');
    await db.insert(products).values([
      {
        name: 'Curly Hair Lotion',
        slug: 'curly-hair-lotion',
        description: 'Premium lotion for curly hair - provides moisture and definition',
        categoryId: 1,
        sku: 'CHL-001',
        price: 29.99,
        stockQuantity: 100,
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
        price: 24.99,
        stockQuantity: 75,
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
        price: 34.99,
        stockQuantity: 50,
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
        price: 19.99,
        stockQuantity: 120,
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
        price: 16.99,
        stockQuantity: 150,
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
        price: 22.99,
        stockQuantity: 80,
        isFeatured: false,
        isActive: true,
        images: JSON.stringify([
          'https://via.placeholder.com/400x400?text=Leave-In+Conditioner'
        ]),
      },
    ]);

    console.log('✅ Products added successfully!');
    console.log('📊 Summary:');
    console.log('   - 6 Products added');
    console.log('\n🚀 Your CurlyEllie store now has products!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedProducts();
