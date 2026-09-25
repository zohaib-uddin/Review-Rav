import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
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
  warm_image_url?: string;
  focus_image_url?: string;
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
  id?: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount?: number;
  usage_limit?: number;
  used_count?: number;
  starts_at?: string | null;
  ends_at?: string | null;
  is_active: boolean;
  created_at?: string;
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
    id: 'cat-1-1',
    name: 'Summer Co-Ords',
    slug: 'summer-co-ords',
    parent_id: 'cat-1',
    description: 'Lightweight breathable matching coordinates for warm days',
    badge: 'SUMMER',
    tag: 'LIGHTWEIGHT',
    cover_image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=1000&fit=crop',
    sort_order: 1,
    is_active: true,
    is_featured_in_focus: false,
    display_order_in_focus: 0,
  },
  {
    id: 'cat-1-2',
    name: 'Winter Heavyweight Co-Ords',
    slug: 'winter-heavyweight-co-ords',
    parent_id: 'cat-1',
    description: 'Ultra-heavy 380 GSM fleece matching winter sets',
    badge: 'HOT',
    tag: 'HEAVYWEIGHT',
    cover_image_url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=1000&fit=crop',
    sort_order: 2,
    is_active: true,
    is_featured_in_focus: false,
    display_order_in_focus: 0,
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
    id: 'cat-2-1',
    name: 'Acid Wash Tees',
    slug: 'acid-wash-tees',
    parent_id: 'cat-2',
    description: 'Vintage mineral wash tees with distress tailoring',
    badge: 'VINTAGE',
    tag: 'MINERAL WASH',
    cover_image_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&h=1000&fit=crop',
    sort_order: 1,
    is_active: true,
    is_featured_in_focus: false,
    display_order_in_focus: 0,
  },
  {
    id: 'cat-2-2',
    name: 'Boxy Graphic Tees',
    slug: 'boxy-graphic-tees',
    parent_id: 'cat-2',
    description: 'Relaxed drop-shoulder tees with brutalist streetwear typography',
    badge: 'EXCLUSIVE',
    tag: 'BOXY FIT',
    cover_image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=1000&fit=crop',
    sort_order: 2,
    is_active: true,
    is_featured_in_focus: false,
    display_order_in_focus: 0,
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
    id: 'cat-3-1',
    name: 'Wide Leg Pants',
    slug: 'wide-leg-pants',
    parent_id: 'cat-3',
    description: 'Wide leg trousers tailored for fluid draped silhouettes',
    badge: null,
    tag: 'RELAXED',
    cover_image_url: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&h=1000&fit=crop',
    sort_order: 1,
    is_active: true,
    is_featured_in_focus: false,
    display_order_in_focus: 0,
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
    subcategory_id: 'cat-1-1',
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
    category_id: 'cat-1',
    subcategory_id: 'cat-1-2',
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
    subcategory_id: 'cat-2-1',
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
    subcategory_id: 'cat-2-2',
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
    stock: 0,
    is_in_stock: false,
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
    subcategory_id: 'cat-3-1',
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
  {
    id: 'prod-10',
    name: 'Obsidian Minimalist Co-Ord Set',
    slug: 'obsidian-minimalist-co-ord-set',
    description: 'Clean monochrome aesthetic co-ord set with tonal branding and boxy fit silhouette.',
    base_price: 4990,
    compare_at_price: 4490,
    category_id: 'cat-1',
    subcategory_id: 'cat-1-1',
    brand: 'RAVENZA',
    fabric: 'Combed Cotton',
    fabric_composition: '100% Combed Cotton',
    fabric_finish: 'Peach Finish',
    fit: 'Boxy',
    graphic_print: 'Minimalist Tonal Screen Print',
    garment_specs: '280 GSM',
    garment_care: 'Machine wash cold',
    shipping_delivery: '3-5 business days',
    model_size: 'Model wears size L',
    sku: 'RVZ-CO-004',
    is_new_arrival: true,
    is_bestseller: true,
    is_featured: true,
    badge: 'NEW',
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1000&fit=crop',
    ],
    attributes: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Obsidian Black', 'Charcoal'] },
    stock: 40,
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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function resolveCategoryUuid(val: any): string | null {
  if (!val || typeof val !== 'string') return null;
  const trimmed = val.trim();
  if (!trimmed || trimmed === 'none' || trimmed === 'null' || trimmed === 'undefined') return null;
  if (UUID_REGEX.test(trimmed)) return trimmed;
  const match = categoriesStore.find(
    (c) => c.id === trimmed || c.slug === trimmed || (c.name && c.name.toLowerCase() === trimmed.toLowerCase())
  );
  if (match && UUID_REGEX.test(match.id)) {
    return match.id;
  }
  return null;
}

async function syncStoresFromNeon() {
  if (!sql) return;
  try {
    const dbCats = await sql`SELECT * FROM categories ORDER BY sort_order ASC`;
    if (dbCats && dbCats.length > 0) {
      categoriesStore = dbCats.map((c: any) => ({
        ...c,
        is_active: c.is_active !== false,
      }));
      console.log(`✅ Loaded ${categoriesStore.length} categories from Neon DB`);
    }

    const dbProds = await sql`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `;
    if (dbProds && dbProds.length > 0) {
      productsStore = dbProds.map((p: any) => ({
        ...p,
        is_active: p.is_active !== false,
      }));
      console.log(`✅ Loaded ${productsStore.length} products from Neon DB`);
    }

    // Verify & ensure addresses and cart_items tables exist with required columns
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS addresses (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid REFERENCES users(id) ON DELETE CASCADE,
          type varchar(20) DEFAULT 'shipping',
          address_line_1 varchar(255) NOT NULL,
          address_line_2 varchar(255),
          city varchar(100) NOT NULL,
          region varchar(100) DEFAULT 'Sindh',
          postal_code varchar(20),
          country varchar(100) DEFAULT 'Pakistan',
          phone varchar(20),
          is_default boolean DEFAULT false,
          status varchar(20) DEFAULT 'active',
          created_at timestamptz NOT NULL DEFAULT now()
        )
      `;
      await sql`ALTER TABLE addresses ADD COLUMN IF NOT EXISTS status varchar(20) DEFAULT 'active'`;
      await sql`ALTER TABLE addresses ADD COLUMN IF NOT EXISTS is_default boolean DEFAULT false`;

      await sql`
        CREATE TABLE IF NOT EXISTS cart_items (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid REFERENCES users(id) ON DELETE CASCADE,
          session_id varchar(255),
          product_id varchar(255) NOT NULL,
          variant_id uuid,
          size varchar(50) NOT NULL DEFAULT 'M',
          color varchar(50) NOT NULL DEFAULT 'Black',
          quantity integer NOT NULL DEFAULT 1,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now()
        )
      `;
      await sql`ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS color varchar(50) DEFAULT 'Black'`;
      await sql`ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS size varchar(50) DEFAULT 'M'`;

      // Automatically upgrade image & media columns to TEXT so base64 and large media uploads never hit length limits
      try {
        await sql`ALTER TABLE categories ALTER COLUMN cover_image_url TYPE text`;
      } catch (_) {}
      try {
        await sql`ALTER TABLE categories ALTER COLUMN description TYPE text`;
      } catch (_) {}
      try {
        await sql`ALTER TABLE products ALTER COLUMN image_url TYPE text`;
      } catch (_) {}
      try {
        await sql`ALTER TABLE products ALTER COLUMN description TYPE text`;
      } catch (_) {}
      try {
        await sql`ALTER TABLE products ALTER COLUMN specs TYPE text`;
      } catch (_) {}
      try {
        await sql`ALTER TABLE warm_chapters ALTER COLUMN image_url TYPE text`;
      } catch (_) {}
      try {
        await sql`ALTER TABLE collections ALTER COLUMN image_url TYPE text`;
      } catch (_) {}
      try {
        await sql`ALTER TABLE journal_entries ALTER COLUMN featured_image TYPE text`;
      } catch (_) {}

      // Automatically ensure categories warm_image_url and focus_image_url columns exist
      try {
        await sql`ALTER TABLE categories ADD COLUMN IF NOT EXISTS warm_image_url text`;
      } catch (_) {}
      try {
        await sql`ALTER TABLE categories ADD COLUMN IF NOT EXISTS focus_image_url text`;
      } catch (_) {}

      // Automatically ensure coupon_codes table exists with all required columns
      try {
        await sql`
          CREATE TABLE IF NOT EXISTS coupon_codes (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            code varchar(50) NOT NULL UNIQUE,
            discount_type varchar(20) NOT NULL,
            discount_value numeric(10, 2) NOT NULL,
            min_order_amount numeric(10, 2),
            max_discount numeric(10, 2),
            usage_limit integer,
            used_count integer DEFAULT 0 NOT NULL,
            starts_at timestamp with time zone,
            ends_at timestamp with time zone,
            is_active boolean DEFAULT true NOT NULL,
            created_at timestamp with time zone DEFAULT now() NOT NULL
          )
        `;
        await sql`CREATE INDEX IF NOT EXISTS coupon_codes_active_idx ON coupon_codes (is_active)`;
        await sql`CREATE INDEX IF NOT EXISTS coupon_codes_code_idx ON coupon_codes (code)`;
        await sql`ALTER TABLE coupon_codes ADD COLUMN IF NOT EXISTS max_discount numeric(10, 2)`;
        await sql`ALTER TABLE coupon_codes ADD COLUMN IF NOT EXISTS usage_limit integer`;
        await sql`ALTER TABLE coupon_codes ADD COLUMN IF NOT EXISTS used_count integer DEFAULT 0 NOT NULL`;
        await sql`ALTER TABLE coupon_codes ADD COLUMN IF NOT EXISTS starts_at timestamp with time zone`;
        await sql`ALTER TABLE coupon_codes ADD COLUMN IF NOT EXISTS ends_at timestamp with time zone`;
      } catch (cpTblErr: any) {
        console.warn('Coupon codes table check note:', cpTblErr.message);
      }

      // Automatically ensure notifications table exists with all required columns
      try {
        await sql`
          CREATE TABLE IF NOT EXISTS notifications (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid REFERENCES users(id) ON DELETE SET NULL,
            title varchar(255) NOT NULL,
            message text NOT NULL,
            type varchar(50) NOT NULL DEFAULT 'info',
            link varchar(500),
            is_read boolean NOT NULL DEFAULT false,
            created_at timestamptz NOT NULL DEFAULT now()
          )
        `;
        await sql`CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications (user_id)`;
        await sql`CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON notifications (is_read)`;
        await sql`CREATE INDEX IF NOT EXISTS notifications_created_idx ON notifications (created_at)`;

        // Automatically backfill initial notifications from existing DB orders, users, and subscribers if empty
        const notifCount = await sql`SELECT count(*)::int as count FROM notifications`;
        if (notifCount && notifCount[0]?.count === 0) {
          const recentOrders = await sql`SELECT id, order_number, user_id, total, items, shipping_address, created_at FROM orders ORDER BY created_at DESC LIMIT 5`;
          for (const o of recentOrders) {
            const items = Array.isArray(o.items) ? o.items : [];
            const email = o.shipping_address?.email || 'Customer';
            await sql`
              INSERT INTO notifications (user_id, title, message, type, link, is_read, created_at)
              VALUES (
                ${o.user_id}, 
                'New Order Placed', 
                ${'Order #' + o.order_number + ' received for Rs. ' + Number(o.total).toLocaleString() + ' (' + items.length + ' items) by ' + email},
                'order',
                'orders',
                false,
                ${o.created_at}
              )
            `;
          }
          const recentUsers = await sql`SELECT id, name, email, created_at FROM users WHERE role = 'customer' ORDER BY created_at DESC LIMIT 5`;
          for (const u of recentUsers) {
            await sql`
              INSERT INTO notifications (user_id, title, message, type, link, is_read, created_at)
              VALUES (
                ${u.id},
                'New Customer Registered',
                ${(u.name || 'New Customer') + ' (' + u.email + ') registered on Ravenza'},
                'user',
                'customers',
                false,
                ${u.created_at}
              )
            `;
          }
          const recentSubs = await sql`SELECT id, email, subscribed_at FROM newsletter_subscribers ORDER BY subscribed_at DESC LIMIT 5`;
          for (const s of recentSubs) {
            await sql`
              INSERT INTO notifications (title, message, type, link, is_read, created_at)
              VALUES (
                'New Newsletter Subscriber',
                ${s.email + ' subscribed to Ravenza VIP updates'},
                'newsletter',
                'newsletter',
                false,
                ${s.subscribed_at}
              )
            `;
          }
          console.log('✅ Backfilled initial notifications from DB records');
        }
      } catch (notifTblErr: any) {
        console.warn('Notifications table check note:', notifTblErr.message);
      }

      // Automatically ensure order_items table exists with all required columns
      try {
        await sql`
          CREATE TABLE IF NOT EXISTS order_items (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            order_id uuid NOT NULL,
            product_id uuid NOT NULL,
            product_name varchar(200),
            variant_id uuid,
            quantity integer NOT NULL,
            unit_price numeric(10, 2) NOT NULL,
            total_price numeric(10, 2),
            sku varchar(50),
            size varchar(20),
            color varchar(50),
            created_at timestamptz NOT NULL DEFAULT now()
          )
        `;
        await sql`CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items (order_id)`;
      } catch (oiTblErr: any) {
        console.warn('Order items table check note:', oiTblErr.message);
      }

      // Sync coupons from Neon DB
      try {
        const dbCoupons = await sql`SELECT * FROM coupon_codes ORDER BY created_at DESC`;
        if (dbCoupons && dbCoupons.length > 0) {
          couponsStore = dbCoupons.map((c: any) => ({
            id: c.id,
            code: c.code,
            discount_type: c.discount_type,
            discount_value: Number(c.discount_value),
            min_order_amount: c.min_order_amount ? Number(c.min_order_amount) : 0,
            max_discount: c.max_discount ? Number(c.max_discount) : undefined,
            usage_limit: c.usage_limit ? Number(c.usage_limit) : undefined,
            used_count: Number(c.used_count || 0),
            starts_at: c.starts_at ? new Date(c.starts_at).toISOString() : null,
            ends_at: c.ends_at ? new Date(c.ends_at).toISOString() : null,
            is_active: c.is_active !== false,
            created_at: c.created_at ? new Date(c.created_at).toISOString() : new Date().toISOString(),
          }));
          console.log(`✅ Loaded ${couponsStore.length} coupons from Neon DB`);
        } else {
          // Seed initial coupons into database if empty
          for (const ic of initialCoupons) {
            try {
              await sql`
                INSERT INTO coupon_codes (code, discount_type, discount_value, min_order_amount, is_active)
                VALUES (${ic.code}, ${ic.discount_type}, ${ic.discount_value}, ${ic.min_order_amount || 0}, ${ic.is_active})
                ON CONFLICT (code) DO NOTHING
              `;
            } catch (_) {}
          }
        }
      } catch (cFetchErr: any) {
        console.warn('Coupon codes fetch note:', cFetchErr.message);
      }

      // Automatically ensure orders table has payment_status and sync orders
      try {
        await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status varchar(30) DEFAULT 'unpaid'`;
        const dbOrders = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
        if (dbOrders && dbOrders.length > 0) {
          ordersStore = dbOrders.map((r: any) => ({
            id: r.id,
            order_number: r.order_number,
            tracking_id: r.tracking_number || `TRK-${r.order_number}`,
            tracking_number: r.tracking_number || `TRK-${r.order_number}`,
            user_id: r.user_id,
            total: Number(r.total),
            subtotal: Number(r.subtotal),
            shipping_cost: Number(r.shipping_cost),
            discount_amount: Number(r.discount_amount || 0),
            discount_code: r.discount_code,
            status: r.status,
            payment_status: r.payment_status || 'unpaid',
            payment_method: r.payment_method,
            shipping_address: r.shipping_address,
            billing_address: r.billing_address,
            order_notes: r.order_notes,
            items: r.items,
            date: r.created_at,
            created_at: r.created_at,
          }));
          console.log(`✅ Loaded ${ordersStore.length} orders from Neon DB`);
        }
      } catch (ordErr: any) {
        console.warn('Orders Neon sync note:', ordErr.message);
      }

      // Check if Admin exists in Neon DB users table
      try {
        const dbAdmins = await sql`SELECT id FROM users WHERE role = 'admin' LIMIT 1`;
        if (!dbAdmins || dbAdmins.length === 0) {
          await sql`
            INSERT INTO users (email, name, role, is_verified, is_active, password)
            VALUES ('admin@ravenza.pk', 'Admin', 'admin', true, true, 'admin123')
            ON CONFLICT (email) DO UPDATE SET role = 'admin', is_active = true
          `;
          console.log('✅ Created default admin in Neon DB users table');
        }
      } catch (admErr: any) {
        console.warn('Admin check note:', admErr.message);
      }
    } catch (tblErr: any) {
      console.warn('Neon tables check note:', tblErr.message);
    }
  } catch (err: any) {
    console.error('Initial Neon sync warning:', err.message);
  }
}
let warmChaptersStore = [...initialWarmChapters];
let collectionsStore = [...initialCollections];
let reviewsStore = [...initialReviews];
let ordersStore = [...initialOrders];
let faqsStore = [...initialFaqs];
let addressesStore: any[] = [
  {
    id: 'addr-seed-1',
    user_id: 'default_user',
    user_email: 'ahmed.khan@gmail.com',
    type: 'shipping',
    address_line_1: '123 Main Boulevard, Phase 6',
    address_line_2: 'Apartment 4B',
    city: 'Lahore',
    region: 'Punjab',
    postal_code: '54000',
    phone: '+923001234567',
    is_default: true,
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 'addr-seed-2',
    user_id: 'default_user',
    user_email: 'sara.ali@gmail.com',
    type: 'shipping',
    address_line_1: '456 Garden Town',
    address_line_2: 'House 12',
    city: 'Karachi',
    region: 'Sindh',
    postal_code: '74000',
    phone: '+923002345678',
    is_default: true,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  }
];
let journalStore = [...initialJournal];
let couponsStore = [...initialCoupons];
let newsletterStore: { id: string; email: string; date: string; is_active: boolean }[] = [
  { id: 'sub-1', email: 'ahmed.khan@gmail.com', date: '2024-01-20', is_active: true },
  { id: 'sub-2', email: 'sara.ali@gmail.com', date: '2024-02-14', is_active: true },
];

