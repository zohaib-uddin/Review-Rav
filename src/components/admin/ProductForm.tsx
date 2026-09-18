import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2, Save, ChevronLeft, ChevronRight, Package, Tag, Image, Palette, Ruler, FileText } from 'lucide-react';
import { useStore, Product } from '../../store/useStore';

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
  const { addProduct, updateProduct, categories } = useStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    base_price: product?.base_price || 0,
    compare_at_price: product?.compare_at_price || null as number | null,
    category_id: product?.category_id || '',
    category_slug: product?.category_slug || '',
    brand: product?.brand || 'RAVENZA',
    fabric: product?.fabric || '',
    fit: product?.fit || '',
    sku: product?.sku || '',
    is_new_arrival: product?.is_new_arrival || false,
    is_best_seller: product?.is_best_seller || false,
    is_featured: product?.is_featured || false,
    badge: product?.badge || '',
    images: product?.images || [],
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

  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newColorHex, setNewColorHex] = useState('#000000');
  const [imageUrl, setImageUrl] = useState('');
  const [variants, setVariants] = useState<any[]>([]);
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

  // Auto-generate variants matrix when sizes or colors change
  useEffect(() => {
    const sizes = formData.attributes.sizes || [];
    const colors = formData.attributes.colors || [];
    
    if (sizes.length > 0 && colors.length > 0) {
      const newVariants: any[] = [];
      sizes.forEach((size: string) => {
        colors.forEach((color: any) => {
          const colorName = typeof color === 'string' ? color : color.name;
          const existingVariant = variants.find(v => v.size === size && v.color === colorName);
          
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
    } else {
      setVariants([]);
    }
  }, [formData.attributes.sizes, formData.attributes.colors, formData.base_price, formData.sku]);

  // Calculate total stock
  const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);

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

  const handleSubmit = () => {
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

    const productData: Product = {
      id: product?.id || Date.now().toString(),
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      base_price: formData.base_price,
      compare_at_price: formData.compare_at_price,
      is_active: !formData.is_draft,
      category_id: formData.category_id || null,
      category_slug: formData.category_slug,
      brand: formData.brand,
      fabric: formData.fabric,
      fit: formData.fit,
      sku: formData.sku,
      is_new_arrival: formData.is_new_arrival,
      is_best_seller: formData.is_best_seller,
      is_featured: formData.is_featured,
      badge: formData.badge,
      images: formData.images,
      image_url: formData.images[0] || '',
      attributes: {
        sizes: formData.attributes.sizes,
        colors: formData.attributes.colors, // Keep full color objects with hex
      },
      variants_matrix: variants, // Store variants matrix
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
      status: formData.status,
      is_draft: formData.is_draft,
      created_at: product?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      price: formData.base_price,
      salePrice: formData.compare_at_price || undefined,
      image: formData.images[0] || '',
      sizes: formData.attributes.sizes,
      colors: colorNames, // Simple color names for frontend
      stockCount: totalStockCount || 50,
      inStock: totalStockCount > 0,
      isNew: formData.is_new_arrival,
      isFeatured: formData.is_featured,
      isBestseller: formData.is_best_seller,
      details,
      material: formData.fabric_composition || formData.fabric,
      category: formData.category_slug,
    };

    if (product) {
      updateProduct(product.id, productData);
    } else {
      addProduct(productData);
    }
    onClose();
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.name && formData.base_price > 0;
      case 2: return formData.category_slug;
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
        className="relative bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div>
            <h2 className="text-xl font-bold">{product ? 'Edit Product' : 'Add New Product'}</h2>
            <p className="text-sm text-gray-500">Step {currentStep} of 6: {steps[currentStep - 1].title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

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
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">SKU</label>
                <input type="text" value={formData.sku} onChange={e => update('sku', e.target.value)} placeholder="e.g., RVZ-CO-001" className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black transition-colors font-mono" />
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
          {currentStep === 2 && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold flex items-center gap-2"><Tag size={20} /> Category & Collection</h3>
              <div>
                <label className="block text-sm font-medium mb-1.5">Category *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map(cat => (
                    <button
                      key={cat.slug}
                      onClick={() => { update('category_slug', cat.slug); update('category_id', cat.id); }}
                      className={`p-4 border-2 rounded-xl text-left transition-all ${
                        formData.category_slug === cat.slug ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-black'
                      }`}
                    >
                      <p className="font-medium text-sm">{cat.name}</p>
                      {cat.tag && <span className="text-[10px] opacity-70">{cat.tag}</span>}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.is_new_arrival} onChange={e => update('is_new_arrival', e.target.checked)} className="w-4 h-4 rounded" />
                  <span className="text-sm">New Arrival</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.is_best_seller} onChange={e => update('is_best_seller', e.target.checked)} className="w-4 h-4 rounded" />
                  <span className="text-sm">Best Seller</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.is_featured} onChange={e => update('is_featured', e.target.checked)} className="w-4 h-4 rounded" />
                  <span className="text-sm">Featured</span>
                </label>
              </div>
            </div>
          )}

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
            <div className="space-y-5">
              <h3 className="text-lg font-bold flex items-center gap-2"><Palette size={20} /> Sizes & Colors</h3>
              
              {/* Sizes Section */}
              <div>
                <label className="block text-sm font-medium mb-2">Sizes</label>
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
                <label className="block text-sm font-medium mb-2">Colors</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(formData.attributes.colors || []).map((color: any, idx: number) => {
                    const colorName = typeof color === 'string' ? color : color.name;
                    const colorHex = typeof color === 'string' ? '#000000' : color.hex;
                    return (
                      <span 
                        key={idx} 
                        className="flex items-center gap-2 bg-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-medium"
                      >
                        <span 
                          className="w-4 h-4 rounded-full border border-white" 
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

              {/* Variants Matrix */}
              {variants.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold">Variants Matrix (Auto-Generated)</h4>
                    <span className="text-xs text-gray-500">Total Stock: {totalStock}</span>
                  </div>
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-3 font-medium">Size</th>
                          <th className="text-left p-3 font-medium">Color</th>
                          <th className="text-left p-3 font-medium">Price (Rs.)</th>
                          <th className="text-left p-3 font-medium">Stock</th>
                          <th className="text-left p-3 font-medium">SKU</th>
                        </tr>
                      </thead>
                      <tbody>
                        {variants.map((variant, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-3">{variant.size}</td>
                            <td className="p-3">{variant.color}</td>
                            <td className="p-3">
                              <input
                                type="number"
                                value={variant.price || ''}
                                onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || null)}
                                placeholder={variant.size === variants[0]?.size ? 'Base price' : 'Optional'}
                                className="w-24 px-2 py-1 border rounded text-sm"
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="number"
                                value={variant.stock}
                                onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                                className="w-20 px-2 py-1 border rounded text-sm"
                              />
                            </td>
                            <td className="p-3 text-xs text-gray-500 font-mono">{variant.sku}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 First size price is pre-filled. Other variants can have different prices or leave empty to use base price.
                  </p>
                </div>
              )}
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold flex items-center gap-2"><Ruler size={20} /> Specifications</h3>
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
                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors"
              >
                <Save size={16} /> {product ? 'Update Product' : 'Create Product'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
