import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function seedWarmChapters() {
  console.log('🔥 Seeding warm chapters...\n');

  const warmChapters = [
    {
      title: 'Shadow Realm Collection',
      subtitle: 'Dark & Mysterious',
      slug: 'shadow-realm-collection',
      image_url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=450&fit=crop',
      product_ids: ['1', '6', '7'],
      display_order: 1,
    },
    {
      title: 'Acid Wash Series',
      subtitle: 'Vintage Vibes',
      slug: 'acid-wash-series',
      image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=450&fit=crop',
      product_ids: ['2', '8'],
      display_order: 2,
    },
    {
      title: 'Wide Leg Essentials',
      subtitle: 'Comfort & Style',
      slug: 'wide-leg-essentials',
      image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&h=450&fit=crop',
      product_ids: ['3', '9'],
      display_order: 3,
    },
    {
      title: 'Urban Drift Collection',
      subtitle: 'Street Ready',
      slug: 'urban-drift-collection',
      image_url: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&h=450&fit=crop',
      product_ids: ['4', '10'],
      display_order: 4,
    },
    {
      title: 'Neon Pulse Edition',
      subtitle: 'Bold & Bright',
      slug: 'neon-pulse-edition',
      image_url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&h=450&fit=crop',
      product_ids: ['5', '11'],
      display_order: 5,
    },
    {
      title: 'Reaper X Collection',
      subtitle: 'Limited Edition',
      slug: 'reaper-x-collection',
      image_url: 'https://images.unsplash.com/photo-1578593139862-435adc1d20b8?w=800&h=450&fit=crop',
      product_ids: ['13'],
      display_order: 6,
    },
    {
      title: 'Denim Classics',
      subtitle: 'Timeless Style',
      slug: 'denim-classics',
      image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=450&fit=crop',
      product_ids: ['8'],
      display_order: 7,
    },
    {
      title: 'Hoodie Heaven',
      subtitle: 'Cozy Comfort',
      slug: 'hoodie-heaven',
      image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=450&fit=crop',
      product_ids: ['10'],
      display_order: 8,
    },
  ];

  for (const chapter of warmChapters) {
    try {
      await sql`
        INSERT INTO warm_chapters (
          title, subtitle, slug, image_url, product_ids, display_order, is_active
        ) VALUES (
          ${chapter.title}, 
          ${chapter.subtitle}, 
          ${chapter.slug}, 
          ${chapter.image_url}, 
          ${JSON.stringify(chapter.product_ids)}, 
          ${chapter.display_order}, 
          true
        )
        ON CONFLICT (slug) DO NOTHING
      `;
      console.log(`✅ Created: ${chapter.title}`);
    } catch (error: any) {
      console.error(`❌ Error creating ${chapter.title}:`, error.message);
    }
  }

  const count = await sql`SELECT COUNT(*) as count FROM warm_chapters`;
  console.log(`\n✅ Total warm chapters: ${count[0].count}`);
  console.log('\n🔥 Warm chapters seeding complete!');
}

seedWarmChapters().catch((error) => {
  console.error('❌ Error seeding warm chapters:', error);
  process.exit(1);
});