let emailCampaignsStore: {
  id: string;
  name: string;
  subject: string;
  content: string;
  target_audience: string;
  status: 'draft' | 'scheduled' | 'sent';
  recipients: number;
  sent_at?: string;
  scheduled_at?: string;
  created_at: string;
}[] = [
  {
    id: 'camp-1',
    name: 'Winter Drop Announcement',
    subject: 'New Winter Collection is Here! 🎉',
    content: 'Check out our newly dropped heavyweight hoodies and thermal streetwear sets.',
    target_audience: 'all',
    status: 'sent',
    recipients: 1250,
    sent_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 'camp-2',
    name: 'VIP Flash Sale',
    subject: 'Flash Sale: 20% Off Everything! ⚡',
    content: 'Exclusive 24-hour flash sale for our subscribers. Use code RAVENZA20 at checkout.',
    target_audience: 'subscribers',
    status: 'draft',
    recipients: 0,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  }
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
  const subcategory = p.subcategory_id ? catMap.get(p.subcategory_id) : null;
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
    category_id: p.category_id || category?.id || null,
    subcategory_id: p.subcategory_id || subcategory?.id || null,
    category_slug: category?.slug || p.category_slug || p.category || 'uncategorized',
    category_name: category?.name || p.category_name || 'Uncategorized',
    subcategory_slug: subcategory?.slug || p.subcategory_slug || null,
    subcategory_name: subcategory?.name || p.subcategory_name || null,
    category: category?.slug || p.category_slug || p.category || 'uncategorized',
    sizes: p.attributes?.sizes || ['S', 'M', 'L', 'XL'],
    colors: p.attributes?.colors || ['Black'],
    stockCount: (() => {
      const matrix = Array.isArray(p.variants_matrix) 
        ? p.variants_matrix 
        : (typeof p.variants_matrix === 'string' ? (() => { try { return JSON.parse(p.variants_matrix); } catch { return []; } })() : []);
      if (matrix && matrix.length > 0) {
        return matrix.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0);
      }
      if (typeof p.stockCount === 'number') return p.stockCount;
      if (typeof p.stock === 'number') return p.stock;
      return 50;
    })(),
    low_stock_threshold: Number(p.low_stock_threshold ?? 4),
    inStock: (() => {
      const matrix = Array.isArray(p.variants_matrix) 
        ? p.variants_matrix 
        : (typeof p.variants_matrix === 'string' ? (() => { try { return JSON.parse(p.variants_matrix); } catch { return []; } })() : []);
      if (matrix && matrix.length > 0) {
        return matrix.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0) > 0;
      }
      const count = typeof p.stockCount === 'number' ? p.stockCount : (typeof p.stock === 'number' ? p.stock : 50);
      return count > 0;
    })(),
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

 // server.ts ke shuruwat mein ye middleware update karo

