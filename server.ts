import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { neon } from '@neondatabase/serverless';

dotenv.config();

// In AI Studio sandbox with nginx, listen on port 3000. In Cloud Run production deployment, listen on PORT env var (e.g. 8080).
const PORT = process.env.NGINX_PORT
  ? 3000
  : (process.env.PORT ? parseInt(process.env.PORT, 10) : 3000);
const JWT_SECRET = process.env.JWT_SECRET || 'ravenza-super-secret-jwt-key-2024';
const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

// ==================== IN-MEMORY DATABASE STATE ====================

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
  description: string;
  badge?: string | null;
  tag?: string | null;
  cover_image_url?: string;
  sort_order: number;
  is_active: boolean;
  is_featured_in_focus: boolean;
  display_order_in_focus: number;
  is_warm_chapter?: boolean;
  display_order_warm_chapter?: number;
  created_at?: string;
  updated_at?: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  compare_at_price?: number | null;
  is_active: boolean;
  category_id?: string | null;
  subcategory_id?: string | null;
  brand: string;
  fabric?: string | null;
  fabric_composition?: string | null;
  fabric_finish?: string | null;
  fit?: string | null;
  graphic_print?: string | null;
  garment_specs?: string | null;
  garment_care?: string | null;
  shipping_delivery?: string | null;
  model_size?: string | null;
  sku: string;
  is_new_arrival: boolean;
  is_bestseller: boolean;
  is_featured: boolean;
  badge?: string | null;
  images: string[];
  attributes: {
    sizes: string[];
    colors: string[];
  };
  stock: number;
  is_in_stock: boolean;
  created_at?: string;
}

interface WarmChapter {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  image_url: string;
  product_ids: string[];
  display_order: number;
  is_active: boolean;
}

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  show_in_focus: boolean;
  show_explore_banner: boolean;
  explore_title?: string;
  show_on_home_chapter: boolean;
  chapter_title?: string;
  edition_name?: string;
  is_active: boolean;
  sort_order: number;
}

interface Review {
  id: string;
  user_id?: string;
  product_id: string;
  product_slug?: string;
  user_name: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
}

interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  shipping_address: any;
  items: any[];
  notes?: string;
  discount_code?: string | null;
  discount_amount?: number;
  tracking_number?: string | null;
  created_at: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  display_order: number;
  is_active: boolean;
}

interface JournalEntry {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  featured_image: string;
  category: string;
  author: string;
  published_date: string;
  display_order: number;
  is_active: boolean;
}

interface Coupon {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount?: number;
  is_active: boolean;
}

// Initial Categories Seed
const initialCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Co-Ord Sets',
    slug: 'co-ord-sets',
    description: 'Premium matching sets for effortless style',
    badge: 'TRENDING',
    tag: 'WINTER ESSENTIALS',
    cover_image_url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1000&fit=crop',
    sort_order: 1,
    is_active: true,
    is_featured_in_focus: true,
    display_order_in_focus: 1,
    is_warm_chapter: true,
    display_order_warm_chapter: 1,
  },
  {
    id: 'cat-2',
    name: 'Oversize Tees',
    slug: 'oversize-tees',
    description: 'Bold graphic tees with premium acid wash',
    badge: 'POPULAR',
    tag: 'STREETWEAR',
    cover_image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop',
    sort_order: 2,
    is_active: true,
    is_featured_in_focus: true,
    display_order_in_focus: 2,
    is_warm_chapter: true,
    display_order_warm_chapter: 2,
  },
  {
    id: 'cat-3',
    name: 'Graphic Trousers',
    slug: 'graphic-trousers',
    description: 'Wide leg trousers with signature prints',
    badge: null,
    tag: 'NEW DROP',
    cover_image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&h=1000&fit=crop',
    sort_order: 3,
    is_active: true,
    is_featured_in_focus: true,
    display_order_in_focus: 3,
    is_warm_chapter: true,
    display_order_warm_chapter: 3,
  },
  {
    id: 'cat-4',
    name: 'Trackpants',
    slug: 'trackpants',
    description: 'Comfortable trackpants for everyday wear',
    badge: null,
    tag: 'ESSENTIALS',
    cover_image_url: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&h=1000&fit=crop',
    sort_order: 4,
    is_active: true,
    is_featured_in_focus: true,
    display_order_in_focus: 4,
    is_warm_chapter: true,
    display_order_warm_chapter: 4,
  },
  {
    id: 'cat-5',
    name: 'Graphic Shorts',
    slug: 'graphic-shorts',
    description: 'Statement shorts with unique graphics',
    badge: 'NEW',
    tag: 'SUMMER',
    cover_image_url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&h=1000&fit=crop',
    sort_order: 5,
    is_active: true,
    is_featured_in_focus: false,
    display_order_in_focus: 5,
    is_warm_chapter: true,
    display_order_warm_chapter: 5,
  },
  {
    id: 'cat-6',
    name: 'Shirts & Jackets',
    slug: 'shirts-jackets',
    description: 'Premium outerwear and shirts',
    badge: null,
    tag: 'LAYERING',
    cover_image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop',
    sort_order: 6,
    is_active: true,
    is_featured_in_focus: false,
    display_order_in_focus: 6,
    is_warm_chapter: true,
    display_order_warm_chapter: 6,
  },
];

// Initial Products Seed
const initialProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Shadow Realm Co-Ord Set',
    slug: 'shadow-realm-co-ord-set',
    description: 'Premium cotton co-ord set featuring shadow realm graphic print. Oversized fit for maximum comfort and street-ready aesthetics.',
    base_price: 4500,
    compare_at_price: 3990,
    category_id: 'cat-1',
    brand: 'RAVENZA',
    fabric: '100% Cotton',
    fabric_composition: '100% Premium Cotton',
    fabric_finish: 'Matte Finish',
    fit: 'Oversized',
    graphic_print: 'Shadow Realm Screen Print',
    garment_specs: '260 GSM',
    garment_care: 'Machine wash cold, tumble dry low',
    shipping_delivery: '3-5 business days across Pakistan',
    model_size: 'Model wears size L',
    sku: 'RVZ-CO-001',
    is_new_arrival: true,
    is_bestseller: true,
    is_featured: true,
    badge: 'NEW',
    images: [
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=1000&fit=crop',
    ],
    attributes: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Charcoal'] },
    stock: 45,
    is_in_stock: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    name: 'Midnight Vortex Co-Ord',
    slug: 'midnight-vortex-co-ord',
    description: 'Premium midnight vortex graphic co-ord set with puff print details. Effortless coordination with refined silhouettes.',
    base_price: 4800,
    compare_at_price: 4290,
    category_id: 'cat-1',
    brand: 'RAVENZA',
    fabric: 'Cotton Blend',
    fabric_composition: '80% Cotton, 20% Polyester',
    fabric_finish: 'Soft Touch',
    fit: 'Relaxed',
    graphic_print: 'Vortex Puff Print',
    garment_specs: '280 GSM',
    garment_care: 'Hand wash recommended',
    shipping_delivery: '3-5 business days',
    model_size: 'Model wears size M',
    sku: 'RVZ-CO-002',
    is_new_arrival: true,
    is_bestseller: false,
    is_featured: true,
    badge: 'LIMITED',
    images: [
      'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1000&fit=crop',
    ],
    attributes: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Dark Navy'] },
    stock: 30,
    is_in_stock: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-3',
    name: 'Reaper X Graphic Co-Ord',
    slug: 'reaper-x-graphic-co-ord',
    description: 'Bold reaper graphics on premium cotton. The ultimate streetwear statement piece with limited edition design.',
    base_price: 4800,
    compare_at_price: 4290,
    category_id: 'cat-1',
    brand: 'RAVENZA',
    fabric: 'Premium Cotton',
    fabric_composition: '100% Premium Cotton',
    fabric_finish: 'Matte',
    fit: 'Oversized',
    graphic_print: 'Reaper X All-Over',
    garment_specs: '260 GSM',
    garment_care: 'Machine wash cold',
    shipping_delivery: '3-5 business days',
    model_size: 'Model wears size L',
    sku: 'RVZ-CO-003',
    is_new_arrival: true,
    is_bestseller: true,
    is_featured: true,
    badge: 'HOT',
    images: [
      'https://images.unsplash.com/photo-1578593139862-435adc1d20b8?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=1000&fit=crop',
    ],
    attributes: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Dark Grey'] },
    stock: 50,
    is_in_stock: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-4',
    name: 'Acid Wash Phantom Tee',
    slug: 'acid-wash-phantom-tee',
    description: 'Authentic acid wash oversized tee with phantom graphic. Premium softness and vintage character that stands out.',
    base_price: 2800,
    compare_at_price: 2499,
    category_id: 'cat-2',
    brand: 'RAVENZA',
    fabric: 'Acid Wash Cotton',
    fabric_composition: '100% Acid Wash Cotton',
    fabric_finish: 'Acid Washed',
    fit: 'Oversized',
    graphic_print: 'Phantom Back Print',
    garment_specs: '240 GSM',
    garment_care: 'Wash separately, cold water',
    shipping_delivery: '3-5 business days',
    model_size: 'Model wears size M',
    sku: 'RVZ-TS-001',
    is_new_arrival: true,
    is_bestseller: true,
    is_featured: true,
    badge: 'BESTSELLER',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=1000&fit=crop',
    ],
    attributes: { sizes: ['S', 'M', 'L', 'XL', '2XL'], colors: ['Smoky Black', 'Faded Teal', 'Dusty Mocha'] },
    stock: 75,
    is_in_stock: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-5',
    name: 'Classic Pullover Hoodie',
    slug: 'classic-pullover-hoodie',
    description: 'Classic pullover hoodie in premium fleece. Warm, comfortable, and timeless for everyday wear.',
    base_price: 2500,
    compare_at_price: 2240,
    category_id: 'cat-2',
    brand: 'RAVENZA',
    fabric: 'Cotton Fleece',
    fabric_composition: '100% Cotton Fleece',
    fabric_finish: 'Brushed Interior',
    fit: 'Regular',
    graphic_print: 'Chest Embroidery',
    garment_specs: '350 GSM',
    garment_care: 'Machine wash cold',
    shipping_delivery: '3-5 business days',
    model_size: 'Model wears size L',
    sku: 'RVZ-HD-001',
    is_new_arrival: false,
    is_bestseller: false,
    is_featured: true,
    badge: null,
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=800&h=1000&fit=crop',
    ],
    attributes: { sizes: ['S', 'M', 'L', 'XL', '2XL'], colors: ['Black', 'Grey', 'Navy'] },
    stock: 40,
    is_in_stock: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-6',
    name: 'Wide Leg Graphic Trouser',
    slug: 'wide-leg-graphic-trouser',
    description: 'Premium wide leg trouser with signature graphic print. Relaxed fit for effortless streetwear style.',
    base_price: 3200,
    compare_at_price: 2890,
    category_id: 'cat-3',
    brand: 'RAVENZA',
    fabric: 'Premium Twill',
    fabric_composition: '100% Premium Twill Cotton',
    fabric_finish: 'Matte Twill',
    fit: 'Wide Leg',
    graphic_print: 'All-Over Graphic',
    garment_specs: '280 GSM',
    garment_care: 'Machine wash cold',
    shipping_delivery: '3-5 business days',
    model_size: 'Model wears size M',
    sku: 'RVZ-TR-001',
    is_new_arrival: false,
    is_bestseller: true,
    is_featured: true,
    badge: null,
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&h=1000&fit=crop',
    ],
    attributes: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Navy'] },
    stock: 35,
    is_in_stock: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-7',
    name: 'Urban Drift Trackpants',
    slug: 'urban-drift-trackpants',
    description: 'Premium fabric trackpants with relaxed wide-leg fit. Contemporary streetwear style with ultimate comfort.',
    base_price: 2900,
    compare_at_price: 2599,
    category_id: 'cat-4',
    brand: 'RAVENZA',
    fabric: 'French Terry',
    fabric_composition: '100% French Terry Cotton',
    fabric_finish: 'Brushed Interior',
    fit: 'Relaxed',
    graphic_print: 'Contrast Side Stripe',
    garment_specs: '320 GSM',
    garment_care: 'Machine wash cold',
    shipping_delivery: '3-5 business days',
    model_size: 'Model wears size L',
    sku: 'RVZ-TP-001',
    is_new_arrival: false,
    is_bestseller: false,
    is_featured: true,
    badge: null,
    images: [
      'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&h=1000&fit=crop',
    ],
    attributes: { sizes: ['S', 'M', 'L', 'XL', '2XL'], colors: ['Black', 'Grey', 'Navy'] },
    stock: 60,
    is_in_stock: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-8',
    name: 'Neon Pulse Graphic Shorts',
    slug: 'neon-pulse-graphic-shorts',
    description: 'Breathable graphic shorts with signature neon pulse design. Perfect for warmer days with bold aesthetics.',
    base_price: 2200,
    compare_at_price: 1990,
    category_id: 'cat-5',
    brand: 'RAVENZA',
    fabric: 'Polyester Blend',
    fabric_composition: '100% Polyester Mesh Blend',
    fabric_finish: 'Smooth',
    fit: 'Regular',
    graphic_print: 'Neon Pulse All-Over',
    garment_specs: '150 GSM',
    garment_care: 'Machine wash cold',
    shipping_delivery: '3-5 business days',
    model_size: 'Model wears size M',
    sku: 'RVZ-SH-001',
    is_new_arrival: true,
    is_bestseller: false,
    is_featured: false,
    badge: 'NEW',
    images: [
      'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1562157873-818bc0726f38?w=800&h=1000&fit=crop',
    ],
    attributes: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'White'] },
    stock: 25,
    is_in_stock: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-9',
    name: 'Denim Jacket - Raven Black',
    slug: 'denim-jacket-raven-black',
    description: 'Premium denim jacket with classic fit. Perfect layering piece for any season with timeless appeal.',
    base_price: 3990,
    compare_at_price: null,
    category_id: 'cat-6',
    brand: 'RAVENZA',
    fabric: 'Cotton Denim',
    fabric_composition: '100% Cotton Denim',
    fabric_finish: 'Raw Denim',
    fit: 'Classic',
    graphic_print: 'Embroidered Logo',
    garment_specs: '14oz Denim',
    garment_care: 'Wash inside out',
    shipping_delivery: '3-5 business days',
    model_size: 'Model wears size L',
    sku: 'RVZ-JK-001',
    is_new_arrival: false,
    is_bestseller: false,
    is_featured: true,
    badge: null,
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=800&h=1000&fit=crop',
    ],
    attributes: { sizes: ['S', 'M', 'L', 'XL', '2XL'], colors: ['Black', 'Brown', 'Light Blue'] },
    stock: 30,
    is_in_stock: true,
    created_at: new Date().toISOString(),
  },
];

