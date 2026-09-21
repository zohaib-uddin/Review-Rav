import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import {
  HeroBanner,
  WarmChapterSection,
  CollectionsInFocus,
  ProductGrid,
  JournalSection,
  ReviewsCarousel,
  FAQSection,
  // NewsletterSection,
} from '../components/home';

export default function Home() {
  const { products, reviews, fetchProducts, fetchCategories, fetchWarmChapters } = useStore();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchWarmChapters();
  }, []);

  return (
    <div>
      <HeroBanner />
      <WarmChapterSection />
      <CollectionsInFocus />
      
      <ProductGrid
        title="NEW ARRIVALS"
        subtitle="JUST DROPPED"
        filterFn={(p) => p.isNew}
        link="/shop?filter=new"
      />

      <ProductGrid
        title="BESTSELLERS"
        subtitle="TOP SELLERS"
        filterFn={(p) => p.isBestseller}
        link="/shop?filter=bestseller"
      />

      <ProductGrid
        title="FEATURED"
        subtitle="CURATED SELECTION"
        filterFn={(p) => p.isFeatured}
        link="/shop?filter=featured"
      />

      <JournalSection />
      <ReviewsCarousel reviews={reviews} />
      <FAQSection />
      {/* <NewsletterSection /> */}
    </div>
  );
}