app.use(cors());
// Limit ko 50mb kar do (Base64 strings heavy hote hain)
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ye error handler sabse neeche hona chahiye, lekin routes se pehle
app.use((err: any, req: any, res: any, next: any) => {
  // Check for Payload Too Large specific errors
  if (err.type === 'entity.too.large' || err.status === 413 || (err.message && err.message.includes('too large'))) {
    console.warn('⚠️ Payload Too Large detected:', err.message);
    return res.status(413).json({
      message: 'Image size is too large. Please try a smaller image or refresh the page.',
      error: 'PayloadTooLargeError'
    });
  }
  next(err);
});

  // Optional authentication token decoder
  const optionalAuth = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      if (token === 'mock-admin-token') {
        req.user = { id: 'admin-01', email: 'admin@ravenza.pk', role: 'admin', name: 'Ravenza Administrator' };
      } else {
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          req.user = decoded;
        } catch (e) {
          // invalid token, ignore
        }
      }
    }
    next();
  };

  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    if (token === 'mock-admin-token') {
      req.user = { id: 'admin-01', email: 'admin@ravenza.pk', role: 'admin', name: 'Ravenza Administrator' };
      return next();
    }

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

      // Insert notification for new customer registration
      if (sql) {
        try {
          await sql`
            INSERT INTO notifications (user_id, title, message, type, link, is_read, created_at)
            VALUES (
              ${newUserId.startsWith('user-') ? null : newUserId},
              'New Customer Registered',
              ${(newUser.name || 'New Customer') + ' (' + newUser.email + ') registered an account.'},
              'user',
              'customers',
              false,
              NOW()
            )
          `;
        } catch (nErr: any) {
          console.warn('Registration notification insert error:', nErr.message);
        }
      }
      adminNotificationsStore.unshift({
        id: `notif-reg-${Date.now()}`,
        title: 'New Customer Registered',
        message: `${newUser.name || 'New Customer'} (${newUser.email}) registered an account.`,
        type: 'user',
        link: 'customers',
        is_read: false,
        created_at: new Date().toISOString()
      });

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
          const rows = await sql`
            SELECT p.*, 
              c.name as category_name, c.slug as category_slug,
              sc.name as subcategory_name, sc.slug as subcategory_slug
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN categories sc ON p.subcategory_id = sc.id
            WHERE p.is_active = true
            ORDER BY p.created_at DESC
          `;

          if (rows && rows.length > 0) {
            let result = rows.map((r: any) => formatProduct(r, new Map()));

            if (category && category !== 'all') {
              const targetSlug = String(category).toLowerCase();
              const matchingCat = categoriesStore.find(
                (c) => c.slug?.toLowerCase() === targetSlug || c.id === category
              );
              
              if (matchingCat) {
                if (matchingCat.parent_id) {
                  // It is a subcategory - ONLY return products of this subcategory
                  result = result.filter(
                    (p: any) =>
                      p.subcategory_id === matchingCat.id ||
                      p.subcategory_slug?.toLowerCase() === targetSlug ||
                      p.category_id === matchingCat.id ||
                      p.category_slug?.toLowerCase() === targetSlug
                  );
                } else {
                  // It is a main category - return products of this category + its subcategories
                  const childSubcatIds = categoriesStore
                    .filter((c) => c.parent_id === matchingCat.id)
                    .map((c) => c.id);
                  const childSubcatSlugs = categoriesStore
                    .filter((c) => c.parent_id === matchingCat.id)
                    .map((c) => c.slug.toLowerCase());

                  result = result.filter(
                    (p: any) =>
                      p.category_id === matchingCat.id ||
                      p.category_slug?.toLowerCase() === targetSlug ||
                      (p.subcategory_id && childSubcatIds.includes(p.subcategory_id)) ||
                      (p.subcategory_slug && childSubcatSlugs.includes(p.subcategory_slug.toLowerCase()))
                  );
                }
              } else {
                result = result.filter(
                  (p: any) =>
                    p.category?.toLowerCase() === targetSlug ||
                    p.category_slug?.toLowerCase() === targetSlug ||
                    p.subcategory_slug?.toLowerCase() === targetSlug
                );
              }
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
        const targetSlug = String(category).toLowerCase();
        const matchingCat = categoriesStore.find(
          (c) => c.slug?.toLowerCase() === targetSlug || c.id === category
        );
        if (matchingCat) {
          if (matchingCat.parent_id) {
            // Subcategory: ONLY products assigned to this subcategory
            result = result.filter(
              (p) =>
                p.subcategory_id === matchingCat.id ||
                p.category_id === matchingCat.id
            );
          } else {
            // Main category: products of this main category + all child subcategories
            const childSubcatIds = categoriesStore
              .filter((c) => c.parent_id === matchingCat.id)
              .map((c) => c.id);

            result = result.filter(
              (p) =>
                p.category_id === matchingCat.id ||
                (p.subcategory_id && childSubcatIds.includes(p.subcategory_id))
            );
          }
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

  // Direct file upload endpoint for base64 / data URL
  app.post('/api/upload', (req, res) => {
    try {
      const { data, image } = req.body;
      const fileData = data || image;
      if (!fileData) {
        return res.status(400).json({ message: 'No file data received' });
      }
      return res.json({ url: fileData, message: 'Image uploaded successfully' });
    } catch (err: any) {
      return res.status(500).json({ message: 'Upload failed', error: err.message });
    }
  });

  app.post('/api/products', optionalAuth, async (req, res) => {
    try {
      const b = req.body;
      const name = b.name;
      if (!name) {
        return res.status(400).json({ message: 'Product name is required' });
      }
      const slug = b.slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || `prod-${Date.now()}`;
      const basePrice = Number(b.base_price !== undefined ? b.base_price : b.price) || 0;
      const comparePrice = (b.compare_at_price !== undefined && b.compare_at_price !== null && b.compare_at_price !== '')
        ? Number(b.compare_at_price)
        : null;
      const costPrice = (b.cost_price !== undefined && b.cost_price !== null && b.cost_price !== '')
        ? Number(b.cost_price)
        : null;

      const categoryId = resolveCategoryUuid(b.category_id);
      const subcategoryId = resolveCategoryUuid(b.subcategory_id);

      const brand = b.brand || 'RAVENZA';
      const sku = b.sku || `RVZ-${Date.now().toString().slice(-4)}`;
      const fabric = b.fabric || '';
      const fabricComposition = b.fabric_composition || '';
      const fabricFinish = b.fabric_finish || '';
      const fit = b.fit || '';
      const graphicPrint = b.graphic_print || '';
      const garmentSpecs = b.garment_specs || '';
      const garmentCare = b.garment_care || '';
      const shippingDelivery = b.shipping_delivery || '';
      const modelSize = b.model_size || '';
      const metaTitle = b.meta_title || '';
      const metaDescription = b.meta_description || '';
      const metaKeywords = b.meta_keywords || b.focus_keywords || '';
      const focusKeywords = b.focus_keywords || b.meta_keywords || '';
      const isNewArrival = Boolean(b.is_new_arrival ?? b.isNew ?? true);
      const isBestSeller = Boolean(b.is_best_seller ?? b.is_bestseller ?? b.isBestseller ?? false);
      const isFeatured = Boolean(b.is_featured ?? b.isFeatured ?? false);
      const isSpotlight = Boolean(b.is_spotlight ?? false);
      const isDraft = Boolean(b.is_draft ?? false);
      const status = b.status || (isDraft ? 'draft' : 'active');
      const isActive = Boolean(b.is_active ?? (status !== 'archived' && !isDraft));
      const trackInventory = Boolean(b.track_inventory ?? true);
      const lowStockThreshold = Number(b.low_stock_threshold) || 4;
      const badge = b.badge || null;
      const specs = b.specs || (Array.isArray(b.details) ? b.details.join('\n') : (b.garment_specs || ''));

      const images = Array.isArray(b.images) && b.images.length > 0
        ? b.images
        : [b.image_url || b.image || 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1000&fit=crop'];
      const imageUrl = images[0] || '';

      const attributes = b.attributes || {
        sizes: b.sizes || ['S', 'M', 'L', 'XL'],
        colors: b.colors || ['Black']
      };
      const variantsMatrix = b.variants_matrix || b.variants || [];
      const sizeGuide = b.size_guide || null;

      let savedProduct: any = null;

      if (sql) {
        try {
          const rows = await sql`
            INSERT INTO products (
              name, slug, description, base_price, compare_at_price, cost_price, category_id, subcategory_id,
              brand, sku, fabric, fabric_composition, fabric_finish, fit, graphic_print,
              garment_specs, garment_care, shipping_delivery, model_size,
              meta_title, meta_description, meta_keywords, focus_keywords,
              is_new_arrival, is_best_seller, is_featured, is_spotlight, is_draft,
              track_inventory, low_stock_threshold, badge,
              images, image_url, attributes, variants_matrix, size_guide, specs, status, is_active
            ) VALUES (
              ${name}, ${slug}, ${b.description || ''}, ${basePrice}, ${comparePrice}, ${costPrice}, ${categoryId}, ${subcategoryId},
              ${brand}, ${sku}, ${fabric}, ${fabricComposition}, ${fabricFinish}, ${fit}, ${graphicPrint},
              ${garmentSpecs}, ${garmentCare}, ${shippingDelivery}, ${modelSize},
              ${metaTitle}, ${metaDescription}, ${metaKeywords}, ${focusKeywords},
              ${isNewArrival}, ${isBestSeller}, ${isFeatured}, ${isSpotlight}, ${isDraft},
              ${trackInventory}, ${lowStockThreshold}, ${badge},
              ${JSON.stringify(images)}, ${imageUrl}, ${JSON.stringify(attributes)}, ${JSON.stringify(variantsMatrix)},
              ${sizeGuide ? JSON.stringify(sizeGuide) : null}, ${specs}, ${status}, ${isActive}
            )
            RETURNING *
          `;
          if (rows && rows.length > 0) {
            savedProduct = rows[0];
          }
        } catch (e: any) {
          console.error('Neon insert product error:', e);
          if (e.message && e.message.includes('unique constraint') && e.message.includes('slug')) {
            const uniqueSlug = `${slug}-${Date.now().toString().slice(-4)}`;
            const rows = await sql`
              INSERT INTO products (
                name, slug, description, base_price, compare_at_price, cost_price, category_id, subcategory_id,
                brand, sku, fabric, fabric_composition, fabric_finish, fit, graphic_print,
                garment_specs, garment_care, shipping_delivery, model_size,
                meta_title, meta_description, meta_keywords, focus_keywords,
                is_new_arrival, is_best_seller, is_featured, is_spotlight, is_draft,
                track_inventory, low_stock_threshold, badge,
                images, image_url, attributes, variants_matrix, size_guide, specs, status, is_active
              ) VALUES (
                ${name}, ${uniqueSlug}, ${b.description || ''}, ${basePrice}, ${comparePrice}, ${costPrice}, ${categoryId}, ${subcategoryId},
                ${brand}, ${sku}, ${fabric}, ${fabricComposition}, ${fabricFinish}, ${fit}, ${graphicPrint},
                ${garmentSpecs}, ${garmentCare}, ${shippingDelivery}, ${modelSize},
                ${metaTitle}, ${metaDescription}, ${metaKeywords}, ${focusKeywords},
                ${isNewArrival}, ${isBestSeller}, ${isFeatured}, ${isSpotlight}, ${isDraft},
                ${trackInventory}, ${lowStockThreshold}, ${badge},
                ${JSON.stringify(images)}, ${imageUrl}, ${JSON.stringify(attributes)}, ${JSON.stringify(variantsMatrix)},
                ${sizeGuide ? JSON.stringify(sizeGuide) : null}, ${specs}, ${status}, ${isActive}
              )
              RETURNING *
            `;
            if (rows && rows.length > 0) savedProduct = rows[0];
          } else {
            throw e;
          }
        }
      }

      if (!savedProduct) {
        savedProduct = {
          id: `prod-${Date.now()}`,
          name, slug, description: b.description || '',
          base_price: basePrice, compare_at_price: comparePrice, cost_price: costPrice,
          category_id: categoryId || 'cat-1', subcategory_id: subcategoryId,
          brand, sku, fabric, fabric_composition: fabricComposition, fabric_finish: fabricFinish, fit, graphic_print: graphicPrint,
          garment_specs: garmentSpecs, garment_care: garmentCare, shipping_delivery: shippingDelivery, model_size: modelSize,
          meta_title: metaTitle, meta_description: metaDescription, meta_keywords: metaKeywords, focus_keywords: focusKeywords,
          is_new_arrival: isNewArrival, is_best_seller: isBestSeller, is_featured: isFeatured, is_spotlight: isSpotlight, is_draft: isDraft,
          track_inventory: trackInventory, low_stock_threshold: lowStockThreshold, badge,
          images, image_url: imageUrl, attributes, variants_matrix: variantsMatrix, size_guide: sizeGuide,
          specs, status, is_active: isActive, created_at: new Date().toISOString()
        };
      }

      productsStore.unshift(savedProduct);
      logAdminAudit('Product Created', savedProduct.name, 'Admin', `Price: ${savedProduct.base_price}`);
      const catMap = new Map(categoriesStore.map((c) => [c.id, c]));
      return res.status(201).json(formatProduct(savedProduct, catMap));
    } catch (err: any) {
      console.error('Create product error:', err);
      res.status(500).json({ message: 'Error creating product: ' + err.message, error: err.message });
    }
  });

  app.put('/api/products/:id', optionalAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const b = req.body;
      const images = Array.isArray(b.images) && b.images.length > 0 ? b.images : (b.image ? [b.image] : undefined);
      const attributes = b.attributes || (b.sizes || b.colors ? { sizes: b.sizes, colors: b.colors } : undefined);
      const categoryId = b.category_id !== undefined ? resolveCategoryUuid(b.category_id) : undefined;
      const subcategoryId = b.subcategory_id !== undefined ? resolveCategoryUuid(b.subcategory_id) : undefined;

      const basePrice = (b.base_price !== undefined || b.price !== undefined)
        ? Number(b.base_price !== undefined ? b.base_price : b.price)
        : undefined;
      const comparePrice = b.compare_at_price !== undefined
        ? (b.compare_at_price !== null && b.compare_at_price !== '' ? Number(b.compare_at_price) : null)
        : undefined;
      const costPrice = b.cost_price !== undefined
        ? (b.cost_price !== null && b.cost_price !== '' ? Number(b.cost_price) : null)
        : undefined;

      const isNewArrival = (b.is_new_arrival !== undefined || b.isNew !== undefined)
        ? Boolean(b.is_new_arrival ?? b.isNew)
        : undefined;
      const isBestSeller = (b.is_best_seller !== undefined || b.is_bestseller !== undefined || b.isBestseller !== undefined)
        ? Boolean(b.is_best_seller ?? b.is_bestseller ?? b.isBestseller)
        : undefined;
      const isFeatured = (b.is_featured !== undefined || b.isFeatured !== undefined)
        ? Boolean(b.is_featured ?? b.isFeatured)
        : undefined;
      const isSpotlight = b.is_spotlight !== undefined ? Boolean(b.is_spotlight) : undefined;
      const isDraft = b.is_draft !== undefined ? Boolean(b.is_draft) : undefined;
      const status = b.status !== undefined ? b.status : undefined;
      const isActive = b.is_active !== undefined ? Boolean(b.is_active) : (isDraft !== undefined ? !isDraft : undefined);
      const trackInventory = b.track_inventory !== undefined ? Boolean(b.track_inventory) : undefined;
      const lowStockThreshold = b.low_stock_threshold !== undefined ? Number(b.low_stock_threshold) : undefined;
      const specs = b.specs !== undefined ? b.specs : (Array.isArray(b.details) ? b.details.join('\n') : undefined);

      let updatedProduct: any = null;

      if (sql) {
        try {
          const rows = await sql`
            UPDATE products SET
              name = COALESCE(${b.name ?? null}, name),
              slug = COALESCE(${b.slug ?? null}, slug),
              description = COALESCE(${b.description ?? null}, description),
              base_price = COALESCE(${basePrice ?? null}, base_price),
              compare_at_price = ${comparePrice !== undefined ? comparePrice : sql`compare_at_price`},
              cost_price = ${costPrice !== undefined ? costPrice : sql`cost_price`},
              category_id = ${categoryId !== undefined ? categoryId : sql`category_id`},
              subcategory_id = ${subcategoryId !== undefined ? subcategoryId : sql`subcategory_id`},
              brand = COALESCE(${b.brand ?? null}, brand),
              sku = COALESCE(${b.sku ?? null}, sku),
              fabric = COALESCE(${b.fabric ?? null}, fabric),
              fabric_composition = COALESCE(${b.fabric_composition ?? null}, fabric_composition),
              fabric_finish = COALESCE(${b.fabric_finish ?? null}, fabric_finish),
              fit = COALESCE(${b.fit ?? null}, fit),
              graphic_print = COALESCE(${b.graphic_print ?? null}, graphic_print),
              garment_specs = COALESCE(${b.garment_specs ?? null}, garment_specs),
              garment_care = COALESCE(${b.garment_care ?? null}, garment_care),
              shipping_delivery = COALESCE(${b.shipping_delivery ?? null}, shipping_delivery),
              model_size = COALESCE(${b.model_size ?? null}, model_size),
              meta_title = COALESCE(${b.meta_title ?? null}, meta_title),
              meta_description = COALESCE(${b.meta_description ?? null}, meta_description),
              meta_keywords = COALESCE(${b.meta_keywords ?? b.focus_keywords ?? null}, meta_keywords),
              focus_keywords = COALESCE(${b.focus_keywords ?? b.meta_keywords ?? null}, focus_keywords),
              is_new_arrival = COALESCE(${isNewArrival ?? null}, is_new_arrival),
              is_best_seller = COALESCE(${isBestSeller ?? null}, is_best_seller),
              is_featured = COALESCE(${isFeatured ?? null}, is_featured),
              is_spotlight = COALESCE(${isSpotlight ?? null}, is_spotlight),
              is_draft = COALESCE(${isDraft ?? null}, is_draft),
              track_inventory = COALESCE(${trackInventory ?? null}, track_inventory),
              low_stock_threshold = COALESCE(${lowStockThreshold ?? null}, low_stock_threshold),
              badge = ${b.badge !== undefined ? b.badge : sql`badge`},
              images = COALESCE(${images ? JSON.stringify(images) : null}, images),
              image_url = COALESCE(${images && images[0] ? images[0] : null}, image_url),
              attributes = COALESCE(${attributes ? JSON.stringify(attributes) : null}, attributes),
              variants_matrix = COALESCE(${b.variants_matrix ? JSON.stringify(b.variants_matrix) : null}, variants_matrix),
              size_guide = ${b.size_guide !== undefined ? (b.size_guide ? JSON.stringify(b.size_guide) : null) : sql`size_guide`},
              specs = COALESCE(${specs ?? null}, specs),
              status = COALESCE(${status ?? null}, status),
              is_active = COALESCE(${isActive ?? null}, is_active),
              updated_at = NOW()
            WHERE id::text = ${id} OR slug = ${id}
            RETURNING *
          `;
          if (rows && rows.length > 0) {
            updatedProduct = rows[0];
          }
        } catch (e: any) {
          console.error('Neon update product error:', e);
          throw e;
        }
      }

      const catMap = new Map(categoriesStore.map((c) => [c.id, c]));

      if (updatedProduct) {
        const idx = productsStore.findIndex((p) => p.id === updatedProduct.id || p.slug === updatedProduct.slug || p.id === id || p.slug === id);
        if (idx !== -1) {
          productsStore[idx] = { ...productsStore[idx], ...updatedProduct };
        } else {
          productsStore.push(updatedProduct);
        }
        logAdminAudit('Product Updated', updatedProduct.name, 'Admin', `Price: ${updatedProduct.base_price}`);
        return res.json(formatProduct(updatedProduct, catMap));
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
        logAdminAudit('Product Updated', productsStore[index].name, 'Admin', `Price: ${productsStore[index].base_price}`);
        return res.json(formatProduct(productsStore[index], catMap));
      }

      logAdminAudit('Product Updated', id, 'Admin');
      res.status(404).json({ message: 'Product not found' });
    } catch (err: any) {
      console.error('Error updating product:', err);
      res.status(500).json({ message: 'Error updating product: ' + err.message, error: err.message });
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
      const name = b.name;
      if (!name) {
        return res.status(400).json({ message: 'Category name is required' });
      }
      const slug = b.slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || `cat-${Date.now()}`;
      const parentId = resolveCategoryUuid(b.parent_id);
      const sortOrder = Number(b.sort_order) || 0;
      const isFeatured = Boolean(b.is_featured_in_focus);
      const displayOrderInFocus = Number(b.display_order_in_focus) || 0;
      const isWarmChapter = Boolean(b.is_warm_chapter);
      const displayOrderWarmChapter = Number(b.display_order_warm_chapter) || 0;
      const isActive = b.is_active !== undefined ? Boolean(b.is_active) : true;

      let savedCat: any = null;

      if (sql) {
        try {
          const rows = await sql`
            INSERT INTO categories (
              name, slug, description, badge, tag, cover_image_url, warm_image_url, focus_image_url, parent_id, sort_order,
              is_active, is_featured_in_focus, display_order_in_focus, is_warm_chapter, display_order_warm_chapter
            ) VALUES (
              ${name}, ${slug}, ${b.description || ''}, ${b.badge || null}, ${b.tag || null},
              ${b.cover_image_url || null}, ${b.warm_image_url || null}, ${b.focus_image_url || null}, ${parentId}, ${sortOrder},
              ${isActive}, ${isFeatured}, ${displayOrderInFocus},
              ${isWarmChapter}, ${displayOrderWarmChapter}
            )
            RETURNING *
          `;
          if (rows && rows.length > 0) {
            savedCat = rows[0];
          }
        } catch (e: any) {
          console.error('Neon insert category error:', e);
          if (e.message && e.message.includes('unique constraint') && e.message.includes('slug')) {
            const uniqueSlug = `${slug}-${Date.now().toString().slice(-4)}`;
            const rows = await sql`
              INSERT INTO categories (
                name, slug, description, badge, tag, cover_image_url, warm_image_url, focus_image_url, parent_id, sort_order,
                is_active, is_featured_in_focus, display_order_in_focus, is_warm_chapter, display_order_warm_chapter
              ) VALUES (
                ${name}, ${uniqueSlug}, ${b.description || ''}, ${b.badge || null}, ${b.tag || null},
                ${b.cover_image_url || null}, ${b.warm_image_url || null}, ${b.focus_image_url || null}, ${parentId}, ${sortOrder},
                ${isActive}, ${isFeatured}, ${displayOrderInFocus},
                ${isWarmChapter}, ${displayOrderWarmChapter}
              )
              RETURNING *
            `;
            if (rows && rows.length > 0) savedCat = rows[0];
          } else {
            throw e;
          }
        }
      }

      if (!savedCat) {
        savedCat = {
          id: `cat-${Date.now()}`,
          name,
          slug,
          description: b.description || '',
          badge: b.badge || null,
          tag: b.tag || null,
          cover_image_url: b.cover_image_url || '',
          warm_image_url: b.warm_image_url || '',
          focus_image_url: b.focus_image_url || '',
          parent_id: parentId,
          sort_order: sortOrder,
          is_active: isActive,
          is_featured_in_focus: isFeatured,
          display_order_in_focus: displayOrderInFocus,
          is_warm_chapter: isWarmChapter,
          display_order_warm_chapter: displayOrderWarmChapter,
          created_at: new Date().toISOString(),
        };
      }

      categoriesStore.push(savedCat);
      logAdminAudit('Category Created', savedCat.name, 'Admin', `Slug: ${savedCat.slug}`);
      res.status(201).json(savedCat);
    } catch (err: any) {
      console.error('Create category error:', err);
      res.status(500).json({ message: 'Error creating category: ' + err.message, error: err.message });
    }
  };

  app.post('/api/categories', optionalAuth, handleCategoryCreate);
  app.post('/api/categories/new', optionalAuth, handleCategoryCreate);

  app.put('/api/categories/:id', optionalAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const b = req.body;
      const parentId = b.parent_id !== undefined ? resolveCategoryUuid(b.parent_id) : undefined;
      let updatedCat: any = null;

      if (sql) {
        try {
          const rows = await sql`
            UPDATE categories SET
              name = COALESCE(${b.name ?? null}, name),
              slug = COALESCE(${b.slug ?? null}, slug),
              description = COALESCE(${b.description ?? null}, description),
              badge = ${b.badge !== undefined ? b.badge : sql`badge`},
              tag = ${b.tag !== undefined ? b.tag : sql`tag`},
              cover_image_url = ${b.cover_image_url !== undefined ? (b.cover_image_url || null) : sql`cover_image_url`},
              warm_image_url = ${b.warm_image_url !== undefined ? (b.warm_image_url || null) : sql`warm_image_url`},
              focus_image_url = ${b.focus_image_url !== undefined ? (b.focus_image_url || null) : sql`focus_image_url`},
              parent_id = ${parentId !== undefined ? parentId : sql`parent_id`},
              sort_order = COALESCE(${b.sort_order !== undefined ? Number(b.sort_order) : null}, sort_order),
              is_active = COALESCE(${b.is_active !== undefined ? Boolean(b.is_active) : null}, is_active),
              is_featured_in_focus = COALESCE(${b.is_featured_in_focus !== undefined ? Boolean(b.is_featured_in_focus) : null}, is_featured_in_focus),
              display_order_in_focus = COALESCE(${b.display_order_in_focus !== undefined ? Number(b.display_order_in_focus) : null}, display_order_in_focus),
              is_warm_chapter = COALESCE(${b.is_warm_chapter !== undefined ? Boolean(b.is_warm_chapter) : null}, is_warm_chapter),
              display_order_warm_chapter = COALESCE(${b.display_order_warm_chapter !== undefined ? Number(b.display_order_warm_chapter) : null}, display_order_warm_chapter),
              updated_at = NOW()
            WHERE id::text = ${id} OR slug = ${id}
            RETURNING *
          `;
          if (rows && rows.length > 0) {
            updatedCat = rows[0];
          }
        } catch (e: any) {
          console.error('Neon update category error:', e);
          throw e;
        }
      }

      if (updatedCat) {
        const idx = categoriesStore.findIndex((c) => c.id === updatedCat.id || c.slug === updatedCat.slug || c.id === id || c.slug === id);
        if (idx !== -1) {
          categoriesStore[idx] = { ...categoriesStore[idx], ...updatedCat };
        } else {
          categoriesStore.push(updatedCat);
        }
        logAdminAudit('Category Updated', updatedCat.name, 'Admin', `Fields updated: ${Object.keys(b).join(', ')}`);
        return res.json(categoriesStore[idx !== -1 ? idx : categoriesStore.length - 1]);
      }

      const index = categoriesStore.findIndex((c) => c.id === id || c.slug === id);
      if (index !== -1) {
        categoriesStore[index] = { ...categoriesStore[index], ...b };
        logAdminAudit('Category Updated', categoriesStore[index].name, 'Admin', `Fields updated: ${Object.keys(b).join(', ')}`);
        return res.json(categoriesStore[index]);
      }

      logAdminAudit('Category Updated', id, 'Admin');
      res.status(404).json({ message: 'Category not found' });
    } catch (err: any) {
      console.error('Update category error:', err);
      res.status(500).json({ message: 'Error updating category: ' + err.message, error: err.message });
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
      const isAdmin = req.user?.role === 'admin';
      const requestedUserId = (req.query.user_id as string)?.trim();
      const requestedEmail = (req.query.email as string)?.trim().toLowerCase();
      
      const targetUserId = requestedUserId || (req.user && !isAdmin ? req.user.id : null);
      const targetEmail = requestedEmail || (req.user && !isAdmin ? (req.user.email || '').toLowerCase().trim() : null);

      if (sql) {
        try {
          let rows: any[] = [];
          if (targetUserId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetUserId)) {
            if (targetEmail) {
              rows = await sql`
                SELECT * FROM orders 
                WHERE user_id = ${targetUserId} OR LOWER(shipping_address->>'email') = ${targetEmail}
                ORDER BY created_at DESC
              `;
            } else {
              rows = await sql`
                SELECT * FROM orders 
                WHERE user_id = ${targetUserId}
                ORDER BY created_at DESC
              `;
            }
          } else if (targetEmail) {
            rows = await sql`
              SELECT * FROM orders 
              WHERE LOWER(shipping_address->>'email') = ${targetEmail}
              ORDER BY created_at DESC
            `;
          } else if (isAdmin) {
            rows = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
          } else {
            // Unauthenticated or non-admin with no user ID/email -> RETURN EMPTY ARRAY to prevent leakage
            return res.json([]);
          }

          if (rows) {
            return res.json(rows.map((r: any) => ({
              id: r.id,
              order_number: r.order_number,
              tracking_id: r.tracking_number || `TRK-${r.order_number}`,
              tracking_number: r.tracking_number || `TRK-${r.order_number}`,
              user_id: r.user_id,
              total: Number(r.total),
              subtotal: Number(r.subtotal),
              shipping_cost: Number(r.shipping_cost),
              discount_amount: Number(r.discount_amount || 0),
              discount_code: r.discount_code,
              status: r.status,
              payment_status: r.payment_status || 'unpaid',
              payment_method: r.payment_method,
              shipping_address: r.shipping_address,
              billing_address: r.billing_address,
              order_notes: r.order_notes,
              items: r.items,
              date: r.created_at,
              created_at: r.created_at,
            })));
          }
        } catch (e) {
          console.error('Neon get orders error:', e);
        }
      }

      // Memory store fallback with strict user check
      if (targetUserId) {
        return res.json(ordersStore.filter((o) => o.user_id === targetUserId || (targetEmail && o.shipping_address?.email?.toLowerCase() === targetEmail)));
      } else if (targetEmail) {
        return res.json(ordersStore.filter((o) => o.shipping_address?.email?.toLowerCase() === targetEmail));
      } else if (isAdmin) {
        return res.json(ordersStore);
      }
      return res.json([]);
    } catch (err: any) {
      res.status(500).json({ message: 'Error retrieving orders', error: err.message });
    }
  });

  // Track Order endpoint with strict ownership verification
  app.get('/api/orders/track/:orderNumber', optionalAuth, async (req, res) => {
    try {
      const { orderNumber } = req.params;
      const cleanNum = (orderNumber || '').trim();
      const currentUserId = req.user?.id || (req.query.user_id as string);
      const currentUserEmail = (req.user?.email || (req.query.email as string) || '').toLowerCase().trim();

      if (!currentUserId && !currentUserEmail && req.user?.role !== 'admin') {
        return res.status(401).json({ 
          message: 'Authentication required. Please sign in to your account first to track this order.' 
        });
      }

      let order: any = null;
      if (sql) {
        try {
          const rows = await sql`
            SELECT * FROM orders 
            WHERE (order_number = ${cleanNum} OR tracking_number = ${cleanNum} OR id::text = ${cleanNum})
            LIMIT 1
          `;
          if (rows && rows.length > 0) {
            order = rows[0];
          }
        } catch (e) {
          console.error('Neon track order query error:', e);
        }
      }

      if (!order) {
        order = ordersStore.find(o => o.order_number === cleanNum || o.tracking_id === cleanNum || o.id === cleanNum);
      }

      if (!order) {
        return res.status(404).json({ message: `Order #${cleanNum} not found in our records.` });
      }

      // Security Check: Verify order belongs to this customer
      const orderUserId = order.user_id;
      const orderEmail = (order.shipping_address?.email || '').toLowerCase().trim();

      const isOwner = (currentUserId && orderUserId && orderUserId === currentUserId) ||
                      (currentUserEmail && orderEmail && currentUserEmail === orderEmail) ||
                      (req.user?.role === 'admin');

      if (!isOwner) {
        return res.status(403).json({
          message: 'Access denied. This order belongs to a different customer account. Please ensure you are logged in with the matching account.'
        });
      }

      res.json({
        id: order.id,
        order_number: order.order_number,
        tracking_number: order.tracking_number || order.tracking_id || `TRK${order.order_number.replace(/\D/g, '')}`,
        status: order.status || 'processing',
        payment_status: order.payment_status || 'unpaid',
        payment_method: order.payment_method || 'cod',
        subtotal: Number(order.subtotal || 0),
        shipping_cost: Number(order.shipping_cost || 0),
        discount_amount: Number(order.discount_amount || 0),
        discount_code: order.discount_code,
        total: Number(order.total || 0),
        shipping_address: order.shipping_address,
        billing_address: order.billing_address,
        order_notes: order.order_notes,
        items: order.items,
        date: order.created_at || order.date,
        created_at: order.created_at || order.date,
        carrier: 'Trax Logistics / TCS Express',
        estimated_delivery: '3-4 Business Days',
      });
    } catch (err: any) {
      res.status(500).json({ message: 'Error tracking order', error: err.message });
    }
  });

  // Generate deterministic secure access token for unauthenticated order detail viewing via email links
  function generateOrderAccessToken(orderNum: string, email: string, orderId?: string): string {
    const cleanNum = (orderNum || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanId = (orderId || '').trim();
    return crypto.createHmac('sha256', JWT_SECRET).update(`${cleanNum}:${cleanEmail}:${cleanId}`).digest('hex').substring(0, 32);
  }

  // Public/tokenized order detail endpoint for unauthenticated customers clicking email links or authenticated owners
  app.get('/api/orders/public-details/:orderId', optionalAuth, async (req, res) => {
    try {
      const { orderId } = req.params;
      const { token } = req.query as { token?: string };
      const cleanKey = (orderId || '').trim();

      let order: any = null;
      if (sql) {
        try {
          const rows = await sql`
            SELECT * FROM orders 
            WHERE (id::text = ${cleanKey} OR order_number = ${cleanKey} OR tracking_number = ${cleanKey})
            LIMIT 1
          `;
          if (rows && rows.length > 0) {
            order = rows[0];
          }
        } catch (e) {
          console.error('Neon public order lookup error:', e);
        }
      }

      if (!order) {
        order = ordersStore.find(o => o.id === cleanKey || o.order_number === cleanKey || o.tracking_id === cleanKey);
      }

      if (!order) {
        return res.status(404).json({ message: 'Order not found in our records.' });
      }

      const orderEmail = (order.email || order.shipping_address?.email || '').toLowerCase().trim();
      const orderUserId = order.user_id;

      // Check authorization:
      // 1. Authenticated user matching user_id or email, or admin
      const isOwnerOrAdmin = (req.user?.id && orderUserId && req.user.id === orderUserId) ||
                             (req.user?.email && orderEmail && req.user.email.toLowerCase() === orderEmail) ||
                             (req.user?.role === 'admin');

      // 2. Token match for unauthenticated access via email link
      let isValidToken = false;
      if (token) {
        const expectedToken1 = generateOrderAccessToken(order.order_number, orderEmail, order.id);
        const expectedToken2 = generateOrderAccessToken(order.order_number, orderEmail, '');
        if (token === expectedToken1 || token === expectedToken2) {
          isValidToken = true;
        }
      }

      if (!isOwnerOrAdmin && !isValidToken) {
        return res.status(403).json({ 
          message: 'Access restricted. Please sign in to your account or access this order via the secure link sent to your confirmation email.' 
        });
      }

      const shippingAddress = order.shipping_address || {};
      const billingAddress = order.billing_address || shippingAddress;

      res.json({
        id: order.id,
        order_number: order.order_number,
        tracking_number: order.tracking_number || order.tracking_id || `TRK${order.order_number.replace(/\D/g, '')}`,
        user_id: order.user_id,
        status: order.status || 'confirmed',
        payment_status: order.payment_status || (order.payment_method === 'cod' ? 'unpaid' : 'paid'),
        payment_method: order.payment_method || 'Cash on Delivery',
        subtotal: Number(order.subtotal || 0),
        shipping_cost: Number(order.shipping_cost || 0),
        discount_amount: Number(order.discount_amount || 0),
        discount_code: order.discount_code || order.coupon_code || null,
        coupon_code: order.discount_code || order.coupon_code || null,
        total: Number(order.total || 0),
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        order_notes: order.order_notes || order.notes || '',
        items: order.items || [],
        email: orderEmail,
        date: order.created_at || order.date,
        created_at: order.created_at || order.date,
        access_token: generateOrderAccessToken(order.order_number, orderEmail, order.id)
      });
    } catch (err: any) {
      res.status(500).json({ message: 'Error retrieving order details', error: err.message });
    }
  });

  // Helper to send order confirmation email via Google Apps Script webhook
  async function sendOrderConfirmationEmail(orderData: any) {
    const webhookUrl = process.env.APPS_SCRIPT_ORDER_WEBHOOK || process.env.ORDER_CONFIRMATION_WEBHOOK_URL;
    const shippingAddress = orderData.shipping_address || orderData.shippingDetails || {};
    const targetEmail = (orderData.email || shippingAddress.email || '').toLowerCase().trim();

    if (!targetEmail) {
      console.log('⚠️ [ORDER CONFIRMATION] No target email specified for order:', orderData.order_number);
      return { success: false, message: 'No target email' };
    }

    const items = (orderData.items || []).map((item: any) => {
      const prod = item.product || item;
      return {
        name: prod.name || item.name || item.product_name || 'Ravenza Garment',
        size: item.size || 'M',
        color: item.color || item.selectedColor || 'Black',
        quantity: Number(item.quantity) || 1,
        price: Number(prod.salePrice || prod.price || item.unit_price || item.price || 0),
        image: prod.image || (prod.images && prod.images[0]) || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200',
      };
    });

    // Generate secure order access token for unauthenticated access from confirmation email link
    const orderAccessToken = generateOrderAccessToken(orderData.order_number, targetEmail, orderData.id);
    const userSnippet = (orderData.user_id || 'guest-usr').toString().slice(0, 8);
    const orderKey = orderData.id || orderData.order_number;
    
    // Resolve base application origin URL
    const appOrigin = (process.env.APP_URL || process.env.VITE_APP_URL || 'http://localhost:3000').replace(/\/+$/, '');
    const orderDetailUrl = `${appOrigin}/order-details/${userSnippet}/${orderKey}?token=${orderAccessToken}`;
    const storeUrl = `${appOrigin}/shop-all`;
    
    const placedDateFormatted = new Date(orderData.created_at || orderData.date || Date.now()).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const payload = {
      email: targetEmail,
      orderNumber: orderData.order_number,
      orderId: orderData.id || orderData.order_number,
      orderAccessToken,
      orderDetailUrl,
      storeUrl,
      placedOnDate: placedDateFormatted,
      trackingNumber: orderData.tracking_id || orderData.tracking_number || '',
      customerName: `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim() || 'Valued Customer',
      status: orderData.status || 'Confirmed',
      total: Number(orderData.total) || 0,
      subtotal: Number(orderData.subtotal) || 0,
      shippingCost: Number(orderData.shipping_cost) || 0,
      discountAmount: Number(orderData.discount_amount) || 0,
      discountCode: orderData.discount_code || orderData.coupon_code || null,
      paymentMethod: orderData.payment_method || 'Cash on Delivery',
      paymentStatus: orderData.payment_status || (orderData.payment_method === 'cod' ? 'Unpaid (COD)' : 'Paid'),
      shippingAddress: {
        name: `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim(),
        address: shippingAddress.address || '',
        apartment: shippingAddress.apartment || '',
        city: shippingAddress.city || '',
        region: shippingAddress.region || shippingAddress.province || '',
        postal_code: shippingAddress.postalCode || '',
        country: 'Pakistan',
        phone: shippingAddress.phone || '',
      },
      billingAddress: orderData.billing_address || shippingAddress,
      orderNotes: orderData.order_notes || orderData.notes || '',
      items,
    };

    console.log(`📧 [ORDER CONFIRMATION] Dispatching to ${targetEmail} for Order #${orderData.order_number}`);

    if (webhookUrl) {
      try {
        const resp = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const resText = await resp.text();
        console.log(`✅ [ORDER CONFIRMATION] Google Apps Script response:`, resText);
        return { success: true, dispatched: true, response: resText, payload };
      } catch (e: any) {
        console.error(`⚠️ [ORDER CONFIRMATION] Webhook dispatch error:`, e.message);
        return { success: false, error: e.message, payload };
      }
    } else {
      console.log(`ℹ️ [ORDER CONFIRMATION] Apps Script webhook URL not configured in APPS_SCRIPT_ORDER_WEBHOOK. Logged payload for ${targetEmail}.`);
      return { success: true, simulated: true, payload };
    }
  }

  app.post('/api/orders', optionalAuth, async (req, res) => {
    try {
      const orderData = req.body;
      const orderNumber = orderData.order_number || `RVZ-${Math.floor(100000 + Math.random() * 900000)}`;
      const trackingNumber = orderData.tracking_id || orderData.tracking_number || `TRK${Date.now().toString().slice(-8)}`;
      let rawUserId = req.user?.id || orderData.user_id;
      const shippingAddress = orderData.shipping_address || orderData.shippingDetails || {};
      const orderEmail = (orderData.email || shippingAddress.email || req.user?.email || '').toLowerCase().trim();
      shippingAddress.email = orderEmail;

      let dbUserId: string | null = null;
      if (rawUserId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawUserId)) {
        dbUserId = rawUserId;
      } else if (sql && orderEmail) {
        try {
          const userRow = await sql`SELECT id FROM users WHERE LOWER(email) = ${orderEmail} LIMIT 1`;
          if (userRow && userRow.length > 0) {
            dbUserId = userRow[0].id;
          }
        } catch (uErr) {
          console.warn('Neon resolve user id error:', uErr);
        }
      }

      const subtotal = Number(orderData.subtotal) || 0;
      const shippingCost = Number(orderData.shipping_cost) || 0;
      const discountAmount = Number(orderData.discount_amount) || 0;
      const total = Number(orderData.total) || (subtotal - discountAmount + shippingCost);
      const items = orderData.items || orderData.cart || [];
      const paymentMethod = orderData.payment_method || 'cod';
      const orderNotes = orderData.notes || shippingAddress.notes || '';
      const discountCode = orderData.coupon_code || orderData.discount_code || null;
      const shouldSaveAddress = Boolean(orderData.save_address || orderData.saveAddress || shippingAddress.saveAddress);

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

          // Populate relational order_items table for direct SQL analytics & reporting
          if (Array.isArray(items) && items.length > 0) {
            for (const item of items) {
              const pId = item.product_id || item.product?.id || item.id;
              let validProdId = pId;
              const matchedP = productsStore.find(p => p.id === pId || p.slug === item.slug || p.name === item.name);
              if (matchedP && matchedP.id) validProdId = matchedP.id;

              try {
                await sql`
                  INSERT INTO order_items (
                    order_id, product_id, product_name, quantity, unit_price, total_price, size, color
                  ) VALUES (
                    ${createdOrderId},
                    ${validProdId},
                    ${item.product_name || item.name || matchedP?.name || 'Streetwear Garment'},
                    ${Number(item.quantity) || 1},
                    ${Number(item.price || item.unit_price) || 0},
                    ${(Number(item.quantity) || 1) * (Number(item.price || item.unit_price) || 0)},
                    ${item.size || 'M'},
                    ${item.color || 'Standard'}
                  )
                `;
              } catch (oiErr: any) {
                console.warn('order_items insert note:', oiErr.message);
              }
            }
          }

          // Insert order notification into notifications table
          try {
            const customerDisplayName = shippingAddress.firstName 
              ? `${shippingAddress.firstName} ${shippingAddress.lastName || ''}`.trim() 
              : (shippingAddress.full_name || orderEmail);
            await sql`
              INSERT INTO notifications (
                user_id, title, message, type, link, is_read, created_at
              ) VALUES (
                ${dbUserId},
                'New Order Placed',
                ${'Order #' + orderNumber + ' received for Rs. ' + Number(total).toLocaleString() + ' (' + items.length + ' item' + (items.length > 1 ? 's' : '') + ') by ' + customerDisplayName},
                'order',
                'orders',
                false,
                NOW()
              )
            `;
          } catch (notifErr: any) {
            console.warn('Order notification insert note:', notifErr.message);
          }

          // If a discount coupon was applied, increment used_count in coupon_codes table
          if (discountCode) {
            try {
              await sql`
                UPDATE coupon_codes
                SET used_count = used_count + 1
                WHERE UPPER(code) = UPPER(${discountCode.trim()})
              `;
            } catch (cErr: any) {
              console.warn('Coupon used_count increment note:', cErr.message);
            }
          }

          // Always sync phone from checkout into users profile
          if (dbUserId && shippingAddress.phone) {
            try {
              await sql`
                UPDATE users 
                SET phone = ${shippingAddress.phone}, updated_at = NOW()
                WHERE id = ${dbUserId}
              `;
              const userInStore = usersStore.find(u => u.id === dbUserId);
              if (userInStore) {
                userInStore.phone = shippingAddress.phone;
              }
            } catch (pErr) {
              console.warn('Phone update note:', pErr);
            }
          }

          // Always save shipping address into addresses table for authenticated user
          if (dbUserId && shippingAddress.address) {
            try {
              const existing = await sql`
                SELECT id FROM addresses 
                WHERE user_id = ${dbUserId} AND address_line_1 = ${shippingAddress.address}
                LIMIT 1
              `;
              if (!existing || existing.length === 0) {
                const countRows = await sql`SELECT count(*)::int as count FROM addresses WHERE user_id = ${dbUserId}`;
                const isFirst = countRows && countRows[0]?.count === 0;
                const makeDefault = isFirst || shouldSaveAddress;
                if (makeDefault) {
                  await sql`UPDATE addresses SET is_default = false WHERE user_id = ${dbUserId}`;
                }
                await sql`
                  INSERT INTO addresses (
                    user_id, type, address_line_1, address_line_2, city, region, postal_code, phone, is_default, status
                  ) VALUES (
                    ${dbUserId}, 'shipping', ${shippingAddress.address},
                    ${shippingAddress.apartment || null},
                    ${shippingAddress.city || 'Karachi'},
                    ${shippingAddress.region || shippingAddress.province || 'Sindh'},
                    ${shippingAddress.postalCode || null},
                    ${shippingAddress.phone || ''}, ${makeDefault}, 'active'
                  )
                `;
                console.log(`✅ Saved address for user ${dbUserId}`);
              }
            } catch (addrErr) {
              console.warn('Address insert note:', addrErr);
            }
          }

          // Clear persistent cart from Neon cart_items table on successful order placement
          if (dbUserId) {
            sql`DELETE FROM cart_items WHERE user_id = ${dbUserId}`.catch(() => {});
            delete userCartsStore[dbUserId];
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
        email: orderEmail,
        status: 'pending_verification',
        subtotal,
        shipping_cost: shippingCost,
        total,
        discount_amount: discountAmount,
        discount_code: discountCode,
        coupon_code: discountCode,
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        items,
        notes: orderNotes,
        date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      ordersStore.unshift(newOrder as any);

      adminNotificationsStore.unshift({
        id: `notif-ord-${Date.now()}`,
        title: 'New Order Placed',
        message: `Order #${orderNumber} received for Rs. ${Number(total).toLocaleString()} (${items.length} items)`,
        type: 'order',
        link: 'orders',
        is_read: false,
        created_at: new Date().toISOString()
      });

      if (discountCode) {
        const found = couponsStore.find(c => c.code.toUpperCase() === discountCode.trim().toUpperCase());
        if (found) {
          found.used_count = (found.used_count || 0) + 1;
        }
      }

      // Auto-save shipping address to user's address book for permanent persistence
      if (shippingAddress && (rawUserId || orderEmail)) {
        try {
          const addrLine1 = shippingAddress.address || shippingAddress.address_line_1 || `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim() || 'Home Address';
          const addrCity = shippingAddress.city || 'Karachi';
          const addrPhone = shippingAddress.phone || '';
          const addrRegion = shippingAddress.region || shippingAddress.province || 'Sindh';
          const addrPostal = shippingAddress.postalCode || shippingAddress.postal_code || '';

          const existingAddr = addressesStore.find((a: any) => 
            (a.user_id === rawUserId || a.user_email === orderEmail) &&
            a.address_line_1?.toLowerCase() === addrLine1.toLowerCase() &&
            a.city?.toLowerCase() === addrCity.toLowerCase()
          );

          if (!existingAddr) {
            const newAddrObj = {
              id: `addr-${Date.now()}`,
              user_id: rawUserId || 'guest',
              user_email: orderEmail || '',
              type: 'shipping',
              address_line_1: addrLine1,
              address_line_2: shippingAddress.address_line_2 || shippingAddress.apartment || '',
              city: addrCity,
              region: addrRegion,
              postal_code: addrPostal,
              phone: addrPhone,
              is_default: addressesStore.filter((a: any) => a.user_id === rawUserId || a.user_email === orderEmail).length === 0,
              created_at: new Date().toISOString(),
            };
            addressesStore.unshift(newAddrObj);

            if (sql) {
              (async () => {
                try {
                  let dbUserId: string | null = null;
                  if (rawUserId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawUserId)) {
                    dbUserId = rawUserId;
                  } else if (orderEmail) {
                    const uRows = await sql`SELECT id FROM users WHERE email = ${orderEmail} LIMIT 1`;
                    if (uRows && uRows.length > 0) dbUserId = uRows[0].id;
                  }

                  if (dbUserId) {
                    await sql`
                      INSERT INTO addresses (user_id, type, address_line_1, address_line_2, city, region, postal_code, phone, is_default)
                      VALUES (${dbUserId}, 'shipping', ${addrLine1}, ${shippingAddress.address_line_2 || null}, ${addrCity}, ${addrRegion}, ${addrPostal || null}, ${addrPhone}, ${newAddrObj.is_default})
                    `;
                  }
                } catch (sqlAddrErr: any) {
                  console.warn('Neon auto-save address note:', sqlAddrErr.message);
                }
              })();
            }
          }
        } catch (addrErr) {
          console.error('Error auto-saving order address:', addrErr);
        }
      }

      // Trigger automatic confirmation email to the email specified at checkout Step 1
      sendOrderConfirmationEmail(newOrder).catch((e) => {
        console.error('Auto order confirmation dispatch error:', e);
      });

      // Decrement inventory dynamically for each ordered item
      if (Array.isArray(items)) {
        items.forEach((item: any) => {
          const prodId = item.product_id || item.id;
          const prod = productsStore.find(p => p.id === prodId || p.slug === item.slug);
          if (prod) {
            const qty = Number(item.quantity) || 1;
            // Decrement variant stock if matrix exists
            if (Array.isArray(prod.variants_matrix) && prod.variants_matrix.length > 0) {
              const variant = prod.variants_matrix.find((v: any) => 
                (!item.size || v.size?.toLowerCase() === item.size?.toLowerCase()) &&
                (!item.color || v.color?.toLowerCase() === item.color?.toLowerCase())
              );
              if (variant) {
                variant.stock = Math.max(0, (Number(variant.stock) || 0) - qty);
              }
              const totalMatrixStock = prod.variants_matrix.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0);
              prod.stock = totalMatrixStock;
              (prod as any).stockCount = totalMatrixStock;
            } else {
              const currentStock = (prod as any).stockCount ?? prod.stock ?? 50;
              const updatedStock = Math.max(0, currentStock - qty);
              prod.stock = updatedStock;
              (prod as any).stockCount = updatedStock;
            }

            // Check dynamic low stock threshold
            const threshold = Number(prod.low_stock_threshold ?? 4);
            const remaining = (prod as any).stockCount ?? prod.stock ?? 0;
            if (remaining <= threshold) {
              const alertTitle = remaining === 0 ? 'Out of Stock Alert' : 'Low Stock Alert';
              const alertMsg = `${prod.name} has only ${remaining} unit${remaining === 1 ? '' : 's'} remaining (threshold: ${threshold}). Replenishment required.`;
              adminNotificationsStore.unshift({
                id: `notif-stock-${prod.id}-${Date.now()}`,
                title: alertTitle,
                message: alertMsg,
                type: 'stock',
                is_read: false,
                created_at: new Date().toISOString(),
                link: 'inventory',
              });
              logAdminAudit('Stock Alert Triggered', prod.name, 'System', `${remaining} units remaining (threshold: ${threshold})`);
            }
          }
        });
      }

      // Create new order notification
      adminNotificationsStore.unshift({
        id: `notif-order-${newOrder.id}-${Date.now()}`,
        title: 'New Order Received',
        message: `Order #${newOrder.order_number} placed by ${shippingAddress?.firstName || 'Customer'} for Rs. ${total.toLocaleString()}`,
        type: 'order',
        is_read: false,
        created_at: new Date().toISOString(),
        link: 'orders',
      });

      // Audit log order placement
      logAdminAudit('Order Placed', newOrder.order_number, shippingAddress?.firstName || 'Customer', `Total: Rs. ${total.toLocaleString()}, Items: ${items?.length || 0}`);

      res.status(201).json(newOrder);
    } catch (err: any) {
      console.error('Order creation error:', err);
      res.status(500).json({ message: 'Error creating order', error: err.message });
    }
  });

  app.patch('/api/orders/:id/status', optionalAuth, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: 'Status is required' });

    let updatedDbOrder: any = null;
    if (sql) {
      try {
        const rows = await sql`
          UPDATE orders 
          SET status = ${status}, updated_at = NOW() 
          WHERE id::text = ${id} OR order_number = ${id}
          RETURNING *
        `;
        if (rows && rows.length > 0) {
          updatedDbOrder = rows[0];
        }
      } catch (e) {
        console.error('Neon update order status error:', e);
      }
    }

    let memoryOrder = ordersStore.find((o) => o.id === id || o.order_number === id);
    if (memoryOrder) {
      const oldStatus = memoryOrder.status;
      memoryOrder.status = status;
      logAdminAudit('Order Status Changed', `${memoryOrder.order_number}: ${oldStatus} → ${status}`, req.user?.name || 'Admin');
    } else if (updatedDbOrder) {
      logAdminAudit('Order Status Changed', `${updatedDbOrder.order_number}: status → ${status}`, req.user?.name || 'Admin');
    }

    const finalOrder = updatedDbOrder ? {
      id: updatedDbOrder.id,
      order_number: updatedDbOrder.order_number,
      tracking_id: updatedDbOrder.tracking_number || `TRK-${updatedDbOrder.order_number}`,
      tracking_number: updatedDbOrder.tracking_number || `TRK-${updatedDbOrder.order_number}`,
      user_id: updatedDbOrder.user_id,
      total: Number(updatedDbOrder.total),
      subtotal: Number(updatedDbOrder.subtotal),
      shipping_cost: Number(updatedDbOrder.shipping_cost),
      discount_amount: Number(updatedDbOrder.discount_amount || 0),
      discount_code: updatedDbOrder.discount_code,
      status: updatedDbOrder.status,
      payment_status: updatedDbOrder.payment_status || 'unpaid',
      payment_method: updatedDbOrder.payment_method,
      shipping_address: updatedDbOrder.shipping_address,
      billing_address: updatedDbOrder.billing_address,
      order_notes: updatedDbOrder.order_notes,
      items: updatedDbOrder.items,
      date: updatedDbOrder.created_at,
      created_at: updatedDbOrder.created_at,
    } : (memoryOrder || { id, status });

    res.json(finalOrder);
  });

  app.patch('/api/orders/:id/payment-status', optionalAuth, async (req, res) => {
    const { id } = req.params;
    const { payment_status } = req.body;
    if (!payment_status) return res.status(400).json({ message: 'Payment status is required' });

    let updatedDbOrder: any = null;
    if (sql) {
      try {
        const rows = await sql`
          UPDATE orders 
          SET payment_status = ${payment_status}, updated_at = NOW() 
          WHERE id::text = ${id} OR order_number = ${id}
          RETURNING *
        `;
        if (rows && rows.length > 0) {
          updatedDbOrder = rows[0];
        }
      } catch (e) {
        console.error('Neon update order payment status error:', e);
      }
    }

    let memoryOrder = ordersStore.find((o) => o.id === id || o.order_number === id);
    if (memoryOrder) {
      (memoryOrder as any).payment_status = payment_status;
      logAdminAudit('Order Payment Status Changed', `${memoryOrder.order_number}: payment_status → ${payment_status}`, req.user?.name || 'Admin');
    } else if (updatedDbOrder) {
      logAdminAudit('Order Payment Status Changed', `${updatedDbOrder.order_number}: payment_status → ${payment_status}`, req.user?.name || 'Admin');
    }

    const finalOrder = updatedDbOrder ? {
      id: updatedDbOrder.id,
      order_number: updatedDbOrder.order_number,
      tracking_id: updatedDbOrder.tracking_number || `TRK-${updatedDbOrder.order_number}`,
      tracking_number: updatedDbOrder.tracking_number || `TRK-${updatedDbOrder.order_number}`,
      user_id: updatedDbOrder.user_id,
      total: Number(updatedDbOrder.total),
      subtotal: Number(updatedDbOrder.subtotal),
      shipping_cost: Number(updatedDbOrder.shipping_cost),
      discount_amount: Number(updatedDbOrder.discount_amount || 0),
      discount_code: updatedDbOrder.discount_code,
      status: updatedDbOrder.status,
      payment_status: updatedDbOrder.payment_status || payment_status,
      payment_method: updatedDbOrder.payment_method,
      shipping_address: updatedDbOrder.shipping_address,
      billing_address: updatedDbOrder.billing_address,
      order_notes: updatedDbOrder.order_notes,
      items: updatedDbOrder.items,
      date: updatedDbOrder.created_at,
      created_at: updatedDbOrder.created_at,
    } : (memoryOrder || { id, payment_status });

    res.json(finalOrder);
  });

  app.patch('/api/orders/:id', optionalAuth, async (req, res) => {
    const { id } = req.params;
    const { status, payment_status } = req.body;

    let updatedDbOrder: any = null;
    if (sql) {
      try {
        const rows = await sql`
          UPDATE orders 
          SET 
            status = COALESCE(${status || null}, status), 
            payment_status = COALESCE(${payment_status || null}, payment_status), 
            updated_at = NOW() 
          WHERE id::text = ${id} OR order_number = ${id}
          RETURNING *
        `;
        if (rows && rows.length > 0) {
          updatedDbOrder = rows[0];
        }
      } catch (e) {
        console.error('Neon update order error:', e);
      }
    }

    let memoryOrder = ordersStore.find((o) => o.id === id || o.order_number === id);
    if (memoryOrder) {
      if (status) memoryOrder.status = status;
      if (payment_status) (memoryOrder as any).payment_status = payment_status;
      logAdminAudit('Order Updated', `${memoryOrder.order_number}`, req.user?.name || 'Admin');
    }

    res.json({
      success: true,
      order: updatedDbOrder || memoryOrder || { id, status, payment_status }
    });
  });

  // ==================== REVIEWS ROUTES ====================
  app.get('/api/reviews', (req, res) => {
    const { product_id, product_slug, all } = req.query as any;
    let list = (all === 'true' || all === true) ? [...reviewsStore] : reviewsStore.filter((r) => r.is_approved);
    if (product_id) {
      list = list.filter((r) => r.product_id === product_id);
    }
    if (product_slug) {
      list = list.filter((r) => r.product_slug === product_slug);
    }
    res.json(list);
  });

  app.patch('/api/reviews/:id/approval', optionalAuth, (req, res) => {
    const { id } = req.params;
    const { is_approved } = req.body;
    const rev = reviewsStore.find((r) => r.id === id);
    if (!rev) {
      return res.status(404).json({ message: 'Review not found' });
    }
    rev.is_approved = Boolean(is_approved);
    logAdminAudit('Review Status Updated', `${rev.user_name} (${rev.product_slug})`, req.user?.name || 'Admin', `Approved: ${rev.is_approved}`);
    res.json({ success: true, review: rev });
  });

  app.delete('/api/reviews/:id', optionalAuth, (req, res) => {
    const { id } = req.params;
    const revIndex = reviewsStore.findIndex((r) => r.id === id);
    if (revIndex === -1) {
      return res.status(404).json({ message: 'Review not found' });
    }
    const deleted = reviewsStore.splice(revIndex, 1)[0];
    logAdminAudit('Review Deleted', `${deleted.user_name} (${deleted.product_slug})`, req.user?.name || 'Admin');
    res.json({ success: true, message: 'Review deleted' });
  });

  app.post('/api/reviews', optionalAuth, (req, res) => {
    try {
      const { product_id, product_slug, rating, comment, name } = req.body;
      const targetProd = productsStore.find(p => p.id === product_id || p.slug === product_slug);
      const newReview: Review = {
        id: `rev-${Date.now()}`,
        product_id: product_id || targetProd?.id || 'prod-1',
        product_slug: product_slug || targetProd?.slug || '',
        user_name: name || req.user?.name || 'Customer',
        rating: Number(rating) || 5,
        comment: comment || '',
        is_approved: false, // Default to pending approval so admin can review
        created_at: new Date().toISOString(),
      };
      reviewsStore.unshift(newReview);
      logAdminAudit('New Review Submitted', `${newReview.user_name} on ${newReview.product_slug}`, 'Customer');
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

  // ==================== USER PROFILE ROUTES ====================
  app.patch('/api/users/profile', optionalAuth, async (req, res) => {
    try {
      const uid = req.user?.id || req.body.id || req.body.user_id;
      const { name, phone } = req.body;
      if (!uid) return res.status(401).json({ message: 'User identification required' });

      let updatedUser: any = null;
      if (sql && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uid)) {
        try {
          const rows = await sql`
            UPDATE users 
            SET name = COALESCE(${name || null}, name),
                phone = COALESCE(${phone || null}, phone)
            WHERE id = ${uid}
            RETURNING id, email, name, phone, role, is_verified
          `;
          if (rows && rows.length > 0) {
            updatedUser = rows[0];
          }
        } catch (e) {
          console.error('Neon update user profile error:', e);
        }
      }

      if (!updatedUser) {
        const u = usersStore.find((user) => user.id === uid);
        if (u) {
          if (name) u.name = name;
          if (phone) u.phone = phone;
          updatedUser = {
            id: u.id,
            email: u.email,
            name: u.name,
            phone: u.phone,
            role: u.role,
            is_verified: u.is_verified,
          };
        }
      }

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ success: true, message: 'Profile updated successfully', user: updatedUser });
    } catch (err: any) {
      res.status(500).json({ message: 'Error updating profile', error: err.message });
    }
  });

  // ==================== ADDRESSES ROUTES ====================
  app.get('/api/addresses', optionalAuth, async (req, res) => {
    try {
      const uid = req.user?.id || (req.query.user_id as string) || '';
      const uemail = (req.user?.email || (req.query.email as string) || '').trim().toLowerCase();

      if (!uid && !uemail) return res.json([]);

      let loadedAddresses: any[] = [];

      // 1. Try fetching from Neon DB if SQL is connected
      if (sql) {
        try {
          let rows: any[] = [];
          if (uid && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uid)) {
            rows = await sql`
              SELECT * FROM addresses 
              WHERE user_id = ${uid} 
                 OR (user_id IN (SELECT id FROM users WHERE LOWER(email) = ${uemail}))
              ORDER BY is_default DESC, created_at DESC
            `;
          } else if (uemail) {
            rows = await sql`
              SELECT a.* FROM addresses a
              JOIN users u ON a.user_id = u.id
              WHERE LOWER(u.email) = ${uemail}
              ORDER BY a.is_default DESC, a.created_at DESC
            `;
          }

          if (rows && rows.length > 0) {
            loadedAddresses = rows;
            // Sync loaded rows into addressesStore for fast memory retrieval
            rows.forEach((r: any) => {
              const existingIdx = addressesStore.findIndex((a) => a.id === r.id);
              if (existingIdx !== -1) {
                addressesStore[existingIdx] = { ...addressesStore[existingIdx], ...r, user_email: uemail || addressesStore[existingIdx].user_email };
              } else {
                addressesStore.push({ ...r, user_email: uemail });
              }
            });
            return res.json(loadedAddresses);
          }
        } catch (e: any) {
          console.error('Neon addresses query error:', e.message);
        }
      }

      // 2. Check in-memory addressesStore
      const memMatches = addressesStore.filter((a) => {
        const matchesId = uid && (a.user_id === uid || a.user_id?.toString() === uid.toString());
        const matchesEmail = uemail && a.user_email?.toLowerCase() === uemail;
        return matchesId || matchesEmail;
      });

      if (memMatches.length > 0) {
        return res.json(memMatches);
      }

      // 3. Fallback: Search user's past placed orders for shipping address so they are never lost
      const pastOrder = ordersStore.find((o) => {
        const matchesId = uid && o.user_id === uid;
        const matchesEmail = uemail && o.email?.toLowerCase() === uemail;
        return (matchesId || matchesEmail) && o.shipping_address;
      });

      if (pastOrder && pastOrder.shipping_address) {
        const s = pastOrder.shipping_address;
        const recoveredAddress = {
          id: `addr-recovered-${pastOrder.id}`,
          user_id: uid || pastOrder.user_id || 'default_user',
          user_email: uemail || pastOrder.email || '',
          type: 'shipping',
          address_line_1: s.address || s.address_line_1 || `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Home Address',
          address_line_2: s.address_line_2 || s.apartment || '',
          city: s.city || 'Karachi',
          region: s.region || s.province || 'Sindh',
          postal_code: s.postalCode || s.postal_code || '',
          phone: s.phone || '',
          is_default: true,
          created_at: pastOrder.created_at || new Date().toISOString(),
        };

        addressesStore.unshift(recoveredAddress);

        if (sql) {
          (async () => {
            try {
              let dbUid: string | null = null;
              if (uid && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uid)) {
                dbUid = uid;
              } else if (uemail) {
                const uRows = await sql`SELECT id FROM users WHERE LOWER(email) = ${uemail} LIMIT 1`;
                if (uRows && uRows.length > 0) dbUid = uRows[0].id;
              }

              if (dbUid) {
                await sql`
                  INSERT INTO addresses (user_id, type, address_line_1, address_line_2, city, region, postal_code, phone, is_default)
                  VALUES (${dbUid}, 'shipping', ${recoveredAddress.address_line_1}, ${recoveredAddress.address_line_2 || null}, ${recoveredAddress.city}, ${recoveredAddress.region}, ${recoveredAddress.postal_code || null}, ${recoveredAddress.phone}, true)
                `;
              }
            } catch (_) {}
          })();
        }

        return res.json([recoveredAddress]);
      }

      res.json([]);
    } catch (err: any) {
      res.status(500).json({ message: 'Error fetching addresses', error: err.message });
    }
  });

  app.post('/api/addresses', optionalAuth, async (req, res) => {
    try {
      const uid = req.user?.id || req.body.user_id || 'default_user';
      const uemail = (req.user?.email || req.body.email || '').trim().toLowerCase();
      const {
        address_line_1,
        address_line_2,
        city,
        region,
        postal_code,
        phone,
        type = 'shipping',
        is_default = false,
      } = req.body;

      if (!address_line_1 || !city) {
        return res.status(400).json({ message: 'Address and city are required' });
      }

      // If is_default is set to true, clear existing defaults for this user
      if (is_default) {
        addressesStore.forEach((a) => {
          if (a.user_id === uid || (uemail && a.user_email?.toLowerCase() === uemail)) {
            a.is_default = false;
          }
        });
      }

      const newAddrId = `addr-${Date.now()}`;
      const newAddressObj = {
        id: newAddrId,
        user_id: uid,
        user_email: uemail,
        type,
        address_line_1,
        address_line_2: address_line_2 || '',
        city,
        region: region || 'Sindh',
        postal_code: postal_code || '',
        phone: phone || '',
        is_default: Boolean(is_default),
        created_at: new Date().toISOString(),
      };

      addressesStore.unshift(newAddressObj);

      // Persist to Neon DB
      let dbAddress: any = null;
      if (sql) {
        try {
          let dbUid: string | null = null;
          if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uid)) {
            dbUid = uid;
          } else if (uemail) {
            const uRows = await sql`SELECT id FROM users WHERE LOWER(email) = ${uemail} LIMIT 1`;
            if (uRows && uRows.length > 0) dbUid = uRows[0].id;
          }

          if (dbUid) {
            if (is_default) {
              await sql`UPDATE addresses SET is_default = false WHERE user_id = ${dbUid}`;
            }

            const rows = await sql`
              INSERT INTO addresses (user_id, type, address_line_1, address_line_2, city, region, postal_code, phone, is_default)
              VALUES (${dbUid}, ${type}, ${address_line_1}, ${address_line_2 || null}, ${city}, ${region || 'Sindh'}, ${postal_code || null}, ${phone || ''}, ${Boolean(is_default)})
              RETURNING *
            `;
            if (rows && rows.length > 0) {
              dbAddress = rows[0];
              newAddressObj.id = dbAddress.id;
            }
          }
        } catch (e: any) {
          console.error('Neon insert address error:', e.message);
        }
      }

      res.status(201).json(dbAddress || newAddressObj);
    } catch (err: any) {
      res.status(500).json({ message: 'Error creating address', error: err.message });
    }
  });

  app.put('/api/addresses/:id', optionalAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const uid = req.user?.id || req.body.user_id;
      const uemail = (req.user?.email || req.body.email || '').trim().toLowerCase();
      const {
        address_line_1,
        address_line_2,
        city,
        region,
        postal_code,
        phone,
        is_default,
      } = req.body;

      // Update in memory
      const addrIdx = addressesStore.findIndex((a) => a.id === id);
      if (addrIdx !== -1) {
        if (is_default) {
          addressesStore.forEach((a) => {
            if (a.user_id === uid || (uemail && a.user_email?.toLowerCase() === uemail)) {
              a.is_default = false;
            }
          });
        }
        addressesStore[addrIdx] = {
          ...addressesStore[addrIdx],
          ...(address_line_1 ? { address_line_1 } : {}),
          ...(address_line_2 !== undefined ? { address_line_2 } : {}),
          ...(city ? { city } : {}),
          ...(region ? { region } : {}),
          ...(postal_code !== undefined ? { postal_code } : {}),
          ...(phone !== undefined ? { phone } : {}),
          ...(is_default !== undefined ? { is_default: Boolean(is_default) } : {}),
        };
      }

      // Update in Neon DB
      if (sql && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        try {
          if (is_default && uid && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uid)) {
            await sql`UPDATE addresses SET is_default = false WHERE user_id = ${uid}`;
          }

          const rows = await sql`
            UPDATE addresses
            SET address_line_1 = COALESCE(${address_line_1 || null}, address_line_1),
                address_line_2 = COALESCE(${address_line_2 || null}, address_line_2),
                city = COALESCE(${city || null}, city),
                region = COALESCE(${region || null}, region),
                postal_code = COALESCE(${postal_code || null}, postal_code),
                phone = COALESCE(${phone || null}, phone),
                is_default = COALESCE(${is_default !== undefined ? Boolean(is_default) : null}, is_default)
            WHERE id = ${id}
            RETURNING *
          `;
          if (rows && rows.length > 0) {
            return res.json(rows[0]);
          }
        } catch (e: any) {
          console.error('Neon update address error:', e.message);
        }
      }

      res.json(addrIdx !== -1 ? addressesStore[addrIdx] : { success: true, id, message: 'Address updated' });
    } catch (err: any) {
      res.status(500).json({ message: 'Error updating address', error: err.message });
    }
  });

  app.delete('/api/addresses/:id', optionalAuth, async (req, res) => {
    try {
      const { id } = req.params;
      addressesStore = addressesStore.filter((a) => a.id !== id);

      if (sql && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        try {
          await sql`DELETE FROM addresses WHERE id = ${id}`;
        } catch (e: any) {
          console.error('Neon delete address error:', e.message);
        }
      }
      res.json({ success: true, message: 'Address deleted' });
    } catch (err: any) {
      res.status(500).json({ message: 'Error deleting address', error: err.message });
    }
  });

  // ==================== CART ROUTES (Persistence & Sync) ====================
  const userCartsStore: { [userId: string]: any[] } = {};

  app.get('/api/cart/:userId', optionalAuth, async (req, res) => {
    const { userId } = req.params;
    if (!userId) return res.json([]);

    if (sql && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      try {
        const rows = await sql`
          SELECT ci.*, 
                 p.name as prod_name, p.slug as prod_slug, p.base_price, p.compare_at_price,
                 p.images, p.image_url, p.attributes, p.variants_matrix
          FROM cart_items ci
          LEFT JOIN products p ON (ci.product_id = p.id::text OR ci.product_id = p.slug)
          WHERE ci.user_id = ${userId}
          ORDER BY ci.created_at ASC
        `;
        if (rows && rows.length > 0) {
          const catMap = new Map(categoriesStore.map((c) => [c.id, c]));
          const formattedCart = rows.map((r: any) => {
            let prodObj = productsStore.find(p => p.id === r.product_id || p.slug === r.product_id);
            if (!prodObj && r.prod_name) {
              prodObj = formatProduct({
                id: r.product_id,
                name: r.prod_name,
                slug: r.prod_slug,
                base_price: r.base_price,
                compare_at_price: r.compare_at_price,
                images: r.images,
                image_url: r.image_url,
                attributes: r.attributes,
                variants_matrix: r.variants_matrix,
              }, catMap);
            } else if (prodObj) {
              prodObj = formatProduct(prodObj, catMap);
            } else {
              prodObj = {
                id: r.product_id,
                name: 'Ravenza Garment',
                slug: r.product_id,
                price: 2990,
                image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200',
              } as any;
            }
            return {
              product: prodObj,
              size: r.size || 'M',
              color: r.color || 'Black',
              quantity: Number(r.quantity) || 1,
            };
          });
          userCartsStore[userId] = formattedCart;
          return res.json(formattedCart);
        }
        return res.json([]);
      } catch (e) {
        console.error('Neon get cart error:', e);
      }
    }

    const cart = userCartsStore[userId] || [];
    res.json(cart);
  });

  app.post('/api/cart/:userId/sync', optionalAuth, async (req, res) => {
    const { userId } = req.params;
    const { cart } = req.body;
    if (!Array.isArray(cart)) {
      return res.status(400).json({ message: 'Cart must be an array' });
    }

    userCartsStore[userId] = cart;

    if (sql && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      try {
        await sql`DELETE FROM cart_items WHERE user_id = ${userId}`;

        for (const item of cart) {
          const prodId = item.product?.id || item.productId || item.id;
          const size = item.size || 'M';
          const color = item.color || item.selectedColor || 'Black';
          const qty = Number(item.quantity) || 1;
          let resolvedProdId = prodId;
          const foundProd = productsStore.find(p => p.id === prodId || p.slug === prodId);
          if (foundProd && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(foundProd.id)) {
            resolvedProdId = foundProd.id;
          }
          if (resolvedProdId) {
            await sql`
              INSERT INTO cart_items (user_id, product_id, size, color, quantity, updated_at)
              VALUES (${userId}, ${resolvedProdId}, ${size}, ${color}, ${qty}, NOW())
            `;
          }
        }
      } catch (e) {
        console.error('Neon sync cart error:', e);
      }
    }

    res.json({ success: true, count: cart.length });
  });

  // Direct endpoint to trigger/test order confirmation email
  app.post('/api/send-order-confirmation', async (req, res) => {
    try {
      const result = await sendOrderConfirmationEmail(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/test-order-confirmation', async (req, res) => {
    try {
      const email = (req.query.email as string) || 'test@example.com';
      const mockOrder = {
        order_number: `RVZ-${Math.floor(100000 + Math.random() * 900000)}`,
        tracking_id: `TRK${Date.now().toString().slice(-8)}`,
        email,
        status: 'confirmed',
        subtotal: 7980,
        shipping_cost: 0,
        discount_amount: 500,
        discount_code: 'FLAT500',
        total: 7480,
        payment_method: 'Cash on Delivery',
        shipping_address: {
          firstName: 'Hamza',
          lastName: 'Tariq',
          email,
          phone: '0300 1234567',
          address: 'Plot 42, Block 5, Clifton',
          apartment: 'Apt 4B',
          city: 'Karachi',
          province: 'Sindh',
          postalCode: '75600',
        },
        items: [
          {
            product: { name: 'Shadow Realm Co-Ord Set', price: 3990 },
            size: 'L',
            color: 'Black',
            quantity: 2,
          }
        ],
      };
      const result = await sendOrderConfirmationEmail(mockOrder);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Helper: Dispatch Newsletter Welcome Email via Google Apps Script Webhook
  async function sendNewsletterWelcomeEmail(email: string) {
    let webhookUrl = (
      process.env.APPS_SCRIPT_NEWSLETTER_WEBHOOK ||
      process.env.APPS_SCRIPT_EMAIL_WEBHOOK ||
      process.env.APPS_SCRIPT_URL ||
      process.env.GAS_WEBHOOK_URL ||
      ''
    ).trim();
    if (webhookUrl.startsWith(':')) webhookUrl = webhookUrl.substring(1).trim();
    webhookUrl = webhookUrl.replace(/^["']|["']$/g, '');

    if (webhookUrl && webhookUrl.startsWith('http')) {
      try {
        console.log(`📡 Sending welcome email to ${email} via Google Apps Script webhook...`);
        const resp = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'newsletter_welcome',
            email,
            emails: [email],
            subject: 'Welcome to Ravenza Streetwear | Exclusive 10% Off VIP Access',
            content: 'Thank you for subscribing to Ravenza VIP Newsletter! Use discount code WELCOME10 for 10% off your first order.',
            appName: 'RAVENZA Streetwear'
          })
        });
        console.log(`✅ Apps Script webhook responded with status: ${resp.status}`);
        return { success: true };
      } catch (err: any) {
        console.warn('❌ Google Apps Script newsletter delivery error:', err.message);
        return { success: false, error: err.message };
      }
    } else {
      console.log(`ℹ️ [NEWSLETTER] Apps Script webhook URL not configured in APPS_SCRIPT_NEWSLETTER_WEBHOOK. Welcome email logged for ${email}.`);
      return { success: true, simulated: true };
    }
  }

  // ==================== ADMIN STATS ====================
  app.get('/api/admin/stats', optionalAuth, async (req, res) => {
    try {
      let ordersList: any[] = [];
      if (sql) {
        try {
          const dbOrders = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
          if (dbOrders && dbOrders.length > 0) ordersList = dbOrders;
        } catch (_) {}
      }
      if (ordersList.length === 0) ordersList = ordersStore;

      const totalRevenue = ordersList.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      const activeOrders = ordersList.filter((o) => ['confirmed', 'processing', 'shipped'].includes(o.status)).length;

      // Active customers: distinct users who made >= 1 order
      let activeCustomersCount = 0;
      if (sql) {
        try {
          const activeRes = await sql`
            SELECT COUNT(DISTINCT coalesce(user_id::text, lower(shipping_address->>'email'))) as count
            FROM orders
            WHERE (user_id IS NOT NULL OR shipping_address->>'email' IS NOT NULL);
          `;
          activeCustomersCount = Number(activeRes[0]?.count || 0);
        } catch (_) {}
      }
      if (!activeCustomersCount) {
        const uniqueBuyerSet = new Set<string>();
        ordersList.forEach((o: any) => {
          const buyer = o.user_id || o.shipping_address?.email;
          if (buyer) uniqueBuyerSet.add(String(buyer).toLowerCase().trim());
        });
        activeCustomersCount = Math.max(uniqueBuyerSet.size, 1);
      }

      res.json({
        totalRevenue,
        totalOrders: ordersList.length,
        activeOrders,
        totalProducts: productsStore.length,
        totalCustomers: activeCustomersCount,
      });
    } catch (err: any) {
      res.status(500).json({ message: 'Error retrieving stats', error: err.message });
    }
  });

  // ==================== PURE DYNAMIC ANALYTICS ====================
  app.get('/api/admin/analytics', optionalAuth, async (req, res) => {
    try {
      const range = (req.query.range as string) || '30days';
      const now = new Date();
      let days = 30;
      if (range === '7days') days = 7;
      else if (range === '90days') days = 90;
      else if (range === 'all') days = 3650;

      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      // Fetch all orders from DB if available, else memory store
      let allOrders: any[] = [];
      if (sql) {
        try {
          const dbOrders = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
          if (dbOrders && dbOrders.length > 0) allOrders = dbOrders;
        } catch (dbErr) {
          console.warn('Analytics DB orders fetch error:', dbErr);
        }
      }
      if (allOrders.length === 0) {
        allOrders = ordersStore;
      }

      // Active customers: users with >= 1 order
      let activeCustomersCount = 0;
      if (sql) {
        try {
          const activeRes = await sql`
            SELECT COUNT(DISTINCT coalesce(user_id::text, lower(shipping_address->>'email'))) as count
            FROM orders
            WHERE (user_id IS NOT NULL OR shipping_address->>'email' IS NOT NULL);
          `;
          activeCustomersCount = Number(activeRes[0]?.count || 0);
        } catch (_) {}
      }
      if (!activeCustomersCount) {
        const uniqueBuyerSet = new Set<string>();
        allOrders.forEach((o: any) => {
          const buyer = o.user_id || o.shipping_address?.email;
          if (buyer) uniqueBuyerSet.add(String(buyer).toLowerCase().trim());
        });
        activeCustomersCount = Math.max(uniqueBuyerSet.size, 1);
      }

      // Filter orders by selected date range
      const rangeOrders = allOrders.filter((o: any) => {
        const orderDate = new Date(o.date || o.created_at || Date.now());
        return orderDate >= cutoff;
      });

      const totalRevenue = rangeOrders.reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0);
      const totalOrders = rangeOrders.length;
      const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

      // Daily timeline data for graphs
      const numDays = Math.min(days, 30);
      const daysMap: Record<string, { revenue: number; orders: number }> = {};
      for (let i = numDays - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const key = d.toISOString().split('T')[0];
        daysMap[key] = { revenue: 0, orders: 0 };
      }

      rangeOrders.forEach((o: any) => {
        const key = new Date(o.date || o.created_at || Date.now()).toISOString().split('T')[0];
        if (daysMap[key]) {
          daysMap[key].revenue += Number(o.total) || 0;
          daysMap[key].orders += 1;
        } else {
          daysMap[key] = { revenue: Number(o.total) || 0, orders: 1 };
        }
      });

      const revenueProgression = Object.entries(daysMap).map(([date, val]) => ({
        date: date.slice(5),
        fullDate: date,
        revenue: val.revenue,
      }));

      const orderVolume = Object.entries(daysMap).map(([date, val]) => ({
        date: date.slice(5),
        fullDate: date,
        orders: val.orders,
      }));

      // Breakdown by Category and Product
      const categoryMap: Record<string, { id: string; name: string; revenue: number; units: number; orderIds: Set<string> }> = {};
      const productMap: Record<string, { id: string; name: string; category: string; units: number; revenue: number; image: string; unit_price: number; orderIds: Set<string> }> = {};

      const catLookup = new Map<string, string>();
      categoriesStore.forEach((c) => catLookup.set(c.id, c.name));

      rangeOrders.forEach((o: any) => {
        const orderId = String(o.id || o.order_number || Math.random());
        const items = Array.isArray(o.items) ? o.items : (typeof o.items === 'string' ? (() => { try { return JSON.parse(o.items || '[]'); } catch { return []; } })() : []);
        items.forEach((item: any) => {
          const qty = Number(item.quantity) || 1;
          const price = Number(item.price || item.unit_price) || 0;
          const itemTotal = price * qty;
          const prodId = item.product_id || item.product?.id || item.id;
          const matchedProd = productsStore.find((p) => p.id === prodId || p.slug === item.slug || p.name === item.name);

          let catName = 'Streetwear';
          let catId = matchedProd?.category_id || 'cat-general';
          if (matchedProd?.category_name) catName = matchedProd.category_name;
          else if (matchedProd?.category_id && catLookup.has(matchedProd.category_id)) catName = catLookup.get(matchedProd.category_id)!;
          else if (matchedProd?.category) catName = matchedProd.category;
          else if (item.category) catName = item.category;

          if (!categoryMap[catName]) {
            categoryMap[catName] = { id: catId, name: catName, revenue: 0, units: 0, orderIds: new Set() };
          }
          categoryMap[catName].revenue += itemTotal;
          categoryMap[catName].units += qty;
          categoryMap[catName].orderIds.add(orderId);

          const prodName = matchedProd?.name || item.product_name || item.name || 'Streetwear Garment';
          const prodImage = matchedProd?.image_url || matchedProd?.image || matchedProd?.images?.[0] || item.image || item.product?.images?.[0] || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop';

          if (!productMap[prodName]) {
            productMap[prodName] = {
              id: matchedProd?.id || prodId || `prod-${Math.random()}`,
              name: prodName,
              category: catName,
              units: 0,
              revenue: 0,
              image: prodImage,
              unit_price: price || Number(matchedProd?.base_price) || 0,
              orderIds: new Set()
            };
          }
          productMap[prodName].units += qty;
          productMap[prodName].revenue += itemTotal;
          productMap[prodName].orderIds.add(orderId);
          if (!productMap[prodName].image && prodImage) productMap[prodName].image = prodImage;
        });
      });

      // Incorporate order_items table from Neon DB if connected
      if (sql) {
        try {
          const dbItemRows = await sql`
            SELECT 
              oi.product_id,
              oi.product_name,
              c.name as category_name,
              c.id as category_id,
              COALESCE(p.image_url, (p.images->>0), '') as image,
              p.base_price,
              oi.order_id,
              oi.quantity,
              oi.unit_price,
              oi.total_price
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            LEFT JOIN products p ON oi.product_id = p.id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE o.created_at >= ${cutoff}
          `;
          if (dbItemRows && dbItemRows.length > 0) {
            dbItemRows.forEach((row: any) => {
              const orderId = String(row.order_id);
              const prodName = row.product_name || 'Streetwear Garment';
              const catName = row.category_name || 'Streetwear';
              const catId = row.category_id || 'cat-general';
              const qty = Number(row.quantity) || 1;
              const unitPrice = Number(row.unit_price) || 0;
              const rowTotal = Number(row.total_price) || (qty * unitPrice);

              if (!categoryMap[catName]) {
                categoryMap[catName] = { id: catId, name: catName, revenue: 0, units: 0, orderIds: new Set() };
              }
              if (!categoryMap[catName].orderIds.has(orderId)) {
                categoryMap[catName].revenue += rowTotal;
                categoryMap[catName].units += qty;
                categoryMap[catName].orderIds.add(orderId);
              }

              if (!productMap[prodName]) {
                productMap[prodName] = {
                  id: row.product_id,
                  name: prodName,
                  category: catName,
                  units: 0,
                  revenue: 0,
                  image: row.image || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop',
                  unit_price: unitPrice || Number(row.base_price) || 0,
                  orderIds: new Set()
                };
              }
              if (!productMap[prodName].orderIds.has(orderId)) {
                productMap[prodName].units += qty;
                productMap[prodName].revenue += rowTotal;
                productMap[prodName].orderIds.add(orderId);
              }
            });
          }
        } catch (dbItemsErr) {
          console.warn('order_items SQL query note:', dbItemsErr);
        }
      }

      const totalCatRevenue = Object.values(categoryMap).reduce((s, c) => s + c.revenue, 0) || totalRevenue || 1;
      const categoryRevenue = Object.values(categoryMap)
        .map((c) => ({
          category_id: c.id,
          name: c.name,
          value: c.revenue,
          units: c.units,
          orders_count: c.orderIds.size,
          percentage: Math.round((c.revenue / totalCatRevenue) * 100),
        }))
        .sort((a, b) => b.value - a.value);

      const topProductsList = Object.values(productMap).sort((a, b) => b.units !== a.units ? b.units - a.units : b.revenue - a.revenue);
      const totalProdRevenue = topProductsList.reduce((s, p) => s + p.revenue, 0) || totalRevenue || 1;

      const productRevenue = topProductsList.map((p) => ({
        product_id: p.id,
        name: p.name,
        category: p.category,
        value: p.revenue,
        units: p.units,
        sales: p.units,
        orders_count: p.orderIds.size,
        percentage: Math.round((p.revenue / totalProdRevenue) * 100),
        image: p.image,
        unit_price: p.unit_price,
      }));

      const topPerformingProducts = topProductsList.slice(0, 8).map((p) => ({
        product_id: p.id,
        name: p.name,
        category: p.category,
        sales: p.units,
        units: p.units,
        revenue: p.revenue,
        orders_count: p.orderIds.size,
        image: p.image,
        unit_price: p.unit_price,
      }));

      res.json({
        totalRevenue,
        totalOrders,
        activeCustomers: activeCustomersCount,
        avgOrderValue,
        revenueProgression,
        orderVolume,
        categoryRevenue,
        productRevenue,
        topProducts: topPerformingProducts,
      });
    } catch (err: any) {
      res.status(500).json({ message: 'Analytics query error', error: err.message });
    }
  });

  // ==================== JOURNAL & FAQS ====================
  app.get('/api/journal', (req, res) => {
    res.json(journalStore.filter((j) => j.is_active).sort((a, b) => a.display_order - b.display_order));
  });

  app.get('/api/faqs', (req, res) => {
    res.json(faqsStore.filter((f) => f.is_active).sort((a, b) => a.display_order - b.display_order));
  });

  // ==================== NEWSLETTER ====================
  app.get('/api/newsletter', optionalAuth, async (req, res) => {
    if (sql) {
      try {
        const rows = await sql`SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC`;
        if (rows && rows.length > 0) {
          return res.json(rows.map((r: any) => ({
            id: r.id,
            email: r.email,
            is_active: r.is_active !== false,
            date: r.subscribed_at,
            subscribed_at: r.subscribed_at
          })));
        }
      } catch (e) {
        console.error('Neon newsletter fetch error:', e);
      }
    }
    res.json(newsletterStore);
  });

  app.post('/api/newsletter', async (req, res) => {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Valid email is required' });
    }
    const cleanEmail = email.toLowerCase().trim();

    if (sql) {
      try {
        const existing = await sql`SELECT * FROM newsletter_subscribers WHERE LOWER(email) = ${cleanEmail}`;
        if (existing && existing.length > 0) {
          return res.json({
            success: true,
            already_subscribed: true,
            message: 'You have already subscribed with this email.',
            subscriber: {
              id: existing[0].id,
              email: cleanEmail,
              is_active: existing[0].is_active,
              date: existing[0].subscribed_at
            }
          });
        }
        const inserted = await sql`
          INSERT INTO newsletter_subscribers (email, is_active)
          VALUES (${cleanEmail}, true)
          RETURNING *
        `;
        if (inserted && inserted.length > 0) {
          try {
            await sql`
              INSERT INTO notifications (title, message, type, link, is_read, created_at)
              VALUES (
                'New Newsletter Subscriber',
                ${cleanEmail + ' subscribed to Ravenza VIP newsletter.'},
                'newsletter',
                'newsletter',
                false,
                NOW()
              )
            `;
          } catch (notifErr: any) {
            console.warn('Newsletter notification insert note:', notifErr.message);
          }
        }
        adminNotificationsStore.unshift({
          id: `notif-sub-${Date.now()}`,
          title: 'New Newsletter Subscriber',
          message: `${cleanEmail} subscribed to Ravenza VIP newsletter.`,
          type: 'newsletter',
          link: 'newsletter',
          is_read: false,
          created_at: new Date().toISOString()
        });
        logAdminAudit('Newsletter Subscription', cleanEmail, 'Storefront');
        // Dispatch Welcome Email via Google Apps Script
        sendNewsletterWelcomeEmail(cleanEmail).catch(() => {});
        return res.json({
          success: true,
          already_subscribed: false,
          message: 'Thank you for subscribing to Ravenza VIP newsletter!',
          subscriber: {
            id: inserted[0].id,
            email: cleanEmail,
            is_active: true,
            date: inserted[0].subscribed_at
          }
        });
      } catch (e) {
        console.error('Neon newsletter insert error:', e);
      }
    }

    const existing = newsletterStore.find((n) => n.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.json({
        success: true,
        already_subscribed: true,
        message: 'You have already subscribed with this email.',
        subscriber: existing
      });
    }
    const newSub = {
      id: `sub-${Date.now()}`,
      email: cleanEmail,
      date: new Date().toISOString().split('T')[0],
      is_active: true,
    };
    newsletterStore.unshift(newSub);
    logAdminAudit('Newsletter Subscription', cleanEmail, 'Storefront');
    sendNewsletterWelcomeEmail(cleanEmail).catch(() => {});
    res.json({
      success: true,
      already_subscribed: false,
      message: 'Thank you for subscribing to Ravenza VIP newsletter!',
      subscriber: newSub
    });
  });

  app.patch('/api/newsletter/:id', optionalAuth, async (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;
    if (sql) {
      try {
        const rows = await sql`
          UPDATE newsletter_subscribers SET is_active = ${Boolean(is_active)}
          WHERE id::text = ${id} OR email = ${id}
          RETURNING *
        `;
        if (rows && rows.length > 0) {
          logAdminAudit('Newsletter Status Changed', rows[0].email, req.user?.name || 'Admin', `Active: ${is_active}`);
          return res.json({ success: true, subscriber: rows[0] });
        }
      } catch (e) {
        console.error('Neon newsletter update error:', e);
      }
    }

    const sub = newsletterStore.find((s) => s.id === id || s.email === id);
    if (!sub) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }
    sub.is_active = Boolean(is_active);
    logAdminAudit('Newsletter Status Changed', sub.email, req.user?.name || 'Admin', `Active: ${sub.is_active}`);
    res.json({ success: true, subscriber: sub });
  });

  app.delete('/api/newsletter/:id', optionalAuth, async (req, res) => {
    const { id } = req.params;
    if (sql) {
      try {
        await sql`DELETE FROM newsletter_subscribers WHERE id::text = ${id} OR email = ${id}`;
        logAdminAudit('Newsletter Subscriber Deleted', id, req.user?.name || 'Admin');
        return res.json({ success: true, message: 'Subscriber deleted' });
      } catch (e) {
        console.error('Neon newsletter delete error:', e);
      }
    }

    const idx = newsletterStore.findIndex((s) => s.id === id || s.email === id);
    if (idx === -1) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }
    const deleted = newsletterStore.splice(idx, 1)[0];
    logAdminAudit('Newsletter Subscriber Deleted', deleted.email, req.user?.name || 'Admin');
    res.json({ success: true, message: 'Subscriber deleted' });
  });

  app.post('/api/newsletter/send-thanks', optionalAuth, async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    const cleanEmail = email.toLowerCase().trim();
    const result = await sendNewsletterWelcomeEmail(cleanEmail);
    logAdminAudit('Newsletter Thanks Email Sent', cleanEmail, req.user?.name || 'Admin', `Sent welcome email to ${cleanEmail}`);
    res.json({
      success: true,
      message: `Thanks email sent successfully to ${cleanEmail}`,
      delivery: result
    });
  });

  // ==================== EMAIL MARKETING CAMPAIGNS ====================
  app.get('/api/email-campaigns', optionalAuth, (req, res) => {
    res.json(emailCampaignsStore);
  });

  app.post('/api/email-campaigns', optionalAuth, (req, res) => {
    const { name, subject, content, target_audience } = req.body;
    if (!subject || !content) {
      return res.status(400).json({ message: 'Subject and content are required' });
    }
    const newCampaign = {
      id: `camp-${Date.now()}`,
      name: name || subject,
      subject,
      content,
      target_audience: target_audience || 'all',
      status: 'draft' as const,
      recipients: 0,
      created_at: new Date().toISOString(),
    };
    emailCampaignsStore.unshift(newCampaign);
    logAdminAudit('Email Campaign Created', newCampaign.name, req.user?.name || 'Admin');
    res.status(201).json(newCampaign);
  });

  app.post('/api/email-campaigns/:id/send', optionalAuth, async (req, res) => {
    const { id } = req.params;
    const campaign = emailCampaignsStore.find((c) => c.id === id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Determine target recipient emails based on user selection
    let targetEmails: string[] = [];
    if (campaign.target_audience === 'subscribers') {
      targetEmails = newsletterStore.filter((s) => s.is_active).map((s) => s.email);
    } else if (campaign.target_audience === 'inactive_subscribers') {
      targetEmails = newsletterStore.filter((s) => !s.is_active).map((s) => s.email);
    } else if (campaign.target_audience === 'active_customers') {
      targetEmails = usersStore.filter((u) => u.role === 'customer' && u.is_active).map((u) => u.email);
    } else {
      // 'all': newsletter subscribers + customers
      const emailsSet = new Set<string>();
      newsletterStore.forEach((s) => emailsSet.add(s.email));
      usersStore.filter((u) => u.role === 'customer').forEach((u) => emailsSet.add(u.email));
      targetEmails = Array.from(emailsSet);
    }

    if (targetEmails.length === 0) {
      targetEmails = ['subscribers@ravenza.pk'];
    }

    // Trigger Google Apps Script Webhook
    let appsScriptUrl = (process.env.APPS_SCRIPT_EMAIL_WEBHOOK || process.env.APPS_SCRIPT_URL || process.env.GAS_WEBHOOK_URL || '').trim();
    if (appsScriptUrl.startsWith(':')) appsScriptUrl = appsScriptUrl.substring(1).trim();
    appsScriptUrl = appsScriptUrl.replace(/^["']|["']$/g, '');

    if (appsScriptUrl && appsScriptUrl.startsWith('http')) {
      try {
        console.log(`📡 Dispatching campaign "${campaign.subject}" to ${targetEmails.length} recipients via Apps Script...`);
        await fetch(appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emails: targetEmails,
            subject: campaign.subject,
            content: campaign.content,
            appName: 'RAVENZA Streetwear'
          })
        });
      } catch (err) {
        console.warn('Apps Script campaign delivery notice:', err);
      }
    } else {
      console.log(`ℹ️ Campaign simulated dispatch: ${targetEmails.length} recipients for "${campaign.subject}"`);
    }

    campaign.status = 'sent';
    campaign.sent_at = new Date().toISOString();
    campaign.recipients = targetEmails.length;

    logAdminAudit('Email Campaign Dispatched', campaign.name, req.user?.name || 'Admin', `Dispatched to ${targetEmails.length} recipients`);

    adminNotificationsStore.unshift({
      id: `notif-camp-${Date.now()}`,
      title: 'Email Campaign Dispatched',
      message: `Campaign "${campaign.name}" was successfully sent to ${targetEmails.length} recipients.`,
      type: 'system',
      is_read: false,
      created_at: new Date().toISOString(),
      link: 'email-marketing'
    });

    res.json({ success: true, message: 'Campaign sent successfully', campaign, totalSent: targetEmails.length });
  });

  app.delete('/api/email-campaigns/:id', optionalAuth, (req, res) => {
    const { id } = req.params;
    const idx = emailCampaignsStore.findIndex((c) => c.id === id);
    if (idx === -1) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    const deleted = emailCampaignsStore.splice(idx, 1)[0];
    logAdminAudit('Email Campaign Deleted', deleted.name, req.user?.name || 'Admin');
    res.json({ success: true, message: 'Campaign deleted' });
  });

  // ==================== OTP VERIFICATION ====================
  app.post('/api/send-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (cleanEmail === 'admin@ravenza.pk') {
      return res.status(400).json({
        message: 'Admin accounts cannot log in via Customer OTP. Please sign in with Email & Password at the Admin Portal.',
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryMs = 15 * 60 * 1000; // 15-minute OTP expiry
    const expiresAt = new Date(Date.now() + expiryMs);

    otpStore[cleanEmail] = {
      otp,
      expiresAt: Date.now() + expiryMs,
    };

    console.log(`📧 Generated 15-min OTP for ${cleanEmail}: ${otp}`);

    // Persist OTP record in Neon database
    if (sql) {
      try {
        await sql`
          INSERT INTO otp_verifications (email, otp, otp_code, expires_at, verified)
          VALUES (${cleanEmail}, ${otp}, ${otp}, ${expiresAt.toISOString()}, false)
        `;
        console.log(`💾 Saved OTP in Neon DB for ${cleanEmail}`);
      } catch (dbOtpErr) {
        console.warn('Neon save otp_verifications note:', dbOtpErr);
      }
    }

    // Clean up appsScriptUrl in case of accidental leading/trailing quotes or colon
    let appsScriptUrl = (process.env.APPS_SCRIPT_URL || process.env.GAS_WEBHOOK_URL || process.env.GOOGLE_SCRIPT_URL || '').trim();
    if (appsScriptUrl.startsWith(':')) {
      appsScriptUrl = appsScriptUrl.substring(1).trim();
    }
    appsScriptUrl = appsScriptUrl.replace(/^["']|["']$/g, '');

    let emailSentViaScript = false;
    if (appsScriptUrl && appsScriptUrl.startsWith('http')) {
      try {
        console.log(`📡 Triggering Google Apps Script webhook for ${cleanEmail}...`);
        const scriptRes = await fetch(appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            otp,
            appName: 'RAVENZA Streetwear',
            expiryMinutes: 15,
            subject: `Your RAVENZA Verification Code: ${otp}`
          })
        });
        if (scriptRes.ok) {
          emailSentViaScript = true;
          console.log(`✅ Google Apps Script dispatched OTP email to ${cleanEmail}`);
        } else {
          console.warn(`⚠️ Google Apps Script returned status ${scriptRes.status}`);
        }
      } catch (scriptErr) {
        console.warn('Apps Script delivery note:', scriptErr);
      }
    } else {
      console.log(`ℹ️ APPS_SCRIPT_URL not configured. OTP available in console: ${otp}`);
    }

    res.json({
      success: true,
      message: emailSentViaScript 
        ? `Verification code sent to ${cleanEmail}. Valid for 15 minutes.`
        : `Verification code generated for ${cleanEmail}. Valid for 15 minutes.`,
      otp, // Provided for developer preview
      expiresInMinutes: 15,
    });
  });

  // Alias route
  app.post('/api/auth/send-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const cleanEmail = email.toLowerCase().trim();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryMs = 15 * 60 * 1000;
    otpStore[cleanEmail] = { otp, expiresAt: Date.now() + expiryMs };

    if (sql) {
      try {
        await sql`
          INSERT INTO otp_verifications (email, otp, otp_code, expires_at, verified)
          VALUES (${cleanEmail}, ${otp}, ${otp}, ${new Date(Date.now() + expiryMs).toISOString()}, false)
        `;
      } catch (e) {
        console.warn('Neon save otp note:', e);
      }
    }

    console.log(`📧 Generated 15-min OTP for ${cleanEmail}: ${otp}`);
    res.json({ success: true, message: `OTP code sent to ${cleanEmail}. Valid for 15 minutes.`, otp });
  });

  const handleVerifyOtpLogic = async (req: any, res: any) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    let verified = false;

    // 1. Check Neon database otp_verifications table
    if (sql) {
      try {
        const rows = await sql`
          SELECT id FROM otp_verifications 
          WHERE LOWER(email) = ${cleanEmail}
            AND (otp = ${cleanOtp} OR otp_code = ${cleanOtp})
            AND verified = false
            AND expires_at > NOW()
          ORDER BY created_at DESC 
          LIMIT 1
        `;
        if (rows && rows.length > 0) {
          verified = true;
          await sql`UPDATE otp_verifications SET verified = true WHERE id = ${rows[0].id}`;
          console.log(`✅ Verified OTP in Neon DB for ${cleanEmail}`);
        }
      } catch (dbErr) {
        console.warn('Neon verify OTP check note:', dbErr);
      }
    }

    // 2. Memory store fallback
    if (!verified) {
      const record = otpStore[cleanEmail];
      if (record && record.expiresAt >= Date.now() && record.otp === cleanOtp) {
        verified = true;
        delete otpStore[cleanEmail];
      }
    }

    if (!verified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired verification code (codes expire in 15 minutes). Please request a new code.' 
      });
    }

    // Auto-login or register customer in Neon DB
    let userRecord: any = null;
    if (sql) {
      try {
        const dbUsers = await sql`SELECT * FROM users WHERE LOWER(email) = ${cleanEmail} LIMIT 1`;
        if (dbUsers && dbUsers.length > 0) {
          userRecord = {
            id: dbUsers[0].id,
            email: dbUsers[0].email,
            name: dbUsers[0].name || cleanEmail.split('@')[0],
            phone: dbUsers[0].phone || '',
            role: dbUsers[0].role || 'customer',
            is_verified: true,
          };
          await sql`UPDATE users SET is_verified = true, last_login = NOW() WHERE id = ${dbUsers[0].id}`;
        }
      } catch (e) {
        console.warn('Neon check user error:', e);
      }
    }

    if (!userRecord) {
      userRecord = usersStore.find((u) => u.email.toLowerCase() === cleanEmail);
    }

    if (!userRecord) {
      const newUserId = `usr-${Date.now()}`;
      userRecord = {
        id: newUserId,
        email: cleanEmail,
        name: cleanEmail.split('@')[0],
        phone: '',
        role: 'customer',
        is_verified: true,
      };

      if (sql) {
        try {
          const insertedUser = await sql`
            INSERT INTO users (email, name, role, is_verified, is_active)
            VALUES (${cleanEmail}, ${userRecord.name}, 'customer', true, true)
            ON CONFLICT (email) DO UPDATE SET is_verified = true, last_login = NOW()
            RETURNING id, email, name, phone, role
          `;
          if (insertedUser && insertedUser.length > 0) {
            userRecord = {
              id: insertedUser[0].id,
              email: insertedUser[0].email,
              name: insertedUser[0].name,
              phone: insertedUser[0].phone || '',
              role: insertedUser[0].role || 'customer',
              is_verified: true,
            };
          }
        } catch (e) {
          console.warn('Neon auto-register user note:', e);
        }
      }

      usersStore.push(userRecord as any);
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
  };

  app.post('/api/verify-otp', handleVerifyOtpLogic);
  app.post('/api/auth/verify-otp', handleVerifyOtpLogic);

  // ==================== COUPONS (coupon_codes table) ====================
  app.post('/api/validate-coupon', async (req, res) => {
    try {
      const { code, orderAmount } = req.body;
      if (!code || typeof code !== 'string' || !code.trim()) {
        return res.status(400).json({ valid: false, message: 'Coupon code is required' });
      }

      const cleanCode = code.trim().toUpperCase();
      let coupon: any = null;

      if (sql) {
        try {
          const rows = await sql`
            SELECT id, code, discount_type, discount_value, min_order_amount, max_discount,
                   usage_limit, used_count, starts_at, ends_at, is_active
            FROM coupon_codes
            WHERE UPPER(code) = ${cleanCode}
            LIMIT 1
          `;
          if (rows && rows.length > 0) {
            coupon = rows[0];
          }
        } catch (dbErr: any) {
          console.warn('Coupon lookup database warning:', dbErr.message);
        }
      }

      if (!coupon) {
        coupon = couponsStore.find((c) => c.code.toUpperCase() === cleanCode);
      }

      if (!coupon) {
        return res.json({ valid: false, message: 'Invalid coupon code' });
      }

      if (!coupon.is_active) {
        return res.json({ valid: false, message: 'This coupon code is currently disabled or inactive' });
      }

      const now = new Date();

      // Check starts_at
      if (coupon.starts_at) {
        const startsAt = new Date(coupon.starts_at);
        if (!isNaN(startsAt.getTime()) && now < startsAt) {
          return res.json({
            valid: false,
            message: `Coupon is not active yet (starts on ${startsAt.toLocaleDateString()})`,
          });
        }
      }

      // Check expiry (ends_at)
      if (coupon.ends_at) {
        const endsAt = new Date(coupon.ends_at);
        if (!isNaN(endsAt.getTime()) && now > endsAt) {
          return res.json({
            valid: false,
            message: `This coupon code expired on ${endsAt.toLocaleDateString()}`,
          });
        }
      }

      // Check usage_limit vs used_count
      const usedCount = Number(coupon.used_count || 0);
      const usageLimit = coupon.usage_limit != null ? Number(coupon.usage_limit) : null;
      if (usageLimit !== null && usageLimit > 0 && usedCount >= usageLimit) {
        return res.json({
          valid: false,
          message: 'Coupon usage limit has been reached',
        });
      }

      // Check min_order_amount
      const amt = Number(orderAmount) || 0;
      const minOrder = Number(coupon.min_order_amount || 0);
      if (minOrder > 0 && amt < minOrder) {
        return res.json({
          valid: false,
          message: `Minimum order amount of Rs. ${minOrder.toLocaleString()} required to use this coupon`,
        });
      }

      const discVal = Number(coupon.discount_value) || 0;
      let discount = 0;

      if (coupon.discount_type === 'percentage') {
        discount = (amt * discVal) / 100;
        const maxDisc = coupon.max_discount != null ? Number(coupon.max_discount) : null;
        if (maxDisc !== null && maxDisc > 0 && discount > maxDisc) {
          discount = maxDisc;
        }
      } else {
        discount = Math.min(amt, discVal);
      }

      res.json({
        valid: true,
        discount: Math.round(discount),
        coupon: {
          id: coupon.id,
          code: coupon.code,
          type: coupon.discount_type,
          value: discVal,
          min_order_amount: minOrder,
          max_discount: coupon.max_discount ? Number(coupon.max_discount) : null,
          usage_limit: usageLimit,
          used_count: usedCount,
        },
      });
    } catch (err: any) {
      console.error('Validate coupon error:', err);
      res.status(500).json({ valid: false, message: 'Error validating coupon: ' + err.message });
    }
  });

  app.get('/api/coupons', async (req, res) => {
    try {
      if (sql) {
        try {
          const rows = await sql`
            SELECT id, code, discount_type, discount_value, min_order_amount, max_discount,
                   usage_limit, used_count, starts_at, ends_at, is_active, created_at
            FROM coupon_codes
            ORDER BY created_at DESC
          `;
          if (rows && rows.length > 0) {
            const formatted = rows.map((c: any) => ({
              id: c.id,
              code: c.code,
              discount_type: c.discount_type,
              discount_value: Number(c.discount_value),
              min_order_amount: c.min_order_amount ? Number(c.min_order_amount) : 0,
              max_discount: c.max_discount ? Number(c.max_discount) : null,
              usage_limit: c.usage_limit ? Number(c.usage_limit) : null,
              used_count: Number(c.used_count || 0),
              starts_at: c.starts_at ? new Date(c.starts_at).toISOString() : null,
              ends_at: c.ends_at ? new Date(c.ends_at).toISOString() : null,
              is_active: c.is_active !== false,
              created_at: c.created_at ? new Date(c.created_at).toISOString() : new Date().toISOString(),
            }));
            couponsStore = formatted;
            return res.json(formatted);
          }
        } catch (dbErr: any) {
          console.warn('Coupon get DB warning:', dbErr.message);
        }
      }
      res.json(couponsStore);
    } catch (err: any) {
      console.error('Get coupons error:', err);
      res.status(500).json({ message: 'Error fetching coupons' });
    }
  });

  app.post('/api/coupons', async (req, res) => {
    try {
      const {
        code,
        discount_type,
        discount_value,
        min_order_amount,
        max_discount,
        usage_limit,
        starts_at,
        ends_at,
        is_active,
      } = req.body;

      if (!code || typeof code !== 'string' || !code.trim()) {
        return res.status(400).json({ message: 'Coupon code is required' });
      }

      const cleanCode = code.trim().toUpperCase();
      const discType = discount_type === 'fixed' ? 'fixed' : 'percentage';
      const discValue = Number(discount_value) || 0;
      const minOrder = min_order_amount !== undefined && min_order_amount !== '' && min_order_amount !== null
        ? Number(min_order_amount)
        : null;
      const maxDisc = max_discount !== undefined && max_discount !== '' && max_discount !== null
        ? Number(max_discount)
        : null;
      const usageLim = usage_limit !== undefined && usage_limit !== '' && usage_limit !== null
        ? Math.max(1, parseInt(String(usage_limit), 10))
        : null;
      const startsAtVal = starts_at ? new Date(starts_at).toISOString() : null;
      const endsAtVal = ends_at ? new Date(ends_at).toISOString() : null;
      const activeVal = is_active !== false;

      let savedCoupon: any = null;

      if (sql) {
        try {
          const rows = await sql`
            INSERT INTO coupon_codes (
              code, discount_type, discount_value, min_order_amount, max_discount,
              usage_limit, used_count, starts_at, ends_at, is_active
            ) VALUES (
              ${cleanCode}, ${discType}, ${discValue}, ${minOrder}, ${maxDisc},
              ${usageLim}, 0, ${startsAtVal}, ${endsAtVal}, ${activeVal}
            )
            ON CONFLICT (code) DO UPDATE SET
              discount_type = EXCLUDED.discount_type,
              discount_value = EXCLUDED.discount_value,
              min_order_amount = EXCLUDED.min_order_amount,
              max_discount = EXCLUDED.max_discount,
              usage_limit = EXCLUDED.usage_limit,
              starts_at = EXCLUDED.starts_at,
              ends_at = EXCLUDED.ends_at,
              is_active = EXCLUDED.is_active
            RETURNING *
          `;
          if (rows && rows.length > 0) {
            savedCoupon = {
              id: rows[0].id,
              code: rows[0].code,
              discount_type: rows[0].discount_type,
              discount_value: Number(rows[0].discount_value),
              min_order_amount: rows[0].min_order_amount ? Number(rows[0].min_order_amount) : 0,
              max_discount: rows[0].max_discount ? Number(rows[0].max_discount) : null,
              usage_limit: rows[0].usage_limit ? Number(rows[0].usage_limit) : null,
              used_count: Number(rows[0].used_count || 0),
              starts_at: rows[0].starts_at ? new Date(rows[0].starts_at).toISOString() : null,
              ends_at: rows[0].ends_at ? new Date(rows[0].ends_at).toISOString() : null,
              is_active: rows[0].is_active !== false,
              created_at: rows[0].created_at ? new Date(rows[0].created_at).toISOString() : new Date().toISOString(),
            };
          }
        } catch (dbErr: any) {
          console.error('Neon coupon insert error:', dbErr.message);
          throw dbErr;
        }
      }

      if (!savedCoupon) {
        savedCoupon = {
          id: `cpn-${Date.now()}`,
          code: cleanCode,
          discount_type: discType,
          discount_value: discValue,
          min_order_amount: minOrder || 0,
          max_discount: maxDisc || undefined,
          usage_limit: usageLim || undefined,
          used_count: 0,
          starts_at: startsAtVal,
          ends_at: endsAtVal,
          is_active: activeVal,
          created_at: new Date().toISOString(),
        };
      }

      couponsStore = couponsStore.filter((c) => c.code !== cleanCode);
      couponsStore.unshift(savedCoupon);
      logAdminAudit('Coupon Created', cleanCode, 'Admin', `${discType}: ${discValue}`);
      res.status(201).json(savedCoupon);
    } catch (err: any) {
      console.error('Create coupon error:', err);
      res.status(500).json({ message: 'Error creating coupon: ' + err.message });
    }
  });

  app.put('/api/coupons/:idOrCode', async (req, res) => {
    try {
      const { idOrCode } = req.params;
      const b = req.body;
      const cleanCode = b.code ? b.code.trim().toUpperCase() : undefined;
      const discType = b.discount_type ? (b.discount_type === 'fixed' ? 'fixed' : 'percentage') : undefined;
      const discValue = b.discount_value !== undefined ? Number(b.discount_value) : undefined;
      const minOrder = b.min_order_amount !== undefined
        ? (b.min_order_amount === '' || b.min_order_amount === null ? null : Number(b.min_order_amount))
        : undefined;
      const maxDisc = b.max_discount !== undefined
        ? (b.max_discount === '' || b.max_discount === null ? null : Number(b.max_discount))
        : undefined;
      const usageLim = b.usage_limit !== undefined
        ? (b.usage_limit === '' || b.usage_limit === null ? null : Math.max(1, parseInt(String(b.usage_limit), 10)))
        : undefined;
      const startsAtVal = b.starts_at !== undefined
        ? (b.starts_at ? new Date(b.starts_at).toISOString() : null)
        : undefined;
      const endsAtVal = b.ends_at !== undefined
        ? (b.ends_at ? new Date(b.ends_at).toISOString() : null)
        : undefined;
      const activeVal = b.is_active !== undefined ? Boolean(b.is_active) : undefined;

      let updatedCoupon: any = null;

      if (sql) {
        try {
          const rows = await sql`
            UPDATE coupon_codes SET
              code = COALESCE(${cleanCode ?? null}, code),
              discount_type = COALESCE(${discType ?? null}, discount_type),
              discount_value = COALESCE(${discValue ?? null}, discount_value),
              min_order_amount = ${minOrder !== undefined ? minOrder : sql`min_order_amount`},
              max_discount = ${maxDisc !== undefined ? maxDisc : sql`max_discount`},
              usage_limit = ${usageLim !== undefined ? usageLim : sql`usage_limit`},
              starts_at = ${startsAtVal !== undefined ? startsAtVal : sql`starts_at`},
              ends_at = ${endsAtVal !== undefined ? endsAtVal : sql`ends_at`},
              is_active = COALESCE(${activeVal ?? null}, is_active)
            WHERE id::text = ${idOrCode} OR UPPER(code) = UPPER(${idOrCode})
            RETURNING *
          `;
          if (rows && rows.length > 0) {
            updatedCoupon = {
              id: rows[0].id,
              code: rows[0].code,
              discount_type: rows[0].discount_type,
              discount_value: Number(rows[0].discount_value),
              min_order_amount: rows[0].min_order_amount ? Number(rows[0].min_order_amount) : 0,
              max_discount: rows[0].max_discount ? Number(rows[0].max_discount) : null,
              usage_limit: rows[0].usage_limit ? Number(rows[0].usage_limit) : null,
              used_count: Number(rows[0].used_count || 0),
              starts_at: rows[0].starts_at ? new Date(rows[0].starts_at).toISOString() : null,
              ends_at: rows[0].ends_at ? new Date(rows[0].ends_at).toISOString() : null,
              is_active: rows[0].is_active !== false,
              created_at: rows[0].created_at ? new Date(rows[0].created_at).toISOString() : new Date().toISOString(),
            };
          }
        } catch (dbErr: any) {
          console.error('Neon coupon update error:', dbErr.message);
          throw dbErr;
        }
      }

      if (!updatedCoupon) {
        const idx = couponsStore.findIndex((c) => c.id === idOrCode || c.code.toUpperCase() === idOrCode.toUpperCase());
        if (idx !== -1) {
          couponsStore[idx] = {
            ...couponsStore[idx],
            ...(cleanCode ? { code: cleanCode } : {}),
            ...(discType ? { discount_type: discType } : {}),
            ...(discValue !== undefined ? { discount_value: discValue } : {}),
            ...(minOrder !== undefined ? { min_order_amount: minOrder || 0 } : {}),
            ...(maxDisc !== undefined ? { max_discount: maxDisc || undefined } : {}),
            ...(usageLim !== undefined ? { usage_limit: usageLim || undefined } : {}),
            ...(startsAtVal !== undefined ? { starts_at: startsAtVal } : {}),
            ...(endsAtVal !== undefined ? { ends_at: endsAtVal } : {}),
            ...(activeVal !== undefined ? { is_active: activeVal } : {}),
          };
          updatedCoupon = couponsStore[idx];
        }
      } else {
        const idx = couponsStore.findIndex((c) => c.id === updatedCoupon.id || c.code === updatedCoupon.code);
        if (idx !== -1) {
          couponsStore[idx] = updatedCoupon;
        } else {
          couponsStore.unshift(updatedCoupon);
        }
      }

      if (!updatedCoupon) {
        return res.status(404).json({ message: 'Coupon not found' });
      }

      logAdminAudit('Coupon Updated', updatedCoupon.code, 'Admin', `Fields: ${Object.keys(b).join(', ')}`);
      res.json(updatedCoupon);
    } catch (err: any) {
      console.error('Update coupon error:', err);
      res.status(500).json({ message: 'Error updating coupon: ' + err.message });
    }
  });

  app.delete('/api/coupons/:idOrCode', async (req, res) => {
    try {
      const { idOrCode } = req.params;
      if (sql) {
        try {
          await sql`
            DELETE FROM coupon_codes
            WHERE id::text = ${idOrCode} OR UPPER(code) = UPPER(${idOrCode})
          `;
        } catch (dbErr: any) {
          console.error('Neon delete coupon error:', dbErr.message);
        }
      }
      const existing = couponsStore.find((c) => c.id === idOrCode || c.code.toUpperCase() === idOrCode.toUpperCase());
      const cCode = existing ? existing.code : idOrCode;
      couponsStore = couponsStore.filter((c) => c.id !== idOrCode && c.code.toUpperCase() !== idOrCode.toUpperCase());
      logAdminAudit('Coupon Deleted', cCode, 'Admin');
      res.json({ success: true, message: 'Coupon deleted successfully' });
    } catch (err: any) {
      console.error('Delete coupon error:', err);
      res.status(500).json({ message: 'Error deleting coupon: ' + err.message });
    }
  });

  // ==================== ADMIN CUSTOMERS ROUTE ====================
  app.get('/api/admin/customers', async (req, res) => {
    try {
      if (sql) {
        try {
          const rows = await sql`
            SELECT 
              u.id, 
              u.name, 
              u.email, 
              u.phone, 
              u.role, 
              u.is_verified, 
              u.is_active, 
              u.created_at,
              COUNT(DISTINCT o.id)::int as orders_count,
              COALESCE(SUM(o.total::numeric), 0)::numeric(10,2) as total_spent
            FROM users u
            LEFT JOIN orders o ON (
              o.user_id = u.id 
              OR LOWER(o.shipping_address->>'email') = LOWER(u.email)
              OR o.user_id::text = u.email
            )
            WHERE u.role = 'customer' OR u.role IS NULL
            GROUP BY u.id, u.name, u.email, u.phone, u.role, u.is_verified, u.is_active, u.created_at
            ORDER BY total_spent DESC, u.created_at DESC
          `;
          if (rows && rows.length > 0) {
            return res.json(rows.map((r: any) => ({
              id: r.id,
              name: r.name || 'Anonymous Customer',
              email: r.email,
              phone: r.phone || 'N/A',
              role: r.role || 'customer',
              is_verified: r.is_verified !== false,
              is_active: r.is_active !== false,
              created_at: r.created_at,
              orders_count: Number(r.orders_count) || 0,
              total_spent: Number(r.total_spent) || 0,
            })));
          }
        } catch (e) {
          console.error('Neon customers query error:', e);
        }
      }
      res.json(usersStore.filter(u => u.role === 'customer').map(u => {
        const uOrders = ordersStore.filter(o => o.user_id === u.id || o.shipping_address?.email?.toLowerCase() === u.email?.toLowerCase());
        return {
          id: u.id,
          name: u.name || 'Anonymous Customer',
          email: u.email,
          phone: u.phone || 'N/A',
          role: u.role,
          is_verified: u.is_verified !== false,
          is_active: u.is_active !== false,
          created_at: u.created_at || '2024-01-15T10:00:00Z',
          orders_count: uOrders.length,
          total_spent: uOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0)
        };
      }));
    } catch (err: any) {
      res.status(500).json({ message: 'Error fetching customers', error: err.message });
    }
  });

  // ==================== AUDIT LOGS ROUTES ====================
  app.get('/api/admin/audit-logs', async (req, res) => {
    if (sql) {
      try {
        const rows = await sql`SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 200`;
        if (rows && rows.length > 0) {
          return res.json(rows.map((r: any) => ({
            id: r.id,
            action: r.action,
            entity: r.entity_id || r.entity_type,
            user: r.performed_by || 'Admin',
            details: typeof r.changes === 'object' ? (r.changes?.details || JSON.stringify(r.changes)) : r.changes,
            created_at: r.created_at
          })));
        }
      } catch (e) {
        console.error('Neon audit logs fetch error:', e);
      }
    }
    res.json(auditLogsStore);
  });

  app.post('/api/admin/audit-logs', async (req, res) => {
    const { action, entity, user, details } = req.body;
    await logAdminAudit(action || 'System Action', entity || 'General', user || 'Admin', details);
    res.status(201).json({ success: true, log: auditLogsStore[0] });
  });

  app.delete('/api/admin/audit-logs', optionalAuth, async (req, res) => {
    auditLogsStore = [];
    if (sql) {
      try {
        await sql`DELETE FROM audit_logs`;
      } catch (e) {
        console.error('Neon audit logs delete error:', e);
      }
    }
    logAdminAudit('Audit Logs Cleared', 'System', req.user?.name || 'Admin', 'All system audit logs were reset.');
    res.json({ success: true, message: 'Audit logs cleared successfully' });
  });

  // ==================== NOTIFICATIONS ROUTES ====================
  app.get('/api/admin/notifications', async (req, res) => {
    const showAll = req.query.all === 'true';
    if (sql) {
      try {
        const rows = showAll
          ? await sql`SELECT * FROM notifications ORDER BY created_at DESC LIMIT 60`
          : await sql`SELECT * FROM notifications WHERE is_read = false ORDER BY created_at DESC LIMIT 60`;
        if (rows && rows.length > 0) {
          return res.json(rows.map((r: any) => ({
            id: r.id,
            title: r.title,
            message: r.message,
            type: r.type || 'system',
            is_read: r.is_read === true,
            created_at: r.created_at,
            link: r.link
          })));
        } else if (!showAll) {
          // If no unread rows in DB, return empty array
          return res.json([]);
        }
      } catch (e) {
        console.error('Neon notifications fetch error:', e);
      }
    }

    try {
      // Dynamic stock checks for automatic alerts based on each product's specific low_stock_threshold
      (productsStore || []).forEach(p => {
        if (!p || !p.name) return;
        const threshold = Number(p.low_stock_threshold ?? 4);

        let stock = 0;
        const matrix = Array.isArray(p.variants_matrix) 
          ? p.variants_matrix 
          : (typeof p.variants_matrix === 'string' ? (() => { try { return JSON.parse(p.variants_matrix); } catch { return []; } })() : []);
        if (matrix && matrix.length > 0) {
          stock = matrix.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0);
        } else if (typeof (p as any).stockCount === 'number') {
          stock = (p as any).stockCount;
        } else if (typeof p.stock === 'number') {
          stock = p.stock;
        }

        if (stock <= threshold) {
          const exists = adminNotificationsStore.some(n => n && n.type === 'stock' && n.message && n.message.includes(p.name));
          if (!exists) {
            adminNotificationsStore.unshift({
              id: `notif-stock-${p.id || Date.now()}`,
              title: stock === 0 ? 'Out of Stock Alert' : 'Critical Low Stock',
              message: `${p.name} has only ${stock} units remaining (threshold: ${threshold}). Replenishment required.`,
              type: 'stock',
              is_read: false,
              created_at: new Date().toISOString(),
              link: 'inventory'
            });
          }
        }
      });

      const filtered = showAll ? adminNotificationsStore : adminNotificationsStore.filter(n => !n.is_read);
      res.json(filtered || []);
    } catch (err: any) {
      console.error('Error fetching admin notifications:', err);
      res.json(adminNotificationsStore || []);
    }
  });

  app.post('/api/admin/notifications', optionalAuth, async (req, res) => {
    const { title, message, type, link } = req.body;
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message required' });
    }
    let notifId = `notif-custom-${Date.now()}`;
    if (sql) {
      try {
        const rows = await sql`
          INSERT INTO notifications (title, message, type, link, is_read, created_at)
          VALUES (${title}, ${message}, ${type || 'system'}, ${link || 'dashboard'}, false, NOW())
          RETURNING id, created_at
        `;
        if (rows && rows.length > 0) {
          notifId = rows[0].id;
        }
      } catch (e: any) {
        console.error('Neon notification insert error:', e.message);
      }
    }
    const newNotif = {
      id: notifId,
      title,
      message,
      type: type || 'system',
      is_read: false,
      created_at: new Date().toISOString(),
      link: link || 'dashboard'
    };
    adminNotificationsStore.unshift(newNotif as any);
    res.status(201).json(newNotif);
  });

  app.put('/api/admin/notifications/:id/read', async (req, res) => {
    const { id } = req.params;
    if (sql) {
      try {
        if (id === 'all') {
          await sql`UPDATE notifications SET is_read = true WHERE is_read = false`;
        } else {
          await sql`UPDATE notifications SET is_read = true WHERE id::text = ${id}`;
        }
      } catch (e: any) {
        console.error('Neon mark notification read error:', e.message);
      }
    }
    if (id === 'all') {
      adminNotificationsStore = adminNotificationsStore.map(n => ({ ...n, is_read: true }));
    } else {
      adminNotificationsStore = adminNotificationsStore.map(n => n.id === id ? { ...n, is_read: true } : n);
    }
    res.json({ success: true });
  });

  app.delete('/api/admin/notifications/:id', async (req, res) => {
    const { id } = req.params;
    if (sql) {
      try {
        if (id === 'all') {
          await sql`DELETE FROM notifications`;
        } else {
          await sql`DELETE FROM notifications WHERE id::text = ${id}`;
        }
      } catch (e: any) {
        console.error('Neon delete notification error:', e.message);
      }
    }
    if (id === 'all') {
      adminNotificationsStore = [];
    } else {
      adminNotificationsStore = adminNotificationsStore.filter(n => n.id !== id);
    }
    res.json({ success: true });
  });

  // Sync initial memory stores with Neon DB if connected
  await syncStoresFromNeon();

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
    app.get('*all', (req, res) => {
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