// Initial Warm Chapters Seed
const initialWarmChapters: WarmChapter[] = [
  {
    id: 'wc-1',
    title: 'Shadow Realm Collection',
    subtitle: 'Dark & Mysterious',
    slug: 'shadow-realm-collection',
    image_url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=450&fit=crop',
    product_ids: ['prod-1', 'prod-6', 'prod-7'],
    display_order: 1,
    is_active: true,
  },
  {
    id: 'wc-2',
    title: 'Acid Wash Series',
    subtitle: 'Vintage Vibes',
    slug: 'acid-wash-series',
    image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=450&fit=crop',
    product_ids: ['prod-2', 'prod-4'],
    display_order: 2,
    is_active: true,
  },
  {
    id: 'wc-3',
    title: 'Wide Leg Essentials',
    subtitle: 'Comfort & Style',
    slug: 'wide-leg-essentials',
    image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&h=450&fit=crop',
    product_ids: ['prod-3', 'prod-6'],
    display_order: 3,
    is_active: true,
  },
  {
    id: 'wc-4',
    title: 'Urban Drift Collection',
    subtitle: 'Street Ready',
    slug: 'urban-drift-collection',
    image_url: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&h=450&fit=crop',
    product_ids: ['prod-4', 'prod-7'],
    display_order: 4,
    is_active: true,
  },
  {
    id: 'wc-5',
    title: 'Neon Pulse Edition',
    subtitle: 'Bold & Bright',
    slug: 'neon-pulse-edition',
    image_url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&h=450&fit=crop',
    product_ids: ['prod-5', 'prod-8'],
    display_order: 5,
    is_active: true,
  },
  {
    id: 'wc-6',
    title: 'Reaper X Collection',
    subtitle: 'Limited Edition',
    slug: 'reaper-x-collection',
    image_url: 'https://images.unsplash.com/photo-1578593139862-435adc1d20b8?w=800&h=450&fit=crop',
    product_ids: ['prod-3'],
    display_order: 6,
    is_active: true,
  },
  {
    id: 'wc-7',
    title: 'Denim Classics',
    subtitle: 'Timeless Style',
    slug: 'denim-classics',
    image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=450&fit=crop',
    product_ids: ['prod-9'],
    display_order: 7,
    is_active: true,
  },
  {
    id: 'wc-8',
    title: 'Hoodie Heaven',
    subtitle: 'Cozy Comfort',
    slug: 'hoodie-heaven',
    image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=450&fit=crop',
    product_ids: ['prod-5'],
    display_order: 8,
    is_active: true,
  },
];

// Initial Collections Seed
const initialCollections: Collection[] = [
  {
    id: 'col-1',
    name: 'Winter Essentials',
    slug: 'winter-essentials',
    description: 'Premium winter collection featuring co-ord sets and layering pieces',
    show_in_focus: true,
    show_explore_banner: true,
    explore_title: 'Explore Winter Collection',
    show_on_home_chapter: true,
    chapter_title: 'WARM CHAPTER I',
    edition_name: 'MAIN EDITION',
    is_active: true,
    sort_order: 1,
  },
  {
    id: 'col-2',
    name: 'Streetwear Classics',
    slug: 'streetwear-classics',
    description: 'Timeless streetwear pieces that define the culture',
    show_in_focus: true,
    show_explore_banner: false,
    show_on_home_chapter: false,
    is_active: true,
    sort_order: 2,
  },
  {
    id: 'col-3',
    name: 'New Arrivals',
    slug: 'new-arrivals',
    description: 'Latest drops and fresh styles',
    show_in_focus: false,
    show_explore_banner: true,
    explore_title: 'Shop New Arrivals',
    show_on_home_chapter: false,
    is_active: true,
    sort_order: 3,
  },
];

