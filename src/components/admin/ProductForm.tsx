import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2, Save, ChevronLeft, ChevronRight, Package, Tag, Image, Palette, Ruler, FileText, Loader2, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useStore, Product } from '../../store/useStore';
import api from '../../services/api';

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
}

const steps = [
  { id: 1, title: 'Basic Info', icon: Package, description: 'Name, description & pricing' },
  { id: 2, title: 'Category', icon: Tag, description: 'Category & collection' },
  { id: 3, title: 'Images', icon: Image, description: 'Product gallery' },
  { id: 4, title: 'Variants', icon: Palette, description: 'Sizes & colors' },
  { id: 5, title: 'Specifications', icon: Ruler, description: 'Fabric, fit & details' },
  { id: 6, title: 'SEO & Status', icon: FileText, description: 'Meta tags & visibility' },
];

export default function ProductForm({ product, onClose }: ProductFormProps) {
  const { addProduct, updateProduct, categories, fetchProducts } = useStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const getInitialImages = (p?: Product | null) => {
    if (!p) return [];
    if (Array.isArray(p.images) && p.images.length > 0) return p.images;
    if (p.image_url) return [p.image_url];
    if (p.image) return [p.image];
    return [];
  };

  const [formData, setFormData] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    base_price: product?.base_price || product?.price || 0,
    compare_at_price: product?.compare_at_price || product?.salePrice || null as number | null,
    cost_price: (product as any)?.cost_price || null as number | null,
    category_id: product?.category_id || '',
    subcategory_id: (product as any)?.subcategory_id || '',
    category_slug: product?.category_slug || product?.category || '',
    brand: product?.brand || 'RAVENZA',
    fabric: product?.fabric || '',
    fit: product?.fit || '',
    sku: product?.sku || '',
    is_new_arrival: Boolean(product?.is_new_arrival ?? product?.isNew),
    is_best_seller: Boolean(product?.is_best_seller ?? (product as any)?.is_bestseller ?? product?.isBestseller),
    is_featured: Boolean(product?.is_featured ?? product?.isFeatured),
    is_spotlight: Boolean((product as any)?.is_spotlight),
    low_stock_threshold: Number((product as any)?.low_stock_threshold) || 4,
    badge: product?.badge || '',
    images: getInitialImages(product),
    attributes: product?.attributes || { sizes: ['S', 'M', 'L', 'XL'], colors: ['Black'] },
    fabric_composition: product?.fabric_composition || '',
    fabric_finish: product?.fabric_finish || '',
    graphic_print: product?.graphic_print || '',
    garment_specs: product?.garment_specs || '',
    garment_care: product?.garment_care || '',
    shipping_delivery: product?.shipping_delivery || 'Free shipping above Rs.3000',
    model_size: product?.model_size || '',
    meta_title: product?.meta_title || '',
    meta_description: product?.meta_description || '',
    focus_keywords: product?.focus_keywords || '',
    status: product?.status || 'active',
    is_draft: product?.is_draft || false,
  });

  const [sizeGuideEnabled, setSizeGuideEnabled] = useState<boolean>(
    Boolean((product as any)?.size_guide_enabled || (product as any)?.size_guide?.enabled)
  );

  const [sizeGuideChart, setSizeGuideChart] = useState<any[]>(
    Array.isArray((product as any)?.size_guide?.chart) && (product as any).size_guide.chart.length > 0
      ? (product as any).size_guide.chart
      : [
          { size: 'S', chest: '40"', length: '28"', shoulder: '19"', sleeve: '8.5"' },
          { size: 'M', chest: '42"', length: '29"', shoulder: '20"', sleeve: '9.0"' },
          { size: 'L', chest: '44"', length: '30"', shoulder: '21"', sleeve: '9.5"' },
          { size: 'XL', chest: '46"', length: '31"', shoulder: '22"', sleeve: '10.0"' },
          { size: 'XXL', chest: '48"', length: '32"', shoulder: '23"', sleeve: '10.5"' },
        ]
  );

  const [batchSizePrices, setBatchSizePrices] = useState<Record<string, number | string>>({});

  // Sync state when editing product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        base_price: product.base_price || product.price || 0,
        compare_at_price: product.compare_at_price || product.salePrice || null,
        cost_price: (product as any)?.cost_price || null,
        category_id: product.category_id || categories.find(c => c.slug === (product.category_slug || product.category))?.id || '',
        subcategory_id: (product as any).subcategory_id || '',
        category_slug: product.category_slug || product.category || '',
        brand: product.brand || 'RAVENZA',
        fabric: product.fabric || '',
        fit: product.fit || '',
        sku: product.sku || '',
        is_new_arrival: Boolean(product.is_new_arrival ?? product.isNew),
        is_best_seller: Boolean(product.is_best_seller ?? (product as any)?.is_bestseller ?? product.isBestseller),
        is_featured: Boolean(product.is_featured ?? product.isFeatured),
        is_spotlight: Boolean((product as any)?.is_spotlight),
        low_stock_threshold: Number((product as any)?.low_stock_threshold) || 4,
        badge: product.badge || '',
        images: getInitialImages(product),
        attributes: product.attributes || { sizes: product.sizes || ['S', 'M', 'L', 'XL'], colors: product.colors || ['Black'] },
        fabric_composition: product.fabric_composition || '',
        fabric_finish: product.fabric_finish || '',
        graphic_print: product.graphic_print || '',
        garment_specs: product.garment_specs || '',
        garment_care: product.garment_care || '',
        shipping_delivery: product.shipping_delivery || 'Free shipping above Rs.3000',
        model_size: product.model_size || '',
        meta_title: product.meta_title || '',
        meta_description: product.meta_description || '',
        focus_keywords: product.focus_keywords || '',
        status: product.status || 'active',
        is_draft: product.is_draft || false,
      });

      setSizeGuideEnabled(Boolean((product as any).size_guide_enabled || (product as any).size_guide?.enabled));
      if (Array.isArray((product as any).size_guide?.chart) && (product as any).size_guide.chart.length > 0) {
        setSizeGuideChart((product as any).size_guide.chart);
      }

      if (product.variants_matrix && Array.isArray(product.variants_matrix) && product.variants_matrix.length > 0) {
        setVariants(product.variants_matrix);
        variantsInitializedRef.current = true;
      }
    }
  }, [product, categories]);

  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newColorHex, setNewColorHex] = useState('#000000');
  const [imageUrl, setImageUrl] = useState('');
  const [variants, setVariants] = useState<any[]>(
    product?.variants_matrix && Array.isArray(product.variants_matrix) ? product.variants_matrix : []
  );
  const variantsRef = useRef<any[]>(variants);
  variantsRef.current = variants;
  const variantsInitializedRef = useRef(Boolean(product?.variants_matrix && product.variants_matrix.length > 0));
  const [additionalSpecs, setAdditionalSpecs] = useState<{key: string; value: string}[]>([]);

  const update = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'name') {
      setFormData(prev => ({ ...prev, slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }));
    }
  };

  const addSize = () => {
    if (newSize && !formData.attributes.sizes.includes(newSize)) {
      update('attributes', { ...formData.attributes, sizes: [...formData.attributes.sizes, newSize] });
      setNewSize('');
    }
  };

  const removeSize = (size: string) => {
    update('attributes', { ...formData.attributes, sizes: formData.attributes.sizes.filter(s => s !== size) });
  };

  const addColor = () => {
    if (newColor) {
      const colorObj = { name: newColor, hex: newColorHex };
      const existingColors = formData.attributes.colors || [];
      const colorExists = existingColors.some((c: any) => 
        typeof c === 'string' ? c === newColor : c.name === newColor
      );
      
      if (!colorExists) {
        update('attributes', { 
          ...formData.attributes, 
          colors: [...existingColors, colorObj] 
        });
        setNewColor('');
        setNewColorHex('#000000');
      }
    }
  };

  const removeColor = (color: any) => {
    const colorName = typeof color === 'string' ? color : color.name;
    const updatedColors = formData.attributes.colors.filter((c: any) => {
      const cName = typeof c === 'string' ? c : c.name;
      return cName !== colorName;
    });
    update('attributes', { ...formData.attributes, colors: updatedColors });
  };

  const addImage = () => {
    if (imageUrl) {
      update('images', [...formData.images, imageUrl]);
      setImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    update('images', formData.images.filter((_, i) => i !== index));
  };

  // Auto-generate variants matrix when sizes or colors change, but preserve user inputs
  useEffect(() => {
    const sizes = formData.attributes.sizes || [];
    const colors = formData.attributes.colors || [];
    
    if (sizes.length > 0 && colors.length > 0) {
      const currentList = variantsRef.current || [];
      // If already initialized with valid variants for this combination, keep existing values
      if (variantsInitializedRef.current && currentList.length > 0) {
        const updatedList: any[] = [];
        sizes.forEach((size: string) => {
          colors.forEach((color: any) => {
            const colorName = typeof color === 'string' ? color : color.name;
            const existing = currentList.find((v: any) => v.size === size && v.color === colorName);
            if (existing) {
              updatedList.push(existing);
            } else {
              updatedList.push({
                size,
                color: colorName,
                price: (size === sizes[0] ? formData.base_price : null),
                stock: 0,
                sku: `${formData.sku || 'RVZ'}-${size}-${colorName.replace(/\s+/g, '-').toUpperCase()}`
              });
            }
          });
        });
        setVariants(updatedList);
        return;
      }

      const newVariants: any[] = [];
      sizes.forEach((size: string) => {
        colors.forEach((color: any) => {
          const colorName = typeof color === 'string' ? color : color.name;
          const existingVariant = currentList.find((v: any) => v.size === size && v.color === colorName);
          
          newVariants.push({
            size,
            color: colorName,
            price: existingVariant?.price || (size === sizes[0] ? formData.base_price : null),
            stock: existingVariant?.stock || 0,
            sku: `${formData.sku || 'RVZ'}-${size}-${colorName.replace(/\s+/g, '-').toUpperCase()}`
          });
        });
      });
      setVariants(newVariants);
      variantsInitializedRef.current = true;
    } else {
      setVariants([]);
    }
  }, [formData.attributes.sizes, formData.attributes.colors]);

  // Calculate total stock
  const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);

  // Manual trigger to auto-generate or refresh variants matrix
  const handleAutoGenerateMatrix = () => {
    const sizes = formData.attributes.sizes || [];
    const colors = formData.attributes.colors || [];
    if (sizes.length === 0 || colors.length === 0) return;

    const newVariants: any[] = [];
    sizes.forEach((size: string) => {
      colors.forEach((color: any) => {
        const colorName = typeof color === 'string' ? color : color.name;
        const existingVariant = variants.find(v => v.size === size && v.color === colorName);
        const sizePrice = batchSizePrices[size] ? Number(batchSizePrices[size]) : null;

        newVariants.push({
          size,
          color: colorName,
          price: existingVariant?.price || sizePrice || (size === sizes[0] ? formData.base_price : null),
          stock: existingVariant?.stock || 0,
          sku: `${formData.sku || 'RVZ'}-${size}-${colorName.replace(/\s+/g, '-').toUpperCase()}`
        });
      });
    });
    setVariants(newVariants);
  };

  // Apply batch price to a specific size
  const applyPriceToSize = (size: string, price: number) => {
    setVariants(prev => prev.map(v => v.size === size ? { ...v, price: price > 0 ? price : null } : v));
  };

  // Apply all batch size prices to variants
  const applyAllBatchSizePrices = () => {
    setVariants(prev => prev.map(v => {
      if (batchSizePrices[v.size] && Number(batchSizePrices[v.size]) > 0) {
        return { ...v, price: Number(batchSizePrices[v.size]) };
      }
      return v;
    }));
  };

  // Reset all variants to base price
  const resetAllToBasePrice = () => {
    setVariants(prev => prev.map(v => ({ ...v, price: formData.base_price })));
  };

  // Load Size Guide Presets
  const loadSizeGuidePreset = (type: 'tshirt' | 'hoodie' | 'pants') => {
    if (type === 'tshirt') {
      setSizeGuideChart([
        { size: 'S', chest: '40"', length: '28"', shoulder: '19"', sleeve: '8.5"' },
        { size: 'M', chest: '42"', length: '29"', shoulder: '20"', sleeve: '9.0"' },
        { size: 'L', chest: '44"', length: '30"', shoulder: '21"', sleeve: '9.5"' },
        { size: 'XL', chest: '46"', length: '31"', shoulder: '22"', sleeve: '10.0"' },
        { size: 'XXL', chest: '48"', length: '32"', shoulder: '23"', sleeve: '10.5"' },
      ]);
    } else if (type === 'hoodie') {
      setSizeGuideChart([
        { size: 'S', chest: '44"', length: '27"', shoulder: '20"', sleeve: '24"' },
        { size: 'M', chest: '46"', length: '28"', shoulder: '21"', sleeve: '24.5"' },
        { size: 'L', chest: '48"', length: '29"', shoulder: '22"', sleeve: '25"' },
        { size: 'XL', chest: '50"', length: '30"', shoulder: '23"', sleeve: '25.5"' },
        { size: 'XXL', chest: '52"', length: '31"', shoulder: '24"', sleeve: '26"' },
      ]);
    } else if (type === 'pants') {
      setSizeGuideChart([
        { size: 'S', chest: '28-30" waist', length: '39"', shoulder: '40" hip', sleeve: '24" thigh' },
        { size: 'M', chest: '31-33" waist', length: '40"', shoulder: '42" hip', sleeve: '25" thigh' },
        { size: 'L', chest: '34-36" waist', length: '41"', shoulder: '44" hip', sleeve: '26" thigh' },
        { size: 'XL', chest: '37-39" waist', length: '42"', shoulder: '46" hip', sleeve: '27" thigh' },
        { size: 'XXL', chest: '40-42" waist', length: '43"', shoulder: '48" hip', sleeve: '28" thigh' },
      ]);
    }
  };

  // Update variant
  const updateVariant = (index: number, field: string, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  // Add additional specification
  const addSpec = () => {
    setAdditionalSpecs([...additionalSpecs, { key: '', value: '' }]);
  };

  // Update additional specification
  const updateSpec = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...additionalSpecs];
    newSpecs[index] = { ...newSpecs[index], [field]: value };
    setAdditionalSpecs(newSpecs);
  };

  // Remove additional specification
  const removeSpec = (index: number) => {
    setAdditionalSpecs(additionalSpecs.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.name || formData.base_price <= 0) {
      setSubmitError('Please enter a product name and base price');
      setCurrentStep(1);
      return;
    }

    if (!formData.category_id && !formData.category_slug) {
      setSubmitError('Main category is required');
      setCurrentStep(2);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    // Calculate total stock from variants
    const totalStockCount = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    
    // Convert colors to simple array for frontend compatibility
    const colorNames = (formData.attributes.colors || []).map((c: any) => 
      typeof c === 'string' ? c : c.name
    );

    // Build details array with additional specs
    const details = [
      formData.fabric_composition,
      formData.fit && `Fit: ${formData.fit}`,
      formData.garment_care && `Care: ${formData.garment_care}`,
      ...additionalSpecs.filter(s => s.key && s.value).map(s => `${s.key}: ${s.value}`),
      'Made in Pakistan'
    ].filter(Boolean) as string[];

    const finalSlug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || `prod-${Date.now()}`;

    const productData: Product = {
      id: product?.id || Date.now().toString(),
      name: formData.name,
      slug: finalSlug,
      description: formData.description,
      base_price: Number(formData.base_price),
      compare_at_price: formData.compare_at_price ? Number(formData.compare_at_price) : null,
      cost_price: formData.cost_price ? Number(formData.cost_price) : null,
      is_active: !formData.is_draft,
      category_id: formData.category_id || null,
      subcategory_id: formData.subcategory_id || null,
      category_slug: formData.category_slug,
      brand: formData.brand || 'RAVENZA',
      fabric: formData.fabric,
      fit: formData.fit,
      sku: formData.sku,
      is_new_arrival: formData.is_new_arrival,
      is_best_seller: formData.is_best_seller,
      is_featured: formData.is_featured,
      is_spotlight: formData.is_spotlight,
      track_inventory: true,
      low_stock_threshold: Number(formData.low_stock_threshold) || 4,
      badge: formData.badge,
      images: formData.images,
      image_url: formData.images[0] || '',
      attributes: {
        sizes: formData.attributes.sizes,
        colors: formData.attributes.colors,
      },
      variants_matrix: variants,
      size_guide_enabled: sizeGuideEnabled,
      size_guide: sizeGuideEnabled ? {
        enabled: true,
        unit: 'inches',
        chart: sizeGuideChart,
      } : null,
      fabric_composition: formData.fabric_composition,
      fabric_finish: formData.fabric_finish,
      graphic_print: formData.graphic_print,
      garment_specs: formData.garment_specs,
      garment_care: formData.garment_care,
      shipping_delivery: formData.shipping_delivery,
      model_size: formData.model_size,
      meta_title: formData.meta_title,
      meta_description: formData.meta_description,
      meta_keywords: formData.focus_keywords,
      focus_keywords: formData.focus_keywords,
      specs: details.join('\n'),
      status: formData.status,
      is_draft: formData.is_draft,
      created_at: product?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      price: Number(formData.base_price),
      salePrice: formData.compare_at_price ? Number(formData.compare_at_price) : undefined,
      image: formData.images[0] || '',
      sizes: formData.attributes.sizes,
      colors: colorNames,
      stockCount: totalStockCount || 50,
      inStock: totalStockCount > 0,
      isNew: formData.is_new_arrival,
      isFeatured: formData.is_featured,
      isBestseller: formData.is_best_seller,
      details,
      material: formData.fabric_composition || formData.fabric,
      category: formData.category_slug,
    } as any;

    try {
      if (product) {
        const res = await api.updateProduct(product.id, productData);
        updateProduct(product.id, res || productData);
      } else {
        const saved = await api.createProduct(productData);
        if (saved && saved.id) {
          addProduct({ ...productData, id: saved.id, ...saved });
        } else {
          addProduct(productData);
        }
      }
      await fetchProducts();
      setSubmitSuccess(true);
      setTimeout(() => {
        onClose();
      }, 400);
    } catch (err: any) {
      console.error('Save product error:', err);
      setSubmitError(err.message || 'Failed to save product in Neon DB');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.name && formData.base_price > 0;
      case 2: return formData.category_slug || formData.category_id;
      case 3: return formData.images.length > 0;
      case 4: return formData.attributes.sizes.length > 0 && formData.attributes.colors.length > 0;
      case 5: return true;
      case 6: return true;
      default: return false;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b bg-gray-50/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${product ? 'bg-amber-100 text-amber-700' : 'bg-black text-white'}`}>
              <Package size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">
                  {product ? `Update Product: ${formData.name || 'Product'}` : 'Add New Product'}
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  product ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                }`}>
                  {product ? 'Neon DB Update' : 'New Entry'}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Step {currentStep} of 6: {steps[currentStep - 1].title} — {steps[currentStep - 1].description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Save button directly in header if basic details entered */}
            {formData.name && formData.base_price > 0 && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                title="Quick Save to Neon DB without going through all steps"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : submitSuccess ? (
                  <>
                    <CheckCircle2 size={13} className="text-green-400" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save size={13} />
                    <span>Quick Save</span>
                  </>
                )}
              </button>
            )}

            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {submitError && (
          <div className="mx-6 mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-red-700 text-xs shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-red-500" />
              <span>{submitError}</span>
            </div>
            <button onClick={() => setSubmitError(null)} className="text-red-500 hover:text-red-700">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Step Indicator */}
        <div className="px-6 py-4 border-b bg-white">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    currentStep === step.id
                      ? 'bg-black text-white'
                      : currentStep > step.id
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {currentStep > step.id ? <span>✓</span> : <step.icon size={14} />}
                  <span className="hidden md:inline">{step.title}</span>
                </button>
                {i < steps.length - 1 && (
                  <div className={`w-4 md:w-8 h-0.5 mx-1 ${currentStep > step.id ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[55vh]">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold flex items-center gap-2"><Package size={20} /> Basic Information</h3>
              <div>
                <label className="block text-sm font-medium mb-1.5">Product Name *</label>
                <input type="text" value={formData.name} onChange={e => update('name', e.target.value)} placeholder="e.g., Shadow Realm Co-Ord Set" className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Slug (URL)</label>
                <input type="text" value={formData.slug} onChange={e => update('slug', e.target.value)} className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black transition-colors text-sm font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea value={formData.description} onChange={e => update('description', e.target.value)} rows={3} placeholder="Product description..." className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black transition-colors" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Base Price (Rs.) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">Rs.</span>
                    <input type="number" value={formData.base_price} onChange={e => update('base_price', Number(e.target.value))} className="w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Compare At Price (Rs.)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">Rs.</span>
                    <input type="number" value={formData.compare_at_price || ''} onChange={e => update('compare_at_price', e.target.value ? Number(e.target.value) : null)} placeholder="Original price" className="w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Cost Price (Rs.)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">Rs.</span>
                    <input type="number" value={formData.cost_price || ''} onChange={e => update('cost_price', e.target.value ? Number(e.target.value) : null)} placeholder="Production cost" className="w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black transition-colors" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">SKU</label>
                  <input type="text" value={formData.sku} onChange={e => update('sku', e.target.value)} placeholder="e.g., RVZ-CO-001" className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black transition-colors font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Low Stock Threshold</label>
                  <input type="number" value={formData.low_stock_threshold || 4} onChange={e => update('low_stock_threshold', Number(e.target.value))} placeholder="Alert when stock < 4" className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black transition-colors font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Badge</label>
                <div className="flex gap-2 flex-wrap">
                  {['', 'NEW', 'BESTSELLER', 'HOT', 'LIMITED', 'SALE'].map(b => (
                    <button key={b} onClick={() => update('badge', b)} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${formData.badge === b ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                      {b || 'None'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Category */}
          {currentStep === 2 && (() => {
            const mainCategories = categories.filter(c => !c.parent_id);
            const subCategories = formData.category_id
              ? categories.filter(c => c.parent_id === formData.category_id)
              : [];

            return (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2"><Tag size={20} /> Category & Classification</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Select the mandatory Main Category and optionally select a dependent Subcategory.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-gray-50 p-5 rounded-2xl border border-gray-200">
                  {/* Dependent Dropdown 1: Main Category (Required) */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-800">
                      Main Category <span className="text-red-600">* (Required)</span>
                    </label>
                    <select
                      value={formData.category_id || ''}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        const cat = categories.find(c => c.id === selectedId);
                        if (cat) {
                          update('category_id', cat.id);
                          update('category_slug', cat.slug);
                          update('subcategory_id', '');
                        } else {
                          update('category_id', '');
                          update('category_slug', '');
                          update('subcategory_id', '');
                        }
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-black text-sm bg-white font-medium transition-colors"
                      required
                    >
                      <option value="">-- Choose Main Category (Required) --</option>
                      {mainCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} {cat.tag ? `[${cat.tag}]` : ''}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-gray-500">
                      Primary storefront department (e.g., Oversize T-Shirts, Hoodies).
                    </p>
                  </div>

                  {/* Dependent Dropdown 2: Subcategory */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-800">
                      Subcategory <span className="text-gray-400 font-normal text-[10px]">(Dependent / Optional)</span>
                    </label>
                    <select
                      value={formData.subcategory_id || ''}
                      disabled={!formData.category_id}
                      onChange={(e) => update('subcategory_id', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-black text-sm bg-white font-medium transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200"
                    >
                      <option value="">
                        {!formData.category_id 
                          ? '-- Select Main Category First --'
                          : subCategories.length === 0
                            ? '-- No Subcategories under this category --'
                            : '-- Select Subcategory (Optional) --'}
                      </option>
                      {subCategories.map(sub => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-gray-500">
                      Sub-classification (e.g. Acid Wash, Heavyweight).
                    </p>
                  </div>
                </div>

                {/* Quick Select Buttons for Main Categories */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                    Quick Pick Main Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {mainCategories.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          update('category_id', cat.id);
                          update('category_slug', cat.slug);
                          update('subcategory_id', '');
                        }}
                        className={`p-3 border-2 rounded-xl text-left transition-all text-xs flex flex-col justify-between ${
                          formData.category_id === cat.id
                            ? 'border-black bg-black text-white shadow-sm font-bold'
                            : 'border-gray-200 hover:border-black bg-white text-gray-800'
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        {cat.tag && (
                          <span className={`text-[10px] mt-1 ${formData.category_id === cat.id ? 'text-gray-300' : 'text-gray-400'}`}>
                            {cat.tag}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Collection Flags */}
                <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-4">
                  <label className="flex items-center gap-2.5 cursor-pointer bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-200 hover:border-gray-300">
                    <input type="checkbox" checked={formData.is_new_arrival} onChange={e => update('is_new_arrival', e.target.checked)} className="w-4 h-4 rounded accent-black" />
                    <span className="text-xs font-semibold">New Arrival</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-200 hover:border-gray-300">
                    <input type="checkbox" checked={formData.is_best_seller} onChange={e => update('is_best_seller', e.target.checked)} className="w-4 h-4 rounded accent-black" />
                    <span className="text-xs font-semibold">Best Seller</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-200 hover:border-gray-300">
                    <input type="checkbox" checked={formData.is_featured} onChange={e => update('is_featured', e.target.checked)} className="w-4 h-4 rounded accent-black" />
                    <span className="text-xs font-semibold">Featured Drop</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-200 hover:border-gray-300">
                    <input type="checkbox" checked={formData.is_spotlight} onChange={e => update('is_spotlight', e.target.checked)} className="w-4 h-4 rounded accent-black" />
                    <span className="text-xs font-semibold">Spotlight Collection</span>
                  </label>
                </div>
              </div>
            );
          })()}

          {/* Steps 3-6 simplified for brevity */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold flex items-center gap-2"><Image size={20} /> Product Images</h3>
              <div className="flex gap-2">
                <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Paste image URL..." className="flex-1 px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black transition-colors text-sm" />
                <button onClick={addImage} className="px-4 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-1">
                  <Plus size={16} /> Add
                </button>
              </div>
              {formData.images.length > 0 ? (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {formData.images.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      {i === 0 && <span className="absolute top-2 left-2 bg-black text-white text-[10px] px-2 py-0.5 rounded-full font-bold">MAIN</span>}
                      <button onClick={() => removeImage(i)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-xl p-12 text-center text-gray-400">
                  <Image className="mx-auto mb-3" size={32} />
                  <p className="text-sm">Add image URLs to build your gallery</p>
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2"><Palette size={20} /> Sizes, Colors & Variant Pricing</h3>
                  <p className="text-xs text-gray-500">Configure size and color options, auto-generate matrix, and set size-specific prices.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAutoGenerateMatrix}
                  className="px-3.5 py-2 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  <RefreshCw size={13} />
                  <span>Auto-Generate Matrix</span>
                </button>
              </div>
              
              {/* Sizes Section */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Sizes</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.attributes.sizes.map(size => (
                    <span key={size} className="flex items-center gap-1 bg-black text-white px-3 py-1.5 rounded-full text-xs font-medium">
                      {size}
                      <button onClick={() => removeSize(size)}><X size={12} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={newSize} onChange={e => setNewSize(e.target.value)} placeholder="Add size (e.g., 2XL)" className="flex-1 px-4 py-2 border rounded-lg text-sm" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSize())} />
                  <button onClick={addSize} className="px-4 py-2 bg-black text-white rounded-lg text-sm">Add</button>
                </div>
              </div>

              {/* Colors Section with Color Picker */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Colors</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(formData.attributes.colors || []).map((color: any, idx: number) => {
                    const colorName = typeof color === 'string' ? color : color.name;
                    const colorHex = typeof color === 'string' ? '#000000' : color.hex;
                    return (
                      <span 
                        key={idx} 
                        className="flex items-center gap-2 bg-black text-white px-3 py-1.5 rounded-full text-xs font-medium"
                      >
                        <span 
                          className="w-3.5 h-3.5 rounded-full border border-white" 
                          style={{ backgroundColor: colorHex }}
                        />
                        {colorName}
                        <button onClick={() => removeColor(color)}><X size={12} /></button>
                      </span>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={newColorHex} 
                    onChange={e => setNewColorHex(e.target.value)} 
                    className="w-12 h-10 border rounded-lg cursor-pointer"
                    title="Pick color"
                  />
                  <input 
                    type="text" 
                    value={newColor} 
                    onChange={e => setNewColor(e.target.value)} 
                    placeholder="Color name (e.g., Smoky Black)" 
                    className="flex-1 px-4 py-2 border rounded-lg text-sm" 
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addColor())} 
                  />
                  <button onClick={addColor} className="px-4 py-2 bg-black text-white rounded-lg text-sm">Add</button>
                </div>
              </div>

              {/* Size-Level Pricing Control */}
              {formData.attributes.sizes.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">Set Size-Specific Prices</h4>
                      <p className="text-[11px] text-gray-500">Quickly apply custom prices to all variants belonging to a specific size.</p>
                    </div>
                    <button
                      type="button"
                      onClick={resetAllToBasePrice}
                      className="text-[11px] font-semibold text-gray-600 hover:text-black underline"
                    >
                      Reset All to Base Price (Rs. {formData.base_price})
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {formData.attributes.sizes.map(size => (
                      <div key={size} className="bg-white p-2.5 rounded-lg border border-gray-200 flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-gray-800">Size: {size}</span>
                        <div className="flex gap-1">
                          <input
                            type="number"
                            placeholder={`Rs. ${formData.base_price}`}
                            value={batchSizePrices[size] !== undefined ? batchSizePrices[size] : ''}
                            onChange={(e) => setBatchSizePrices({ ...batchSizePrices, [size]: e.target.value })}
                            className="w-full px-2 py-1 border rounded text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const p = Number(batchSizePrices[size]) || formData.base_price;
                              applyPriceToSize(size, p);
                            }}
                            className="px-2 py-1 bg-black text-white rounded text-[10px] font-bold shrink-0 hover:bg-gray-800"
                            title="Apply to this size in matrix"
                          >
                            Set
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {Object.keys(batchSizePrices).length > 0 && (
                    <button
                      type="button"
                      onClick={applyAllBatchSizePrices}
                      className="mt-3 w-full py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Apply All Size Prices to Matrix Below
                    </button>
                  )}
                </div>
              )}

              {/* Variants Matrix */}
              {variants.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold">Variants Matrix ({variants.length} items)</h4>
                    <span className="text-xs text-gray-500 font-semibold">Total Stock: {totalStock} units</span>
                  </div>
                  <div className="overflow-x-auto border rounded-xl max-h-60 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 sticky top-0 border-b">
                        <tr>
                          <th className="text-left p-2.5 font-bold uppercase tracking-wider text-gray-600">Size</th>
                          <th className="text-left p-2.5 font-bold uppercase tracking-wider text-gray-600">Color</th>
                          <th className="text-left p-2.5 font-bold uppercase tracking-wider text-gray-600">Price (Rs.)</th>
                          <th className="text-left p-2.5 font-bold uppercase tracking-wider text-gray-600">Stock</th>
                          <th className="text-left p-2.5 font-bold uppercase tracking-wider text-gray-600">SKU</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {variants.map((variant, index) => (
                          <tr key={index} className="hover:bg-gray-50/80">
                            <td className="p-2.5 font-bold">{variant.size}</td>
                            <td className="p-2.5 text-gray-600">{variant.color}</td>
                            <td className="p-2.5">
                              <input
                                type="number"
                                value={variant.price !== null && variant.price !== undefined ? variant.price : ''}
                                onChange={(e) => updateVariant(index, 'price', e.target.value ? parseFloat(e.target.value) : null)}
                                placeholder={`Rs. ${formData.base_price}`}
                                className="w-24 px-2 py-1 border rounded text-xs font-medium"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="number"
                                value={variant.stock}
                                onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                                className="w-20 px-2 py-1 border rounded text-xs font-medium"
                              />
                            </td>
                            <td className="p-2.5 text-[11px] text-gray-400 font-mono">{variant.sku}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-2">
                    💡 If a variant's price is empty, it automatically inherits the base product price (Rs. {formData.base_price}).
                  </p>
                </div>
              )}
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2"><Ruler size={20} /> Specifications & Size Guide</h3>
                <p className="text-xs text-gray-500">Fabric details, care instructions, and optional customer size guide.</p>
              </div>

              {/* Dedicated Size Guide Section (Optional) */}
              <div className="border-2 border-gray-200 rounded-2xl p-5 bg-white space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Ruler size={16} className="text-black" />
                      Size Guide & Measurements
                    </h4>
                    <p className="text-xs text-gray-500">
                      When enabled, a "Size Guide" button appears on the customer product detail page.
                    </p>
                  </div>
                  {/* Toggle Switch */}
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <span className="text-xs font-bold text-gray-700">
                      {sizeGuideEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSizeGuideEnabled(!sizeGuideEnabled)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        sizeGuideEnabled ? 'bg-black' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          sizeGuideEnabled ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </label>
                </div>

                {sizeGuideEnabled ? (
                  <div className="space-y-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                        Quick Preset Templates:
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => loadSizeGuidePreset('tshirt')}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-black hover:text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          T-Shirt / Top
                        </button>
                        <button
                          type="button"
                          onClick={() => loadSizeGuidePreset('hoodie')}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-black hover:text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          Hoodie
                        </button>
                        <button
                          type="button"
                          onClick={() => loadSizeGuidePreset('pants')}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-black hover:text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          Pants / Bottoms
                        </button>
                      </div>
                    </div>

                    {/* Size Guide Table */}
                    <div className="overflow-x-auto border rounded-xl">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="p-2.5 text-left font-bold text-gray-700">Size</th>
                            <th className="p-2.5 text-left font-bold text-gray-700">Chest / Waist</th>
                            <th className="p-2.5 text-left font-bold text-gray-700">Length</th>
                            <th className="p-2.5 text-left font-bold text-gray-700">Shoulder / Hip</th>
                            <th className="p-2.5 text-left font-bold text-gray-700">Sleeve / Thigh</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {sizeGuideChart.map((row, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/50">
                              <td className="p-2 font-bold">{row.size}</td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.chest || ''}
                                  onChange={(e) => {
                                    const next = [...sizeGuideChart];
                                    next[idx] = { ...next[idx], chest: e.target.value };
                                    setSizeGuideChart(next);
                                  }}
                                  className="w-full px-2 py-1 border rounded text-xs"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.length || ''}
                                  onChange={(e) => {
                                    const next = [...sizeGuideChart];
                                    next[idx] = { ...next[idx], length: e.target.value };
                                    setSizeGuideChart(next);
                                  }}
                                  className="w-full px-2 py-1 border rounded text-xs"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.shoulder || ''}
                                  onChange={(e) => {
                                    const next = [...sizeGuideChart];
                                    next[idx] = { ...next[idx], shoulder: e.target.value };
                                    setSizeGuideChart(next);
                                  }}
                                  className="w-full px-2 py-1 border rounded text-xs"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.sleeve || ''}
                                  onChange={(e) => {
                                    const next = [...sizeGuideChart];
                                    next[idx] = { ...next[idx], sleeve: e.target.value };
                                    setSizeGuideChart(next);
                                  }}
                                  className="w-full px-2 py-1 border rounded text-xs"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-500">
                    ℹ️ Size guide is currently <strong>disabled</strong> for this product. The "Size Guide" button will not appear on the storefront.
                  </div>
                )}
              </div>

              {/* Garment Specifications */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Fabric / Material</label>
                  <input type="text" value={formData.fabric_composition} onChange={e => update('fabric_composition', e.target.value)} placeholder="e.g., 100% Cotton" className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Fit</label>
                  <select value={formData.fit} onChange={e => update('fit', e.target.value)} className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black">
                    <option value="">Select fit</option>
                    <option value="Oversized">Oversized</option>
                    <option value="Relaxed">Relaxed</option>
                    <option value="Regular">Regular</option>
                    <option value="Slim">Slim</option>
                    <option value="Wide Leg">Wide Leg</option>
                    <option value="Classic">Classic</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Fabric Finish</label>
                <input type="text" value={formData.fabric_finish} onChange={e => update('fabric_finish', e.target.value)} placeholder="e.g., Acid Washed, Matte" className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Graphic Print</label>
                <input type="text" value={formData.graphic_print} onChange={e => update('graphic_print', e.target.value)} placeholder="e.g., Screen Print, Puff Print" className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Garment Specs (GSM)</label>
                <input type="text" value={formData.garment_specs} onChange={e => update('garment_specs', e.target.value)} placeholder="e.g., 240 GSM" className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Garment Care</label>
                <input type="text" value={formData.garment_care} onChange={e => update('garment_care', e.target.value)} placeholder="e.g., Machine wash cold" className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Shipping & Delivery</label>
                <input type="text" value={formData.shipping_delivery} onChange={e => update('shipping_delivery', e.target.value)} className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Model Size</label>
                <input type="text" value={formData.model_size} onChange={e => update('model_size', e.target.value)} placeholder="e.g., Model wears size L" className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black" />
              </div>

              {/* More Specifications Section */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <Plus size={16} />
                    More Specifications
                  </h4>
                  <button 
                    onClick={addSpec} 
                    className="px-3 py-1.5 bg-black text-white rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Spec
                  </button>
                </div>
                
                {additionalSpecs.length > 0 ? (
                  <div className="space-y-2">
                    {additionalSpecs.map((spec, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={spec.key}
                          onChange={(e) => updateSpec(index, 'key', e.target.value)}
                          placeholder="Specification name (e.g., Weight)"
                          className="flex-1 px-3 py-2 border rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          value={spec.value}
                          onChange={(e) => updateSpec(index, 'value', e.target.value)}
                          placeholder="Value (e.g., 250g)"
                          className="flex-1 px-3 py-2 border rounded-lg text-sm"
                        />
                        <button
                          onClick={() => removeSpec(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border-2 border-dashed rounded-lg text-gray-400">
                    <p className="text-sm">No additional specifications yet</p>
                    <p className="text-xs mt-1">Click "Add Spec" to add custom specifications</p>
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-2">
                  💡 Add custom specifications like Weight, Origin, Closure Type, etc.
                </p>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold flex items-center gap-2"><FileText size={20} /> SEO & Visibility</h3>
              <div>
                <label className="block text-sm font-medium mb-1.5">Meta Title</label>
                <input type="text" value={formData.meta_title} onChange={e => update('meta_title', e.target.value)} placeholder="SEO title" className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black" />
                <p className="text-xs text-gray-400 mt-1">{formData.meta_title.length}/60 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Meta Description</label>
                <textarea value={formData.meta_description} onChange={e => update('meta_description', e.target.value)} rows={2} placeholder="SEO description" className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black" />
                <p className="text-xs text-gray-400 mt-1">{formData.meta_description.length}/160 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Focus Keywords</label>
                <input type="text" value={formData.focus_keywords} onChange={e => update('focus_keywords', e.target.value)} placeholder="Comma-separated keywords" className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black" />
              </div>
              
              {/* Google Preview */}
              <div className="border rounded-xl p-4 bg-gray-50">
                <p className="text-xs text-gray-500 mb-2 font-medium">Google Preview:</p>
                <p className="text-blue-700 text-base truncate">{formData.meta_title || formData.name}</p>
                <p className="text-green-700 text-sm">ravenza.pk/products/{formData.slug}</p>
                <p className="text-gray-600 text-sm line-clamp-2">{formData.meta_description || formData.description}</p>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.is_draft} onChange={e => update('is_draft', e.target.checked)} className="w-4 h-4 rounded" />
                  <span className="text-sm">Save as Draft</span>
                </label>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select value={formData.status} onChange={e => update('status', e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-white transition-colors"
          >
            <ChevronLeft size={16} /> Previous
          </button>
          
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2.5 text-sm text-gray-500 hover:text-black transition-colors">
              Cancel
            </button>
            {currentStep < 6 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-gray-800 transition-colors"
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{product ? 'Updating in Neon DB...' : 'Saving to Neon DB...'}</span>
                  </>
                ) : submitSuccess ? (
                  <>
                    <CheckCircle2 size={16} className="text-green-400" />
                    <span>Successfully Saved!</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>{product ? 'Update in Neon DB' : 'Save to Neon DB'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}