// Initial Reviews Seed
const initialReviews: Review[] = [
  {
    id: 'rev-1',
    product_id: 'prod-1',
    product_slug: 'shadow-realm-co-ord-set',
    user_name: 'Ahmed Khan',
    rating: 5,
    comment: 'Amazing quality! The fabric is so soft and the fit is perfect. Best co-ord set I own.',
    is_approved: true,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'rev-2',
    product_id: 'prod-4',
    product_slug: 'acid-wash-phantom-tee',
    user_name: 'Sara Ali',
    rating: 5,
    comment: 'Love the acid wash effect. Looks exactly like the photos. Will order more!',
    is_approved: true,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'rev-3',
    product_id: 'prod-6',
    product_slug: 'wide-leg-graphic-trouser',
    user_name: 'Bilal Hassan',
    rating: 5,
    comment: 'Best wide leg trousers I have ever owned. Premium quality and amazing graphics.',
    is_approved: true,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'rev-4',
    product_id: 'prod-3',
    product_slug: 'reaper-x-graphic-co-ord',
    user_name: 'Fatima Zahra',
    rating: 5,
    comment: 'The reaper graphic is insane! Got so many compliments. Ravenza never disappoints.',
    is_approved: true,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'rev-5',
    product_id: 'prod-5',
    product_slug: 'classic-pullover-hoodie',
    user_name: 'Hamza Sheikh',
    rating: 4,
    comment: 'Very comfortable hoodie. Warm and perfect for winter. Size runs a bit large.',
    is_approved: true,
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: 'rev-6',
    product_id: 'prod-9',
    product_slug: 'denim-jacket-raven-black',
    user_name: 'Usman Malik',
    rating: 5,
    comment: 'Beautiful denim jacket. Fits perfectly and the quality is amazing. Worth every rupee.',
    is_approved: true,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
];

// Initial Orders Seed
const initialOrders: Order[] = [
  {
    id: 'ord-1',
    order_number: 'RVZ-000001',
    status: 'delivered',
    subtotal: 8490,
    shipping_cost: 0,
    total: 8490,
    shipping_address: { firstName: 'Ahmed', lastName: 'Khan', phone: '+923001234567', address: '123 Main Boulevard', city: 'Lahore', postalCode: '54000' },
    items: [
      { product_id: 'prod-1', product_name: 'Shadow Realm Co-Ord Set', quantity: 1, unit_price: 4500, size: 'L', color: 'Black' },
      { product_id: 'prod-9', product_name: 'Denim Jacket - Raven Black', quantity: 1, unit_price: 3990, size: 'L', color: 'Black' },
    ],
    notes: 'Please deliver in the evening',
    tracking_number: 'TRK123456789',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 'ord-2',
    order_number: 'RVZ-000002',
    status: 'shipped',
    subtotal: 5290,
    shipping_cost: 200,
    total: 5490,
    shipping_address: { firstName: 'Sara', lastName: 'Ali', phone: '+923002345678', address: '456 Garden Town', city: 'Karachi', postalCode: '74000' },
    items: [
      { product_id: 'prod-2', product_name: 'Midnight Vortex Co-Ord', quantity: 1, unit_price: 4800, size: 'M', color: 'Black' },
    ],
    discount_code: 'WELCOME10',
    discount_amount: 529,
    tracking_number: 'TRK987654321',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'ord-3',
    order_number: 'RVZ-000003',
    status: 'processing',
    subtotal: 3200,
    shipping_cost: 200,
    total: 3400,
    shipping_address: { firstName: 'Bilal', lastName: 'Hassan', phone: '+923003456789', address: '789 DHA Phase 5', city: 'Islamabad', postalCode: '44000' },
    items: [
      { product_id: 'prod-6', product_name: 'Wide Leg Graphic Trouser', quantity: 1, unit_price: 3200, size: 'M', color: 'Black' },
    ],
    notes: 'Gift wrap please',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'ord-4',
    order_number: 'RVZ-000004',
    status: 'confirmed',
    subtotal: 4800,
    shipping_cost: 0,
    total: 4800,
    shipping_address: { firstName: 'Fatima', lastName: 'Zahra', phone: '+923004567890', address: '321 Model Town', city: 'Lahore', postalCode: '54700' },
    items: [
      { product_id: 'prod-3', product_name: 'Reaper X Graphic Co-Ord', quantity: 1, unit_price: 4800, size: 'L', color: 'Black' },
    ],
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

// Initial FAQs
const initialFaqs: FAQ[] = [
  {
    id: 'faq-1',
    question: 'What is your return policy?',
    answer: 'We offer a 7-day easy return policy. Items must be unworn, unwashed, with original tags attached. Contact our support team to initiate a return.',
    category: 'Shipping & Returns',
    display_order: 1,
    is_active: true,
  },
  {
    id: 'faq-2',
    question: 'How long does delivery take?',
    answer: 'Standard delivery takes 3-5 business days for major cities and 5-7 days for other areas across Pakistan. Express delivery is available for select locations.',
    category: 'Shipping & Returns',
    display_order: 2,
    is_active: true,
  },
  {
    id: 'faq-3',
    question: 'Do you offer cash on delivery?',
    answer: 'Yes! Cash on Delivery (COD) is available nationwide across Pakistan with transparent order tracking.',
    category: 'Payment',
    display_order: 3,
    is_active: true,
  },
  {
    id: 'faq-4',
    question: 'What sizes do you offer?',
    answer: 'We offer sizes from S to 2XL depending on the product. Check the interactive size guide on each product page for detailed chest and length measurements.',
    category: 'Sizing',
    display_order: 4,
    is_active: true,
  },
  {
    id: 'faq-5',
    question: 'Are your products unisex?',
    answer: 'Most of our streetwear products are designed with relaxed, modern unisex fits. Check each product description for exact silhouette styling.',
    category: 'Sizing',
    display_order: 5,
    is_active: true,
  },
  {
    id: 'faq-6',
    question: 'How do I track my order?',
    answer: 'Once your order is shipped, you will receive a tracking number via email and SMS. You can also enter your order number on our Track Order page at any time.',
    category: 'Shipping & Returns',
    display_order: 6,
    is_active: true,
  },
];

// Initial Journal Entries
const initialJournal: JournalEntry[] = [
  {
    id: 'j-1',
    title: 'The Birth of Ravenza',
    subtitle: 'Our journey from concept to reality',
    content: 'Ravenza was born from a simple vision: to create streetwear that speaks to the bold, the creative, and the unapologetically authentic. What started as a passion project in a small studio has grown into a movement that resonates with thousands across Pakistan.',
    featured_image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop',
    category: 'Brand Story',
    author: 'Ravenza Team',
    published_date: '2024-01-15',
    display_order: 1,
    is_active: true,
  },
  {
    id: 'j-2',
    title: 'Behind the Design: Shadow Realm',
    subtitle: 'The inspiration behind our best-selling collection',
    content: 'The Shadow Realm collection draws inspiration from urban mythology and the duality of modern life. Each piece is carefully crafted to represent the balance between light and shadow, comfort and edge.',
    featured_image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1200&h=800&fit=crop',
    category: 'Design',
    author: 'Creative Director',
    published_date: '2024-02-01',
    display_order: 2,
    is_active: true,
  },
  {
    id: 'j-3',
    title: 'Sustainability in Streetwear',
    subtitle: 'Our commitment to responsible fashion',
    content: 'At Ravenza, we believe that great fashion shouldn’t come at the cost of our planet. We are committed to using durable high-GSM cotton and reducing environmental waste in our production pipeline.',
    featured_image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&h=800&fit=crop',
    category: 'Sustainability',
    author: 'Ravenza Team',
    published_date: '2024-03-01',
    display_order: 3,
    is_active: true,
  },
];

// Initial Coupons
const initialCoupons: Coupon[] = [
  { code: 'WELCOME10', discount_type: 'percentage', discount_value: 10, min_order_amount: 2000, is_active: true },
  { code: 'RAVENZA20', discount_type: 'percentage', discount_value: 20, min_order_amount: 3500, is_active: true },
  { code: 'FLAT500', discount_type: 'fixed', discount_value: 500, min_order_amount: 3000, is_active: true },
  { code: 'SUMMER25', discount_type: 'percentage', discount_value: 25, min_order_amount: 5000, is_active: true },
  { code: 'NEWYEAR30', discount_type: 'percentage', discount_value: 30, min_order_amount: 4000, is_active: true },
];

// In-Memory Storage Instances
let categoriesStore = [...initialCategories];
let productsStore = initialProducts.map((p) => ({ ...p, is_active: p.is_active !== false }));
let warmChaptersStore = [...initialWarmChapters];
let collectionsStore = [...initialCollections];
let reviewsStore = [...initialReviews];
let ordersStore = [...initialOrders];
let faqsStore = [...initialFaqs];
let journalStore = [...initialJournal];
let couponsStore = [...initialCoupons];
let newsletterStore: { email: string; date: string }[] = [
  { email: 'ahmed.khan@gmail.com', date: '2024-01-20' },
  { email: 'sara.ali@gmail.com', date: '2024-02-14' },
];
let wishlistStore: { user_id: string; product_id: string }[] = [];
let otpStore: { [email: string]: { otp: string; expiresAt: number } } = {};

let auditLogsStore: {
  id: string;
  action: string;
  entity: string;
  user: string;
  details?: string;
  created_at: string;
}[] = [
  { id: 'log-1', action: 'Product Updated', entity: 'Shadow Realm Co-Ord Set', user: 'Admin', details: 'Price updated', created_at: new Date(Date.now() - 120000).toISOString() },
  { id: 'log-2', action: 'Order Status Changed', entity: 'ORD-001 → Shipped', user: 'Admin', details: 'Status set to shipped', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'log-3', action: 'New Customer Registered', entity: 'ahmed.khan@gmail.com', user: 'System', details: 'Email OTP verified', created_at: new Date(Date.now() - 10800000).toISOString() },
  { id: 'log-4', action: 'Product Created', entity: 'Acid Wash Phantom Tee', user: 'Admin', details: 'Initial variants matrix added', created_at: new Date(Date.now() - 86400000).toISOString() },
];

let adminNotificationsStore: {
  id: string;
  title: string;
  message: string;
  type: 'stock' | 'order' | 'system';
  is_read: boolean;
  created_at: string;
  link?: string;
}[] = [
  { id: 'notif-1', title: 'Low Stock Alert', message: 'Acid Wash Phantom Tee has only 8 items left (threshold: 5-10)', type: 'stock', is_read: false, created_at: new Date(Date.now() - 1800000).toISOString(), link: 'inventory' },
  { id: 'notif-2', title: 'New Order Received', message: 'Order ORD-1001 placed for Rs. 4,990', type: 'order', is_read: false, created_at: new Date(Date.now() - 7200000).toISOString(), link: 'orders' },
];

function logAdminAudit(action: string, entity: string, user: string = 'Admin', details?: string) {
  const newLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    action,
    entity,
    user,
    details,
    created_at: new Date().toISOString()
  };
  auditLogsStore.unshift(newLog);
  if (auditLogsStore.length > 200) auditLogsStore.pop();
}

const usersStore: any[] = [
  {
    id: 'user-admin',
    name: 'Admin',
    email: 'admin@ravenza.pk',
    password: 'admin123',
    role: 'admin',
    is_verified: true,
    is_active: true,
  },
  {
    id: 'user-customer',
    name: 'Ahmed Khan',
    email: 'ahmed.khan@gmail.com',
    password: 'customer123',
    role: 'customer',
    is_verified: true,
    is_active: true,
  },
];

// Transformation helper for frontend product representation
function formatProduct(p: any, catMap: Map<string, any>) {
  const category = p.category_id ? catMap.get(p.category_id) : null;
  const basePrice = Number(p.base_price || p.price) || 0;
  const comparePrice = p.compare_at_price ? Number(p.compare_at_price) : null;
  const images = Array.isArray(p.images)
    ? p.images
    : (typeof p.images === 'string'
      ? (() => { try { return JSON.parse(p.images); } catch { return [p.images]; } })()
      : [p.image_url || p.image || 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1000&fit=crop']);
  const firstImage = images.length > 0 ? images[0] : (p.image_url || p.image || '');

  const isBestseller = Boolean(p.is_best_seller ?? p.is_bestseller ?? p.isBestseller ?? false);
  const isNew = Boolean(p.is_new_arrival ?? p.isNew ?? false);
  const isFeatured = Boolean(p.is_featured ?? p.isFeatured ?? false);

  return {
    ...p,
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: basePrice,
    salePrice: comparePrice ? basePrice : undefined,
    comparePrice: comparePrice || undefined,
    actual_price: basePrice,
    image: firstImage,
    images: images,
    category_slug: category?.slug || p.category_slug || p.category || 'uncategorized',
    category_name: category?.name || p.category_name || 'Uncategorized',
    category: category?.slug || p.category_slug || p.category || 'uncategorized',
    sizes: p.attributes?.sizes || ['S', 'M', 'L', 'XL'],
    colors: p.attributes?.colors || ['Black'],
    stockCount: p.stock ?? 50,
    inStock: p.is_in_stock ?? true,
    isNew: isNew,
    is_new_arrival: isNew,
    isFeatured: isFeatured,
    is_featured: isFeatured,
    isBestseller: isBestseller,
    is_best_seller: isBestseller,
    is_bestseller: isBestseller,
    badge: p.badge || (isBestseller ? 'BESTSELLER' : isNew ? 'NEW' : isFeatured ? 'FEATURED' : null),
    details: [
      p.fabric_composition,
      p.fit ? `Fit: ${p.fit}` : null,
      p.garment_care ? `Care: ${p.garment_care}` : null,
      'Made in Pakistan',
    ].filter(Boolean),
    material: p.fabric_composition || p.fabric || 'Premium Cotton',
  };
}

async function startServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Optional authentication token decoder
  const optionalAuth = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
      } catch (e) {
        // invalid token, ignore
      }
    }
    next();
  };

  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ message: 'Forbidden token' });
      req.user = user;
      next();
    });
  };

  const adminOnly = (req: any, res: any, next: any) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  };

  // ==================== HEALTH ====================
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      message: 'Ravenza server is running smoothly',
      database: 'connected (in-memory persistent store)',
      timestamp: new Date().toISOString(),
    });
  });

  // ==================== AUTH ROUTES ====================
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const cleanEmail = (email || '').trim().toLowerCase();

      let user: any = null;
      if (sql) {
        try {
          const dbUsers = await sql`SELECT * FROM users WHERE LOWER(email) = ${cleanEmail} AND is_active = true LIMIT 1`;
          if (dbUsers && dbUsers.length > 0) {
            user = dbUsers[0];
          }
        } catch (dbErr) {
          console.error('Error querying Neon user:', dbErr);
        }
      }

      if (!user) {
        user = usersStore.find((u) => u.email.toLowerCase() === cleanEmail && u.is_active);
      }

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isMatch = user.password === password || (await bcryptjs.compare(password, user.password).catch(() => false));
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          is_verified: user.is_verified,
        },
        token,
      });
    } catch (err: any) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, name, password, phone } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
      }
      const cleanEmail = email.trim().toLowerCase();

      let existing = false;
      if (sql) {
        try {
          const dbUsers = await sql`SELECT id FROM users WHERE LOWER(email) = ${cleanEmail} LIMIT 1`;
          if (dbUsers && dbUsers.length > 0) existing = true;
        } catch (e) {
          console.error('Error checking user email in Neon:', e);
        }
      }
      if (!existing && usersStore.find((u) => u.email.toLowerCase() === cleanEmail)) {
        existing = true;
      }

      if (existing) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      let newUserId = `user-${Date.now()}`;
      if (sql) {
        try {
          const inserted = await sql`
            INSERT INTO users (email, name, phone, password, role, is_verified, is_active)
            VALUES (${cleanEmail}, ${name || cleanEmail.split('@')[0]}, ${phone || ''}, ${password}, 'customer', true, true)
            RETURNING id
          `;
          if (inserted && inserted.length > 0) {
            newUserId = inserted[0].id;
          }
        } catch (e) {
          console.error('Error inserting user in Neon:', e);
        }
      }

      const newUser = {
        id: newUserId,
        email: cleanEmail,
        name: name || cleanEmail.split('@')[0],
        phone: phone || '',
        password,
        role: 'customer',
        is_verified: true,
        is_active: true,
      };
      usersStore.push(newUser);

      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          is_verified: newUser.is_verified,
        },
        token,
      });
    } catch (err: any) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

  // ==================== PRODUCTS ROUTES ====================
  app.get('/api/products', async (req, res) => {
    try {
      const { category, search, sort } = req.query as any;

      if (sql) {
        try {
          let queryStr = `
            SELECT p.*, c.name as category_name, c.slug as category_slug
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.is_active = true
          `;
          const rows = await sql`
            SELECT p.*, c.name as category_name, c.slug as category_slug
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.is_active = true
            ORDER BY p.created_at DESC
          `;

          if (rows && rows.length > 0) {
            let result = rows.map((r: any) => formatProduct(r, new Map()));

            if (category && category !== 'all') {
              result = result.filter(
                (p: any) =>
                  p.category === category ||
                  p.category_slug === category ||
                  p.category_id === category ||
                  p.category?.toLowerCase() === category.toLowerCase()
              );
            }

            if (search) {
              const q = String(search).toLowerCase();
              result = result.filter(
                (p: any) =>
                  p.name.toLowerCase().includes(q) ||
                  (p.description && p.description.toLowerCase().includes(q))
              );
            }

            if (sort === 'price-low') {
              result.sort((a: any, b: any) => a.price - b.price);
            } else if (sort === 'price-high') {
              result.sort((a: any, b: any) => b.price - a.price);
            } else if (sort === 'newest') {
              result.sort((a: any, b: any) => (b.is_new_arrival ? 1 : 0) - (a.is_new_arrival ? 1 : 0));
            }

            return res.json(result);
          }
        } catch (dbErr) {
          console.error('Neon DB products fetch error, falling back to memory store:', dbErr);
        }
      }

      const catMap = new Map(categoriesStore.map((c) => [c.id, c]));
      let result = productsStore.filter((p) => p.is_active !== false);

      if (category && category !== 'all') {
        const matchingCat = categoriesStore.find((c) => c.slug === category);
        if (matchingCat) {
          result = result.filter((p) => p.category_id === matchingCat.id);
        }
      }

      if (search) {
        const q = String(search).toLowerCase();
        result = result.filter(
          (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
        );
      }

      if (sort === 'price-low') {
        result.sort((a, b) => a.base_price - b.base_price);
      } else if (sort === 'price-high') {
        result.sort((a, b) => b.base_price - a.base_price);
      } else if (sort === 'newest') {
        result.sort((a, b) => (b.is_new_arrival ? 1 : 0) - (a.is_new_arrival ? 1 : 0));
      }

      const formatted = result.map((p) => formatProduct(p, catMap));
      res.json(formatted);
    } catch (err: any) {
      res.status(500).json({ message: 'Error fetching products', error: err.message });
    }
  });

  app.get('/api/products/:slug', async (req, res) => {
    try {
      const { slug } = req.params;

      if (sql) {
        try {
          const rows = await sql`
            SELECT p.*, c.name as category_name, c.slug as category_slug
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE (p.slug = ${slug} OR p.id::text = ${slug}) AND p.is_active = true
            LIMIT 1
          `;
          if (rows && rows.length > 0) {
            return res.json(formatProduct(rows[0], new Map()));
          }
        } catch (e) {
          console.error('Neon single product error:', e);
        }
      }

      const catMap = new Map(categoriesStore.map((c) => [c.id, c]));
      const product = productsStore.find((p) => p.slug === slug || p.id === slug);

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.json(formatProduct(product, catMap));
    } catch (err: any) {
      res.status(500).json({ message: 'Error fetching product', error: err.message });
    }
  });

  app.post('/api/products/by-ids', async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.json([]);
      }

      if (sql) {
        try {
          const rows = await sql`
            SELECT p.*, c.name as category_name, c.slug as category_slug
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE (p.id = ANY(${ids}) OR p.slug = ANY(${ids})) AND p.is_active = true
          `;
          if (rows && rows.length > 0) {
            return res.json(rows.map((r: any) => formatProduct(r, new Map())));
          }
        } catch (e) {
          console.error('Neon products by ids error:', e);
        }
      }

      const catMap = new Map(categoriesStore.map((c) => [c.id, c]));
      const matching = productsStore
        .filter((p) => ids.includes(p.id) || ids.includes(p.slug))
        .map((p) => formatProduct(p, catMap));
      res.json(matching);
    } catch (err: any) {
      res.status(500).json({ message: 'Error fetching products by ids', error: err.message });
    }
  });

  // Single product by ID or Slug
  app.get('/api/products/:idOrSlug', async (req, res) => {
    try {
      const { idOrSlug } = req.params;
      if (!idOrSlug) return res.status(400).json({ message: 'Missing product ID or slug' });

      if (sql) {
        try {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
          let rows;
          if (isUuid) {
            rows = await sql`
              SELECT p.*, c.name as category_name, c.slug as category_slug
              FROM products p
              LEFT JOIN categories c ON p.category_id = c.id
              WHERE p.id = ${idOrSlug} OR p.slug = ${idOrSlug}
              LIMIT 1
            `;
          } else {
            rows = await sql`
              SELECT p.*, c.name as category_name, c.slug as category_slug
              FROM products p
              LEFT JOIN categories c ON p.category_id = c.id
              WHERE p.slug = ${idOrSlug} OR LOWER(p.slug) = LOWER(${idOrSlug})
              LIMIT 1
            `;
          }
          if (rows && rows.length > 0) {
            return res.json(formatProduct(rows[0], new Map()));
          }
        } catch (e) {
          console.error('Neon product by id/slug error:', e);
        }
      }

      const catMap = new Map(categoriesStore.map((c) => [c.id, c]));
      const product = productsStore.find(
        (p) => p.id === idOrSlug || p.slug?.toLowerCase() === idOrSlug.toLowerCase()
      );
      if (product) {
        return res.json(formatProduct(product, catMap));
      }

      return res.status(404).json({ message: 'Product not found' });
    } catch (err: any) {
      res.status(500).json({ message: 'Error fetching product', error: err.message });
    }
  });

  app.post('/api/products', optionalAuth, async (req, res) => {
    try {
      const b = req.body;
      const name = b.name;
      const slug = b.slug || name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || `prod-${Date.now()}`;
      const basePrice = Number(b.base_price || b.price) || 0;
      const comparePrice = b.compare_at_price ? Number(b.compare_at_price) : null;
      const images = Array.isArray(b.images) && b.images.length > 0
        ? b.images
        : [b.image_url || b.image || 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1000&fit=crop'];
      const isNewArrival = b.is_new_arrival ?? b.isNew ?? true;
      const isBestSeller = b.is_best_seller ?? b.is_bestseller ?? b.isBestseller ?? false;
      const isFeatured = b.is_featured ?? b.isFeatured ?? false;
      const categoryId = b.category_id || null;
      const subcategoryId = b.subcategory_id || null;
      const brand = b.brand || 'RAVENZA';
      const sku = b.sku || `RVZ-${Date.now().toString().slice(-4)}`;
      const attributes = b.attributes || { sizes: b.sizes || ['S', 'M', 'L', 'XL'], colors: b.colors || ['Black'] };
      const variantsMatrix = b.variants_matrix || b.variants || [];
      const sizeGuide = b.size_guide || null;

      let insertedId = `prod-${Date.now()}`;
      if (sql) {
        try {
          const rows = await sql`
            INSERT INTO products (
              name, slug, description, base_price, compare_at_price, category_id, subcategory_id,
              brand, sku, fabric, fabric_composition, fabric_finish, fit, graphic_print,
              garment_specs, garment_care, shipping_delivery, model_size,
              meta_title, meta_description, meta_keywords, focus_keywords,
              is_new_arrival, is_best_seller, is_featured,
              badge, images, image_url, attributes, variants_matrix, size_guide, status, is_active
            ) VALUES (
              ${name}, ${slug}, ${b.description || ''}, ${basePrice}, ${comparePrice}, ${categoryId}, ${subcategoryId},
              ${brand}, ${sku}, ${b.fabric || ''}, ${b.fabric_composition || ''}, ${b.fabric_finish || ''}, ${b.fit || ''}, ${b.graphic_print || ''},
              ${b.garment_specs || ''}, ${b.garment_care || ''}, ${b.shipping_delivery || ''}, ${b.model_size || ''},
              ${b.meta_title || ''}, ${b.meta_description || ''}, ${b.meta_keywords || ''}, ${b.focus_keywords || ''},
              ${isNewArrival}, ${isBestSeller}, ${isFeatured},
              ${b.badge || null}, ${JSON.stringify(images)}, ${images[0]},
              ${JSON.stringify(attributes)}, ${JSON.stringify(variantsMatrix)}, ${sizeGuide ? JSON.stringify(sizeGuide) : null},
              ${b.status || 'active'}, true
            )
            RETURNING id
          `;
          if (rows && rows.length > 0) insertedId = rows[0].id;
        } catch (e) {
          console.error('Neon insert product error:', e);
        }
      }

      const newProd: Product = {
        id: insertedId,
        name,
        slug,
        description: b.description || '',
        base_price: basePrice,
        compare_at_price: comparePrice,
        is_active: true,
        category_id: categoryId || 'cat-1',
        subcategory_id: subcategoryId,
        brand: brand,
        sku: sku,
        fabric: b.fabric || '',
        fabric_composition: b.fabric_composition || '',
        fabric_finish: b.fabric_finish || '',
        fit: b.fit || '',
        graphic_print: b.graphic_print || '',
        garment_specs: b.garment_specs || '',
        garment_care: b.garment_care || '',
        shipping_delivery: b.shipping_delivery || '',
        model_size: b.model_size || '',
        meta_title: b.meta_title || '',
        meta_description: b.meta_description || '',
        meta_keywords: b.meta_keywords || '',
        focus_keywords: b.focus_keywords || '',
        is_new_arrival: isNewArrival,
        is_bestseller: isBestSeller,
        is_featured: isFeatured,
        badge: b.badge || null,
        images: images,
        attributes: attributes,
        variants_matrix: variantsMatrix,
        size_guide: sizeGuide,
        size_guide_enabled: b.size_guide_enabled ?? (sizeGuide ? true : false),
        stock: b.stock || 50,
        is_in_stock: true,
        created_at: new Date().toISOString(),
      };
      productsStore.unshift(newProd);
      const catMap = new Map(categoriesStore.map((c) => [c.id, c]));
      res.status(201).json(formatProduct(newProd, catMap));
    } catch (err: any) {
      res.status(500).json({ message: 'Error creating product', error: err.message });
    }
  });

  app.put('/api/products/:id', optionalAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const b = req.body;
      const images = Array.isArray(b.images) && b.images.length > 0 ? b.images : (b.image ? [b.image] : undefined);
      const attributes = b.attributes || (b.sizes || b.colors ? { sizes: b.sizes, colors: b.colors } : undefined);

      if (sql) {
        try {
          await sql`
            UPDATE products SET
              name = COALESCE(${b.name}, name),
              description = COALESCE(${b.description}, description),
              base_price = COALESCE(${b.base_price !== undefined || b.price !== undefined ? Number(b.base_price || b.price) : null}, base_price),
              compare_at_price = COALESCE(${b.compare_at_price !== undefined ? (b.compare_at_price ? Number(b.compare_at_price) : null) : null}, compare_at_price),
              category_id = COALESCE(${b.category_id}, category_id),
              subcategory_id = COALESCE(${b.subcategory_id}, subcategory_id),
              brand = COALESCE(${b.brand}, brand),
              sku = COALESCE(${b.sku}, sku),
              fabric = COALESCE(${b.fabric}, fabric),
              fabric_composition = COALESCE(${b.fabric_composition}, fabric_composition),
              fabric_finish = COALESCE(${b.fabric_finish}, fabric_finish),
              fit = COALESCE(${b.fit}, fit),
              graphic_print = COALESCE(${b.graphic_print}, graphic_print),
              garment_specs = COALESCE(${b.garment_specs}, garment_specs),
              garment_care = COALESCE(${b.garment_care}, garment_care),
              shipping_delivery = COALESCE(${b.shipping_delivery}, shipping_delivery),
              model_size = COALESCE(${b.model_size}, model_size),
              meta_title = COALESCE(${b.meta_title}, meta_title),
              meta_description = COALESCE(${b.meta_description}, meta_description),
              meta_keywords = COALESCE(${b.meta_keywords || b.focus_keywords}, meta_keywords),
              is_new_arrival = COALESCE(${b.is_new_arrival ?? b.isNew}, is_new_arrival),
              is_best_seller = COALESCE(${b.is_best_seller ?? b.is_bestseller ?? b.isBestseller}, is_best_seller),
              is_featured = COALESCE(${b.is_featured ?? b.isFeatured}, is_featured),
              badge = COALESCE(${b.badge}, badge),
              images = COALESCE(${images ? JSON.stringify(images) : null}, images),
              image_url = COALESCE(${images && images[0] ? images[0] : null}, image_url),
              attributes = COALESCE(${attributes ? JSON.stringify(attributes) : null}, attributes),
              variants_matrix = COALESCE(${b.variants_matrix ? JSON.stringify(b.variants_matrix) : null}, variants_matrix),
              size_guide = COALESCE(${b.size_guide ? JSON.stringify(b.size_guide) : null}, size_guide),
              status = COALESCE(${b.status}, status),
              is_active = COALESCE(${b.is_active}, is_active),
              updated_at = NOW()
            WHERE id::text = ${id} OR slug = ${id}
          `;
        } catch (e) {
          console.error('Neon update product error:', e);
        }
      }

      const index = productsStore.findIndex((p) => p.id === id || p.slug === id);
      if (index !== -1) {
        productsStore[index] = {
          ...productsStore[index],
          ...b,
          ...(images ? { images, image_url: images[0] } : {}),
          ...(attributes ? { attributes } : {}),
          ...(b.variants_matrix ? { variants_matrix: b.variants_matrix } : {}),
          ...(b.size_guide !== undefined ? { size_guide: b.size_guide } : {}),
          ...(b.size_guide_enabled !== undefined ? { size_guide_enabled: b.size_guide_enabled } : {}),
        };
        const catMap = new Map(categoriesStore.map((c) => [c.id, c]));
        logAdminAudit('Product Updated', productsStore[index].name, 'Admin', `Price: ${productsStore[index].base_price}`);
        return res.json(formatProduct(productsStore[index], catMap));
      }

      logAdminAudit('Product Updated', id, 'Admin');
      res.json({ success: true, message: 'Product updated' });
    } catch (err: any) {
      res.status(500).json({ message: 'Error updating product', error: err.message });
    }
  });

  app.delete('/api/products/:id', optionalAuth, async (req, res) => {
    try {
      const { id } = req.params;
      if (sql) {
        try {
          await sql`UPDATE products SET is_active = false WHERE id::text = ${id} OR slug = ${id}`;
        } catch (e) {
          console.error('Neon delete product error:', e);
        }
      }
      productsStore = productsStore.filter((p) => p.id !== id && p.slug !== id);
      res.json({ success: true, message: 'Product deleted' });
    } catch (err: any) {
      res.status(500).json({ message: 'Error deleting product', error: err.message });
    }
  });

  // ==================== CATEGORIES ROUTES ====================
  app.get('/api/categories', async (req, res) => {
    try {
      if (sql) {
        const rows = await sql`
          SELECT * FROM categories
          WHERE is_active = true
          ORDER BY sort_order ASC
        `;
        if (rows && rows.length > 0) {
          return res.json(rows);
        }
      }
    } catch (e) {
      console.error('Neon categories error:', e);
    }
    res.json(categoriesStore.filter((c) => c.is_active).sort((a, b) => a.sort_order - b.sort_order));
  });

  app.get('/api/categories/featured-in-focus', async (req, res) => {
    const fallbackCurated = [
      {
        id: 'cat-coord',
        name: 'Graphic Co-Ord Sets',
        slug: 'co-ord-sets',
        badge: 'TRENDING',
        tag: 'WINTER ESSENTIALS',
        description: 'Effortlessly synchronized luxury matching sets crafted for modern streetwear styling.',
        cover_image_url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1000&fit=crop',
        is_active: true,
        is_featured_in_focus: true,
        display_order_in_focus: 1,
      },
      {
        id: 'cat-oversize',
        name: 'Oversize Tees',
        slug: 'oversize-tees',
        badge: 'BESTSELLER',
        tag: 'HEAVYWEIGHT 280 GSM',
        description: 'Heavyweight drop-shoulder graphic tees crafted from 280 GSM combed cotton.',
        cover_image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop',
        is_active: true,
        is_featured_in_focus: true,
        display_order_in_focus: 2,
      },
      {
        id: 'cat-acid',
        name: 'Acid Wash Tees',
        slug: 'acid-wash-tees',
        badge: 'NEW EDIT',
        tag: 'VINTAGE WASH',
        description: 'Vintage mineral wash textures engineered with distressed artisan hems.',
        cover_image_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&h=1000&fit=crop',
        is_active: true,
        is_featured_in_focus: true,
        display_order_in_focus: 3,
      },
      {
        id: 'cat-trousers',
        name: 'Graphic Trousers',
        slug: 'graphic-trousers',
        badge: 'ESSENTIAL',
        tag: 'RELAXED TAILORING',
        description: 'Relaxed tailored cargo trousers and utility silhouettes for versatile layering.',
        cover_image_url: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&h=1000&fit=crop',
        is_active: true,
        is_featured_in_focus: true,
        display_order_in_focus: 4,
      },
    ];

    try {
      if (sql) {
        const rows = await sql`
          SELECT * FROM categories
          WHERE is_active = true AND is_featured_in_focus = true
          ORDER BY display_order_in_focus ASC, sort_order ASC
          LIMIT 4
        `;
        if (rows && rows.length > 0) {
          const filled = rows.map((r: any, idx: number) => ({
            ...r,
            cover_image_url: r.cover_image_url || fallbackCurated[idx % fallbackCurated.length].cover_image_url,
            badge: r.badge || fallbackCurated[idx % fallbackCurated.length].badge,
            description: r.description || fallbackCurated[idx % fallbackCurated.length].description,
          }));
          if (filled.length >= 4) {
            return res.json(filled);
          }
          const remaining = fallbackCurated.slice(filled.length);
          return res.json([...filled, ...remaining]);
        }
      }
    } catch (e) {
      console.error('Neon featured in focus error:', e);
    }
    const featured = categoriesStore
      .filter((c) => c.is_active && c.is_featured_in_focus)
      .sort((a, b) => a.display_order_in_focus - b.display_order_in_focus)
      .slice(0, 4);
    if (featured.length >= 4) {
      return res.json(featured);
    }
    res.json(fallbackCurated);
  });

  // ==================== WARM CHAPTERS ROUTES (Dynamic Categories) ====================
  app.get('/api/warm-chapters', async (req, res) => {
    try {
      if (sql) {
        // 1. Try selecting categories marked as warm chapter
        try {
          const rows = await sql`
            SELECT * FROM categories
            WHERE is_active = true AND is_warm_chapter = true
            ORDER BY display_order_warm_chapter ASC, sort_order ASC
          `;
          if (rows && rows.length > 0) {
            return res.json(rows.map((r: any) => ({
              id: r.id,
              title: r.name,
              subtitle: r.tag || r.badge || r.description || 'NEW EDIT',
              slug: r.slug,
              image_url: r.cover_image_url || 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1000&fit=crop',
              badge: r.badge,
              tag: r.tag,
              is_active: r.is_active,
              display_order: r.display_order_warm_chapter || r.sort_order || 0,
            })));
          }
        } catch (_) {
          // column is_warm_chapter might not exist in Neon table yet
        }

        // 2. Fallback to active categories from database
        try {
          const dbCats = await sql`
            SELECT * FROM categories
            WHERE is_active = true
            ORDER BY sort_order ASC
            LIMIT 8
          `;
          if (dbCats && dbCats.length > 0) {
            return res.json(dbCats.map((r: any) => ({
              id: r.id,
              title: r.name,
              subtitle: r.tag || r.badge || r.description || 'NEW EDIT',
              slug: r.slug,
              image_url: r.cover_image_url || 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1000&fit=crop',
              badge: r.badge,
              tag: r.tag,
              is_active: r.is_active,
              display_order: r.sort_order || 0,
            })));
          }
        } catch (dbErr) {
          console.error('Neon categories fallback error in warm-chapters:', dbErr);
        }
      }
    } catch (e) {
      console.error('Neon warm chapters error:', e);
    }

    // 3. Fallback to categoriesStore (ensures slug always matches collection pages)
    const warmCats = categoriesStore.filter((c: any) => c.is_active && c.is_warm_chapter);
    const candidateCats = warmCats.length > 0 ? warmCats : categoriesStore.filter((c) => c.is_active).slice(0, 8);
    if (candidateCats.length > 0) {
      return res.json(candidateCats.map((c: any) => ({
        id: c.id,
        title: c.name,
        subtitle: c.tag || c.badge || c.description || 'NEW EDIT',
        slug: c.slug,
        image_url: c.cover_image_url || 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1000&fit=crop',
        badge: c.badge,
        tag: c.tag,
        is_active: c.is_active,
        display_order: c.display_order_warm_chapter || c.sort_order || 0,
      })));
    }

    res.json(warmChaptersStore.filter((wc) => wc.is_active).sort((a, b) => a.display_order - b.display_order));
  });

  const handleCategoryCreate = async (req: any, res: any) => {
    try {
      const b = req.body;
      const slug = b.slug || b.name?.toLowerCase().replace(/\s+/g, '-') || `cat-${Date.now()}`;
      let insertedId = `cat-${Date.now()}`;

      if (sql) {
        try {
          const rows = await sql`
            INSERT INTO categories (
              name, slug, description, badge, tag, cover_image_url, parent_id, sort_order,
              is_active, is_featured_in_focus, display_order_in_focus, is_warm_chapter, display_order_warm_chapter
            ) VALUES (
              ${b.name}, ${slug}, ${b.description || ''}, ${b.badge || null}, ${b.tag || null},
              ${b.cover_image_url || null}, ${b.parent_id || null}, ${Number(b.sort_order) || 0},
              true, ${Boolean(b.is_featured_in_focus)}, ${Number(b.display_order_in_focus) || 0},
              ${Boolean(b.is_warm_chapter)}, ${Number(b.display_order_warm_chapter) || 0}
            )
            RETURNING id
          `;
          if (rows && rows.length > 0) insertedId = rows[0].id;
        } catch (e) {
          console.error('Neon insert category error:', e);
        }
      }

      const newCat = {
        id: insertedId,
        name: b.name,
        slug: slug,
        description: b.description || '',
        badge: b.badge || null,
        tag: b.tag || null,
        cover_image_url: b.cover_image_url || '',
        parent_id: b.parent_id || null,
        sort_order: Number(b.sort_order) || 0,
        is_active: true,
        is_featured_in_focus: Boolean(b.is_featured_in_focus),
        display_order_in_focus: Number(b.display_order_in_focus) || 0,
        is_warm_chapter: Boolean(b.is_warm_chapter),
        display_order_warm_chapter: Number(b.display_order_warm_chapter) || 0,
      };
      categoriesStore.push(newCat as any);
      res.status(201).json(newCat);
    } catch (err: any) {
      res.status(500).json({ message: 'Error creating category', error: err.message });
    }
  };

  app.post('/api/categories', optionalAuth, handleCategoryCreate);
  app.post('/api/categories/new', optionalAuth, handleCategoryCreate);

  app.put('/api/categories/:id', optionalAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const b = req.body;

      if (sql) {
        try {
          await sql`
            UPDATE categories SET
              name = COALESCE(${b.name}, name),
              slug = COALESCE(${b.slug}, slug),
              description = COALESCE(${b.description}, description),
              badge = COALESCE(${b.badge}, badge),
              tag = COALESCE(${b.tag}, tag),
              cover_image_url = COALESCE(${b.cover_image_url}, cover_image_url),
              parent_id = COALESCE(${b.parent_id !== undefined ? (b.parent_id || null) : null}, parent_id),
              sort_order = COALESCE(${b.sort_order !== undefined ? Number(b.sort_order) : null}, sort_order),
              is_active = COALESCE(${b.is_active !== undefined ? Boolean(b.is_active) : null}, is_active),
              is_featured_in_focus = COALESCE(${b.is_featured_in_focus !== undefined ? Boolean(b.is_featured_in_focus) : null}, is_featured_in_focus),
              display_order_in_focus = COALESCE(${b.display_order_in_focus !== undefined ? Number(b.display_order_in_focus) : null}, display_order_in_focus),
              is_warm_chapter = COALESCE(${b.is_warm_chapter !== undefined ? Boolean(b.is_warm_chapter) : null}, is_warm_chapter),
              display_order_warm_chapter = COALESCE(${b.display_order_warm_chapter !== undefined ? Number(b.display_order_warm_chapter) : null}, display_order_warm_chapter),
              updated_at = NOW()
            WHERE id::text = ${id} OR slug = ${id}
          `;
        } catch (e) {
          console.error('Neon update category error:', e);
        }
      }

      const index = categoriesStore.findIndex((c) => c.id === id || c.slug === id);
      if (index !== -1) {
        categoriesStore[index] = { ...categoriesStore[index], ...b };
        logAdminAudit('Category Updated', categoriesStore[index].name, 'Admin', `Fields updated: ${Object.keys(b).join(', ')}`);
        return res.json(categoriesStore[index]);
      }
      logAdminAudit('Category Updated', id, 'Admin');
      res.json({ success: true, message: 'Category updated' });
    } catch (err: any) {
      res.status(500).json({ message: 'Error updating category', error: err.message });
    }
  });

  app.delete('/api/categories/:id', optionalAuth, async (req, res) => {
    try {
      const { id } = req.params;
      if (sql) {
        try {
          await sql`UPDATE categories SET is_active = false WHERE id::text = ${id} OR slug = ${id}`;
        } catch (e) {
          console.error('Neon delete category error:', e);
        }
      }
      const existing = categoriesStore.find((c) => c.id === id || c.slug === id);
      const catName = existing ? existing.name : id;
      categoriesStore = categoriesStore.filter((c) => c.id !== id && c.slug !== id);
      logAdminAudit('Category Deleted', catName, 'Admin');
      res.json({ success: true, message: 'Category deleted' });
    } catch (err: any) {
      res.status(500).json({ message: 'Error deleting category', error: err.message });
    }
  });

  // ==================== COLLECTIONS ROUTES ====================
  app.get('/api/collections', (req, res) => {
    res.json(collectionsStore.filter((c) => c.is_active).sort((a, b) => a.sort_order - b.sort_order));
  });

  app.get('/api/collections/:slug', (req, res) => {
    const collection = collectionsStore.find((c) => c.slug === req.params.slug);
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    res.json(collection);
  });

  // ==================== ORDERS ROUTES ====================
  app.get('/api/orders', optionalAuth, async (req, res) => {
    try {
      const requestedUserId = req.query.user_id as string;
      const targetUserId = req.user && req.user.role === 'customer' ? req.user.id : (requestedUserId || null);
      if (sql) {
        try {
          let rows;
          if (targetUserId) {
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetUserId);
            if (isUuid) {
              rows = await sql`SELECT * FROM orders WHERE user_id = ${targetUserId} ORDER BY created_at DESC`;
            } else {
              rows = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
            }
          } else {
            rows = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
          }
          if (rows && rows.length > 0) {
            return res.json(rows.map((r: any) => ({
              id: r.id,
              order_number: r.order_number,
              tracking_id: r.tracking_number || `TRK-${r.order_number}`,
              user_id: r.user_id,
              total: Number(r.total),
              subtotal: Number(r.subtotal),
              shipping_cost: Number(r.shipping_cost),
              discount_amount: Number(r.discount_amount || 0),
              status: r.status,
              payment_method: r.payment_method,
              shipping_address: r.shipping_address,
              items: r.items,
              date: r.created_at,
              created_at: r.created_at,
            })));
          }
        } catch (e) {
          console.error('Neon get orders error:', e);
        }
      }
      if (targetUserId) {
        return res.json(ordersStore.filter((o) => o.user_id === targetUserId));
      }
      res.json(ordersStore);
    } catch (err: any) {
      res.status(500).json({ message: 'Error retrieving orders', error: err.message });
    }
  });

  app.post('/api/orders', optionalAuth, async (req, res) => {
    try {
      const orderData = req.body;
      const orderNumber = orderData.order_number || `RVZ-${Math.floor(100000 + Math.random() * 900000)}`;
      const trackingNumber = orderData.tracking_id || orderData.tracking_number || `TRK${Date.now().toString().slice(-8)}`;
      const rawUserId = req.user?.id || orderData.user_id;
      const isValidUuid = rawUserId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawUserId);
      const dbUserId = isValidUuid ? rawUserId : null;

      const subtotal = Number(orderData.subtotal) || 0;
      const shippingCost = Number(orderData.shipping_cost) || 0;
      const discountAmount = Number(orderData.discount_amount) || 0;
      const total = Number(orderData.total) || (subtotal - discountAmount + shippingCost);
      const shippingAddress = orderData.shipping_address || orderData.shippingDetails || {};
      const items = orderData.items || orderData.cart || [];
      const paymentMethod = orderData.payment_method || 'cod';
      const orderNotes = orderData.notes || shippingAddress.notes || '';
      const discountCode = orderData.coupon_code || orderData.discount_code || null;

      let createdOrderId = orderData.id || `ord-${Date.now()}`;

      if (sql) {
        try {
          const inserted = await sql`
            INSERT INTO orders (
              order_number, user_id, status, payment_status, payment_method,
              subtotal, shipping_cost, total, discount_amount, discount_code,
              shipping_address, order_notes, items, tracking_number
            ) VALUES (
              ${orderNumber}, ${dbUserId}, 'pending', 'unpaid', ${paymentMethod},
              ${subtotal}, ${shippingCost}, ${total}, ${discountAmount}, ${discountCode},
              ${JSON.stringify(shippingAddress)}::jsonb, ${orderNotes}, ${JSON.stringify(items)}::jsonb, ${trackingNumber}
            )
            RETURNING id, order_number, created_at
          `;
          if (inserted && inserted.length > 0) {
            createdOrderId = inserted[0].id;
          }

          if (dbUserId && shippingAddress.address) {
            try {
              await sql`
                INSERT INTO addresses (
                  user_id, type, address_line_1, city, region, postal_code, phone, is_default
                ) VALUES (
                  ${dbUserId}, 'shipping', ${shippingAddress.address}, ${shippingAddress.city || ''},
                  ${shippingAddress.region || 'Punjab'}, ${shippingAddress.postalCode || ''},
                  ${shippingAddress.phone || ''}, true
                )
              `;
            } catch (addrErr) {
              console.warn('Address insert note:', addrErr);
            }
          }
        } catch (dbErr) {
          console.error('Neon save order error (falling back to memory):', dbErr);
        }
      }

      const newOrder = {
        id: createdOrderId,
        order_number: orderNumber,
        tracking_id: trackingNumber,
        user_id: rawUserId || 'guest',
        status: 'pending_verification',
        subtotal,
        shipping_cost: shippingCost,
        total,
        discount_amount: discountAmount,
        discount_code: discountCode,
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        items,
        notes: orderNotes,
        date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      ordersStore.unshift(newOrder as any);
      res.status(201).json(newOrder);
    } catch (err: any) {
      console.error('Order creation error:', err);
      res.status(500).json({ message: 'Error creating order', error: err.message });
    }
  });

  app.patch('/api/orders/:id/status', optionalAuth, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const order = ordersStore.find((o) => o.id === id || o.order_number === id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    order.status = status;
    res.json(order);
  });

  // ==================== REVIEWS ROUTES ====================
  app.get('/api/reviews', (req, res) => {
    const { product_id, product_slug } = req.query as any;
    let list = reviewsStore.filter((r) => r.is_approved);
    if (product_id) {
      list = list.filter((r) => r.product_id === product_id);
    }
    if (product_slug) {
      list = list.filter((r) => r.product_slug === product_slug);
    }
    res.json(list);
  });

  app.post('/api/reviews', optionalAuth, (req, res) => {
    try {
      const { product_id, product_slug, rating, comment, name } = req.body;
      const newReview: Review = {
        id: `rev-${Date.now()}`,
        product_id: product_id || 'prod-1',
        product_slug: product_slug || '',
        user_name: name || req.user?.name || 'Customer',
        rating: Number(rating) || 5,
        comment: comment || '',
        is_approved: true,
        created_at: new Date().toISOString(),
      };
      reviewsStore.unshift(newReview);
      res.status(201).json(newReview);
    } catch (err: any) {
      res.status(500).json({ message: 'Error submitting review', error: err.message });
    }
  });

  // ==================== WISHLIST ROUTES ====================
  app.get('/api/wishlist/:user_id', async (req, res) => {
    const { user_id } = req.params;
    const catMap = new Map(categoriesStore.map((c) => [c.id, c]));

    if (sql && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user_id)) {
      try {
        const rows = await sql`
          SELECT p.*, c.name as category_name, c.slug as category_slug
          FROM wishlists w
          JOIN products p ON w.product_id = p.id
          LEFT JOIN categories c ON p.category_id = c.id
          WHERE w.user_id = ${user_id}
          ORDER BY w.created_at DESC
        `;
        if (rows && rows.length > 0) {
          return res.json(rows.map((r: any) => formatProduct(r, catMap)));
        }
      } catch (e) {
        console.error('Neon wishlist get error:', e);
      }
    }

    const items = wishlistStore.filter((w) => w.user_id === user_id);
    const prods = items
      .map((item) => productsStore.find((p) => p.id === item.product_id))
      .filter(Boolean)
      .map((p) => formatProduct(p!, catMap));
    res.json(prods);
  });

  app.post('/api/wishlist', optionalAuth, async (req, res) => {
    const { product_id, user_id } = req.body;
    const uid = req.user?.id || user_id || 'default_user';
    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uid);
    const isProductUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(product_id);

    const existsIndex = wishlistStore.findIndex((w) => w.user_id === uid && w.product_id === product_id);
    let status = 'added';
    if (existsIndex >= 0) {
      wishlistStore.splice(existsIndex, 1);
      status = 'removed';
    } else {
      wishlistStore.push({ user_id: uid, product_id });
      status = 'added';
    }

    if (sql && isValidUuid && isProductUuid) {
      try {
        if (status === 'removed') {
          await sql`DELETE FROM wishlists WHERE user_id = ${uid} AND product_id = ${product_id}`;
        } else {
          await sql`
            INSERT INTO wishlists (user_id, product_id)
            VALUES (${uid}, ${product_id})
            ON CONFLICT DO NOTHING
          `;
        }
      } catch (e) {
        console.error('Neon wishlist toggle error:', e);
      }
    }

    return res.json({ status, product_id });
  });

  // ==================== ADDRESSES ROUTES ====================
  app.get('/api/addresses', optionalAuth, async (req, res) => {
    try {
      const uid = req.user?.id || (req.query.user_id as string);
      if (!uid) return res.json([]);
      if (sql && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uid)) {
        try {
          const rows = await sql`SELECT * FROM addresses WHERE user_id = ${uid} ORDER BY created_at DESC`;
          return res.json(rows);
        } catch (e) {
          console.error('Neon addresses error:', e);
        }
      }
      res.json([]);
    } catch (err: any) {
      res.status(500).json({ message: 'Error fetching addresses', error: err.message });
    }
  });

  app.post('/api/addresses', optionalAuth, async (req, res) => {
    try {
      const uid = req.user?.id || req.body.user_id;
      const { address_line_1, city, region, postal_code, phone, type = 'shipping', is_default = true } = req.body;
      if (sql && uid && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uid)) {
        try {
          const rows = await sql`
            INSERT INTO addresses (user_id, type, address_line_1, city, region, postal_code, phone, is_default)
            VALUES (${uid}, ${type}, ${address_line_1}, ${city}, ${region || ''}, ${postal_code || ''}, ${phone || ''}, ${is_default})
            RETURNING *
          `;
          return res.status(201).json(rows[0]);
        } catch (e) {
          console.error('Neon insert address error:', e);
        }
      }
      res.status(201).json({ id: `addr-${Date.now()}`, user_id: uid, address_line_1, city, phone, type });
    } catch (err: any) {
      res.status(500).json({ message: 'Error creating address', error: err.message });
    }
  });

  // ==================== CART ROUTES (Persistence & Sync) ====================
  const userCartsStore: { [userId: string]: any[] } = {};

  app.get('/api/cart/:userId', optionalAuth, (req, res) => {
    const { userId } = req.params;
    const cart = userCartsStore[userId] || [];
    res.json(cart);
  });

  app.post('/api/cart/:userId/sync', optionalAuth, (req, res) => {
    const { userId } = req.params;
    const { cart } = req.body;
    if (Array.isArray(cart)) {
      userCartsStore[userId] = cart;
    }
    res.json({ success: true, cart: userCartsStore[userId] || [] });
  });

  // ==================== ADMIN STATS ====================
  app.get('/api/admin/stats', optionalAuth, (req, res) => {
    const totalRevenue = ordersStore.reduce((sum, o) => sum + (o.total || 0), 0);
    const activeOrders = ordersStore.filter((o) => ['confirmed', 'processing', 'shipped'].includes(o.status)).length;
    res.json({
      totalRevenue,
      totalOrders: ordersStore.length,
      activeOrders,
      totalProducts: productsStore.length,
      totalCustomers: usersStore.filter((u) => u.role === 'customer').length,
    });
  });

  // ==================== JOURNAL & FAQS ====================
  app.get('/api/journal', (req, res) => {
    res.json(journalStore.filter((j) => j.is_active).sort((a, b) => a.display_order - b.display_order));
  });

  app.get('/api/faqs', (req, res) => {
    res.json(faqsStore.filter((f) => f.is_active).sort((a, b) => a.display_order - b.display_order));
  });

  // ==================== NEWSLETTER ====================
  app.get('/api/newsletter', optionalAuth, (req, res) => {
    res.json(newsletterStore);
  });

  app.post('/api/newsletter', (req, res) => {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Valid email is required' });
    }
    if (!newsletterStore.find((n) => n.email.toLowerCase() === email.toLowerCase())) {
      newsletterStore.push({ email, date: new Date().toISOString().split('T')[0] });
    }
    res.json({ success: true, message: 'Subscribed to Ravenza VIP newsletter' });
  });

  // ==================== OTP VERIFICATION ====================
  app.post('/api/send-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (email.toLowerCase().trim() === 'admin@ravenza.pk') {
      return res.status(400).json({
        message: 'Admin accounts cannot log in via Customer OTP. Please sign in with Email & Password at the Admin Portal.',
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryMs = 15 * 60 * 1000; // 15-minute OTP expiry
    otpStore[email.toLowerCase()] = {
      otp,
      expiresAt: Date.now() + expiryMs,
    };

    console.log(`📧 Generated 15-min OTP for ${email}: ${otp}`);

    // Clean up appsScriptUrl in case of accidental leading/trailing quotes or colon
    let appsScriptUrl = (process.env.APPS_SCRIPT_URL || process.env.GAS_WEBHOOK_URL || process.env.GOOGLE_SCRIPT_URL || '').trim();
    if (appsScriptUrl.startsWith(':')) {
      appsScriptUrl = appsScriptUrl.substring(1).trim();
    }
    appsScriptUrl = appsScriptUrl.replace(/^["']|["']$/g, '');

    let emailSentViaScript = false;
    if (appsScriptUrl && appsScriptUrl.startsWith('http')) {
      try {
        console.log(`📡 Triggering Google Apps Script webhook for ${email}...`);
        const scriptRes = await fetch(appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            otp,
            appName: 'RAVENZA Streetwear',
            expiryMinutes: 15,
            subject: `Your RAVENZA Verification Code: ${otp}`
          })
        });
        if (scriptRes.ok) {
          emailSentViaScript = true;
          console.log(`✅ Google Apps Script dispatched OTP email to ${email}`);
        } else {
          console.warn(`⚠️ Google Apps Script returned status ${scriptRes.status}`);
        }
      } catch (scriptErr) {
        console.warn('Apps Script delivery note:', scriptErr);
      }
    } else {
      console.log(`ℹ️ No APPS_SCRIPT_URL or GAS_WEBHOOK_URL in .env. OTP logged to console: ${otp}`);
    }

    res.json({
      success: true,
      message: emailSentViaScript 
        ? `OTP code sent to ${email}. Valid for 15 minutes.`
        : `Verification code generated for ${email}. Valid for 15 minutes.`,
      otp, // Provided for instant checkout validation in preview
      expiresInMinutes: 15,
    });
  });

  // Alias routes for /api/auth/send-otp and /api/auth/verify-otp
  app.post('/api/auth/send-otp', (req, res) => {
    // Forward directly to /api/send-otp handler logic
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email.toLowerCase()] = { otp, expiresAt: Date.now() + 15 * 60 * 1000 };
    console.log(`📧 Generated 15-min OTP for ${email}: ${otp}`);
    res.json({ success: true, message: `OTP code sent to ${email}. Valid for 15 minutes.`, otp });
  });

  app.post('/api/auth/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });
    const record = otpStore[email.toLowerCase()];
    if (!record || record.expiresAt < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
    if (record.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP code.' });
    }
    delete otpStore[email.toLowerCase()];
    res.json({ success: true, message: 'OTP verified successfully' });
  });

  app.post('/api/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const record = otpStore[email.toLowerCase()];
    if (!record || record.expiresAt < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP (expires in 15 minutes)' });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP code. Please check and retry.' });
    }

    delete otpStore[email.toLowerCase()];

    // Auto-login or register customer
    let userRecord = usersStore.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!userRecord && sql) {
      try {
        const dbUsers = await sql`SELECT * FROM users WHERE LOWER(email) = LOWER(${email}) LIMIT 1`;
        if (dbUsers && dbUsers.length > 0) {
          userRecord = {
            id: dbUsers[0].id,
            email: dbUsers[0].email,
            name: dbUsers[0].name || email.split('@')[0],
            role: dbUsers[0].role || 'customer',
          };
        }
      } catch (e) {
        console.warn('Neon check user error:', e);
      }
    }

    if (!userRecord) {
      const newUserId = `usr-${Date.now()}`;
      userRecord = {
        id: newUserId,
        email: email.toLowerCase(),
        name: email.split('@')[0],
        role: 'customer',
      };
      usersStore.push(userRecord as any);

      if (sql) {
        try {
          const insertedUser = await sql`
            INSERT INTO users (email, name, role, is_verified, is_active)
            VALUES (${email.toLowerCase()}, ${userRecord.name}, 'customer', true, true)
            ON CONFLICT (email) DO UPDATE SET is_verified = true
            RETURNING id, email, name, role
          `;
          if (insertedUser && insertedUser.length > 0) {
            userRecord.id = insertedUser[0].id;
          }
        } catch (e) {
          console.warn('Neon auto-register user note:', e);
        }
      }
    }

    const token = jwt.sign(
      { id: userRecord.id, email: userRecord.email, role: userRecord.role, name: userRecord.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'OTP verified successfully',
      token,
      user: userRecord,
    });
  });

  // ==================== COUPONS ====================
  app.post('/api/validate-coupon', (req, res) => {
    const { code, orderAmount } = req.body;
    if (!code) {
      return res.status(400).json({ valid: false, message: 'Coupon code required' });
    }

    const coupon = couponsStore.find(
      (c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.is_active
    );

    if (!coupon) {
      return res.json({ valid: false, message: 'Invalid or expired coupon code' });
    }

    const amt = Number(orderAmount) || 0;
    if (amt < coupon.min_order_amount) {
      return res.json({
        valid: false,
        message: `Minimum order amount of Rs. ${coupon.min_order_amount} required`,
      });
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (amt * coupon.discount_value) / 100;
      if (coupon.max_discount && discount > coupon.max_discount) {
        discount = coupon.max_discount;
      }
    } else {
      discount = coupon.discount_value;
    }

    res.json({
      valid: true,
      discount: Math.round(discount),
      coupon: {
        code: coupon.code,
        type: coupon.discount_type,
        value: coupon.discount_value,
      },
    });
  });

  app.get('/api/coupons', (req, res) => {
    res.json(couponsStore);
  });

  app.post('/api/coupons', (req, res) => {
    const { code, discount_type, discount_value, min_order_amount, is_active } = req.body;
    if (!code) return res.status(400).json({ message: 'Code is required' });
    const newCoupon: Coupon = {
      code: code.trim().toUpperCase(),
      discount_type: discount_type || 'percentage',
      discount_value: Number(discount_value) || 10,
      min_order_amount: Number(min_order_amount) || 0,
      is_active: is_active !== false,
    };
    couponsStore = couponsStore.filter(c => c.code !== newCoupon.code);
    couponsStore.push(newCoupon);
    logAdminAudit('Coupon Created/Updated', newCoupon.code, 'Admin', `${newCoupon.discount_type}: ${newCoupon.discount_value}`);
    res.status(201).json(newCoupon);
  });

  app.delete('/api/coupons/:code', (req, res) => {
    const code = req.params.code.toUpperCase();
    couponsStore = couponsStore.filter(c => c.code !== code);
    logAdminAudit('Coupon Deleted', code, 'Admin');
    res.json({ success: true, message: 'Coupon deleted' });
  });

  // ==================== ADMIN CUSTOMERS ROUTE ====================
  app.get('/api/admin/customers', async (req, res) => {
    try {
      if (sql) {
        try {
          const rows = await sql`
            SELECT id, name, email, phone, role, is_active, created_at, updated_at
            FROM users
            WHERE role = 'customer' OR role IS NULL
            ORDER BY created_at DESC
          `;
          if (rows && rows.length > 0) {
            return res.json(rows.map((r: any) => ({
              id: r.id,
              name: r.name || 'Anonymous Customer',
              email: r.email,
              phone: r.phone || 'N/A',
              role: r.role || 'customer',
              is_verified: true,
              is_active: r.is_active !== false,
              created_at: r.created_at,
              orders_count: ordersStore.filter(o => o.user_id === r.id || o.shipping_address?.email === r.email).length,
              total_spent: ordersStore
                .filter(o => o.user_id === r.id || o.shipping_address?.email === r.email)
                .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0)
            })));
          }
        } catch (e) {
          console.error('Neon customers query error:', e);
        }
      }
      res.json(usersStore.filter(u => u.role === 'customer').map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: '03001234567',
        role: u.role,
        is_verified: u.is_verified,
        is_active: u.is_active,
        created_at: '2024-01-15T10:00:00Z',
        orders_count: 3,
        total_spent: 12450
      })));
    } catch (err: any) {
      res.status(500).json({ message: 'Error fetching customers', error: err.message });
    }
  });

  // ==================== AUDIT LOGS ROUTES ====================
  app.get('/api/admin/audit-logs', (req, res) => {
    res.json(auditLogsStore);
  });

  app.post('/api/admin/audit-logs', (req, res) => {
    const { action, entity, user, details } = req.body;
    logAdminAudit(action || 'System Action', entity || 'General', user || 'Admin', details);
    res.status(201).json({ success: true, log: auditLogsStore[0] });
  });

  // ==================== NOTIFICATIONS ROUTES ====================
  app.get('/api/admin/notifications', (req, res) => {
    // Dynamic stock checks for automatic alerts (threshold: 5)
    const lowStockItems = productsStore.filter(p => {
      const stock = (p as any).stockCount ?? p.stock ?? 50;
      return stock <= 5;
    });

    lowStockItems.forEach(item => {
      const exists = adminNotificationsStore.some(n => n.type === 'stock' && n.message.includes(item.name));
      if (!exists) {
        adminNotificationsStore.unshift({
          id: `notif-stock-${item.id}`,
          title: 'Critical Low Stock',
          message: `${item.name} has only ${(item as any).stockCount ?? item.stock ?? 0} units left (threshold: 5).`,
          type: 'stock',
          is_read: false,
          created_at: new Date().toISOString(),
          link: 'inventory'
        });
      }
    });

    res.json(adminNotificationsStore);
  });

  app.put('/api/admin/notifications/:id/read', (req, res) => {
    const { id } = req.params;
    if (id === 'all') {
      adminNotificationsStore = adminNotificationsStore.map(n => ({ ...n, is_read: true }));
    } else {
      adminNotificationsStore = adminNotificationsStore.map(n => n.id === id ? { ...n, is_read: true } : n);
    }
    res.json({ success: true });
  });

  app.delete('/api/admin/notifications/:id', (req, res) => {
    const { id } = req.params;
    adminNotificationsStore = adminNotificationsStore.filter(n => n.id !== id);
    res.json({ success: true });
  });

  // ==================== VITE SPA / STATIC MIDDLEWARE ====================
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get(/.*/, (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Ravenza Full-Stack Platform running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
