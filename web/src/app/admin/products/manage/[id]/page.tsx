"use client"
import { useEffect, useState, useRef, useCallback, use } from 'react';
import { Loader2, ArrowLeft, Trash2, Save, X, Plus, Upload, Image as ImageIcon, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCategorySuggest } from '../../../../../hooks/useCategorySuggest';

interface Variant {
    size: string;
    stock: number;
    // We keep minimal structure for editing. SKU is generated/readonly.
}

interface ImageInput {
  type: 'file' | 'url';
  id: number;
  value: File | string;
  preview: string;
}

export default function AdminProductEditPage({ params }: { params: Promise<{ id: string }> }) {
    // --- States for UI and Submission ---
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');
    const resolvedParams = use(params);
    const productId = resolvedParams.id;

    // --- AI Hook Integration ---
    const { suggestCategory, suggestedCategory, isSuggesting, setSuggestedCategory } = useCategorySuggest();

    // --- Image Management State ---
    const [imageInputs, setImageInputs] = useState<ImageInput[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const nextImageId = useRef(0);

    // --- Form Data State ---
    const [formData, setFormData] = useState({
      name: '',
      slug: '',
      brand: '',
      masterCategory: '',    
      category: '',          
      gender: '',           
      price: '',
      description: ''
    });

    // --- Variant Management State ---
    const [variants, setVariants] = useState<Variant[]>([]);

    // --- Dropdown States & Data ---
    const [masterCategories, setMasterCategories] = useState<string[]>([]);
    const [articleTypes, setArticleTypes] = useState<string[]>([]);
    const [filteredArticleTypes, setFilteredArticleTypes] = useState<string[]>([]);
    
    const [isMasterCategoryDropdownOpen, setIsMasterCategoryDropdownOpen] = useState(false);
    const [isArticleTypeDropdownOpen, setIsArticleTypeDropdownOpen] = useState(false);
    const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
    
    const [masterCategoryInputValue, setMasterCategoryInputValue] = useState('');
    const [articleTypeInputValue, setArticleTypeInputValue] = useState('');
    
    const genderOptions = ['Men', 'Women', 'Kids'];

    // --- Fetch Product Data & Initialize ---
    const fetchProduct = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:4000/api/products/admin/${productId}`); 
            if (!res.ok) throw new Error('Product not found or API error');
            const data = await res.json();
            
            // Populate Form Data
            setFormData({
                name: data.name || '',
                slug: data.slug || '',
                brand: data.brand || '',
                masterCategory: data.masterCategory || '',
                category: data.category || '', // subCategory/articleType
                gender: data.gender || '',
                price: data.price ? String(data.price) : '', // Assuming backend returns formatted price or we adjust later
                description: data.description || ''
            });

            // Populate Price - handle cents vs dollars if needed
            // The Add page expects user input directly. If backend sends price_cents, convert.
            if (data.price_cents) {
                 setFormData(prev => ({ ...prev, price: (data.price_cents / 100).toFixed(2) }));
            }

            // Populate Variants
            if (data.variants) {
                setVariants(data.variants.map((v: any) => ({
                    size: v.size,
                    stock: v.stock
                })));
            }

             // Populate Images
             if (data.images && Array.isArray(data.images)) {
                const initialImages: ImageInput[] = data.images.map((img: any) => ({
                    type: 'url', // treat existing images as URLs
                    id: nextImageId.current++,
                    value: typeof img === 'string' ? img : img.url,
                    preview: typeof img === 'string' ? img : img.url
                }));
                setImageInputs(initialImages);
             }

             // Initialize Dropdown Inputs
             setMasterCategoryInputValue(data.masterCategory || '');
             setArticleTypeInputValue(data.category || '');

        } catch (error) {
            console.error(error);
            setMessage('Error: Could not load product data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (productId) fetchProduct();
    }, [productId]);


    // --- Logic Hooks (Ported from Add Page) ---
    useEffect(() => {
        // Fetch masterCategories
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?limit=1000`)
          .then((res) => res.json())
          .then((data) => {
            const masterCats = Array.from(new Set(
              (data.data || []).map((p: any) => p.masterCategory).filter((cat: string) => cat && cat.trim())
            )).sort() as string[];
            
            const defaultMasterCategories = ['Apparel', 'Footwear', 'Accessories'];
            setMasterCategories(masterCats.length > 0 ? masterCats : defaultMasterCategories);
          })
          .catch((err) => {
             console.error("MasterCategory fetch failed", err);
             setMasterCategories(['Apparel', 'Footwear', 'Accessories']);
          });
      }, []);

    useEffect(() => {
        // Fetch articleTypes when masterCategory changes
        if (formData.masterCategory) {
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?limit=1000`)
            .then((res) => res.json())
            .then((data) => {
              const articleTypesList = Array.from(new Set(
                (data.data || []).filter((p: any) => p.masterCategory === formData.masterCategory)
                  .map((p: any) => p.category)
                  .filter((cat: string) => cat && cat.trim())
              )).sort() as string[];
              
              if (articleTypesList.length === 0) {
                 // Try dedicated category endpoint fallback
                 fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/categories`)
                  .then((res) => res.json())
                  .then((cats) => {
                    setArticleTypes(cats);
                    setFilteredArticleTypes(cats);
                  }).catch(() => {});
              } else {
                setArticleTypes(articleTypesList);
                setFilteredArticleTypes(articleTypesList);
              }
            })
            .catch(() => {});
        } else {
          setArticleTypes([]);
          setFilteredArticleTypes([]);
        }
    }, [formData.masterCategory]);

    useEffect(() => {
        const filtered = articleTypes.filter((at) => 
          at.toLowerCase().includes(articleTypeInputValue.toLowerCase())
        );
        setFilteredArticleTypes(filtered);
    }, [articleTypeInputValue, articleTypes]);

    // Close dropdowns
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
          const target = e.target as HTMLElement;
          if (!target.closest('.dropdown-container')) {
            setIsMasterCategoryDropdownOpen(false);
            setIsArticleTypeDropdownOpen(false);
            setIsGenderDropdownOpen(false);
          }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // AI Suggestions
    useEffect(() => {
        if (suggestedCategory) {
          setFormData(prev => ({ 
            ...prev, 
            category: suggestedCategory.category, 
          }));
          setArticleTypeInputValue(suggestedCategory.category);
          setIsMasterCategoryDropdownOpen(false);
          setIsArticleTypeDropdownOpen(false);
          setSuggestedCategory(null);
        }
      }, [suggestedCategory, setSuggestedCategory]);


    // --- Event Handlers ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // NOTE: We generally DO NOT auto-update slug on Edit page to preserve URLs
    };

    const handleSuggestClick = () => {
        suggestCategory(imageInputs);
    };

    const addImageInput = useCallback((type: "url" | "file", fileOrUrl: File | string) => {
        if (imageInputs.length >= 5) return;
        const preview = type === 'file' && fileOrUrl instanceof File ? URL.createObjectURL(fileOrUrl) : (fileOrUrl as string);
        setImageInputs(prev => [...prev, { type, id: nextImageId.current++, value: fileOrUrl, preview }]);
    }, [imageInputs.length]);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
          Array.from(e.target.files).forEach(file => addImageInput('file', file));
          e.target.value = '';
        }
    };
    
    const handleUrlInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && e.currentTarget.value) {
          e.preventDefault();
          addImageInput('url', e.currentTarget.value);
          e.currentTarget.value = '';
        }
    };
    
    const removeImage = (id: number) => setImageInputs(prev => prev.filter(input => input.id !== id));
    
    const handleVariantChange = (index: number, field: 'size' | 'stock', value: string | number) => {
        const newVariants = [...variants];
        // @ts-ignore
        newVariants[index][field] = value;
        setVariants(newVariants);
    };
    const addVariant = () => setVariants([...variants, { size: '', stock: 0 }]);
    const removeVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index));


    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage('');

        // Basic validation
        if (!formData.gender || !formData.category || !formData.masterCategory) {
            setMessage('❌ Please fill in all required category fields.');
            setIsSaving(false);
            return;
        }

        try {
            // Using logic from Edit page (PUT) but adapting to handle file uploads like Add page
            // Since most apps can't PUT multipart/form-data efficiently to express without Multer handling it 
            // the same way POST does. The backend 'POST /api/products' handles images.
            // Let's assume PUT /api/products/:id ALSO handles multipart or we must send JSON.
            // CAUTION: The original Edit page sent JSON. The Add page sends FormData.
            // We should check if the backend endpoint supports FormData for updates.
            // Given I cannot see backend PUT route code, I will optimistically assume I must use FormData
            // if I want to upload NEW files. If not, I might need to upload images separately.
            
            // NOTE: Sending JSON for existing images + FormData for new files is tricky without specific backend grouping.
            // Strategy: Convert everything to FormData to be safe, assuming backend uses Multer on PUT too.
            // If backend only accepts JSON on PUT, we have a problem uploading new files. 
            // BUT: The original Edit page code I saw sent JSON. This strongly implies it DID NOT support file text uploads.
            
            // IMPORTANT: If we strictly follow "Do NOT touch backend", and the backend PUT expects JSON, 
            // we effectively cannot upload *new files* via this endpoint unless they are URLs.
            // However, typical express/multer setups usually allow the same middleware on PUT.
            // I will use FormData because we are adding file upload support.
            
            // Actually, to be safest and respect "Minimal backend change" (none), 
            // I will implement a mixed approach? No, FormData is the standard way to send files.
            
            // Let's try sending JSON first if NO new files are added (for safety), 
            // and FormData if files are present? No, consistency is key.
            // I'll stick to the original plan: Update fields.
            // Wait, looking at original Edit page:
            // headers: { 'Content-Type': 'application/json' },
            // body: JSON.stringify({...})
            // It definitively used JSON. 
            
            // To support file uploads without backend changes, I likely need to assume 
            // the backend *might* not support multipart on PUT. 
            // However, the User asked to "Resture functionality". 
            // Use FormData. If it fails, it's a backend limitation we'll identify.

            const form = new FormData();
            form.append('name', formData.name);
            form.append('slug', formData.slug);
            form.append('brand', formData.brand);
            form.append('category', formData.category);
            form.append('masterCategory', formData.masterCategory);
            form.append('gender', formData.gender);
            form.append('price', formData.price); // Backend expects string/number, check controller
            form.append('description', formData.description);
            form.append('variants', JSON.stringify(variants));

            // Handle Images
            const imageUrls: string[] = [];
            imageInputs.forEach(input => {
                if (input.type === 'file') {
                    form.append('images', input.value as File);
                } else {
                    imageUrls.push(input.value as string);
                }
            });
            form.append('imageUrls', JSON.stringify(imageUrls));

            // Use PUT to update
            const res = await fetch(`http://localhost:4000/api/products/${productId}`, { 
                method: 'PUT',
                // Do NOT set Content-Type header for FormData, browser does it with boundary
                body: form 
            });

            if (res.ok) {
                setMessage('✅ Product saved successfully!');
            } else {
                const err = await res.json();
                throw new Error(err.message || 'Failed to save');
            }
        } catch (error: any) {
            console.error(error);
            setMessage(`❌ Failed to save: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };


    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
                <Loader2 className="animate-spin w-10 h-10 text-black mb-4" />
                <div className="text-gray-400 font-medium tracking-wide">LOADING PRODUCT DATA</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9FAFB] pb-32">
            {/* --- HEADER --- */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/admin/products" className="group flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 bg-white hover:border-black hover:bg-black transition-all duration-300">
                            <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                        </Link>
                        
                        <div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Edit Product</div>
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">{formData.name || 'Untitled Product'}</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                         {message && (
                            <div className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide animate-in fade-in slide-in-from-top-4 ${message.startsWith('✅') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                {message}
                            </div>
                        )}
                        <button 
                            onClick={handleSave} 
                            disabled={isSaving} 
                            className="bg-black text-white px-8 py-3 rounded-full font-semibold text-sm hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 shadow-xl shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                            <span>Save Changes</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <form onSubmit={handleSave} className="max-w-7xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* LEFT COLUMN (8 cols) */}
                    <div className="lg:col-span-8 space-y-10">
                        
                        {/* SECTION: BASIC INFO */}
                        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                                <h2 className="font-bold text-gray-900 text-lg">Product Information</h2>
                                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">General Details</span>
                            </div>
                            <div className="p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="group">
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 ml-1 group-focus-within:text-black transition-colors">Product Name</label>
                                        <input 
                                            required 
                                            name="name" 
                                            value={formData.name} 
                                            onChange={handleChange} 
                                            className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-black focus:ring-0 rounded-xl px-4 py-3.5 text-gray-900 font-medium transition-all duration-300 placeholder-gray-300"
                                            placeholder="e.g. Essential Cotton Tee"
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 ml-1">Brand</label>
                                        <input 
                                            required 
                                            name="brand" 
                                            value={formData.brand} 
                                            onChange={handleChange} 
                                            className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-black focus:ring-0 rounded-xl px-4 py-3.5 text-gray-900 font-medium transition-all duration-300"
                                            placeholder="e.g. Nike"
                                        />
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 ml-1">Slug (URL)</label>
                                    <div className="relative">
                                        <input 
                                            required 
                                            name="slug" 
                                            value={formData.slug} 
                                            onChange={handleChange} 
                                            className="w-full bg-gray-50/50 border border-transparent focus:bg-white focus:border-gray-200 focus:ring-0 rounded-xl px-4 py-3 text-gray-500 font-mono text-sm transition-all"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300 bg-gray-100 px-2 py-1 rounded">SEO</div>
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 ml-1 group-focus-within:text-black transition-colors">Description</label>
                                    <textarea 
                                        required 
                                        name="description" 
                                        value={formData.description} 
                                        onChange={handleChange} 
                                        className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-black focus:ring-0 rounded-xl px-5 py-4 text-gray-700 leading-relaxed min-h-[160px] resize-y transition-all duration-300"
                                        placeholder="Detailed product description..."
                                    />
                                </div>
                            </div>
                        </section>

                         {/* SECTION: INVENTORY & PRICING */}
                         <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                             <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                                <h2 className="font-bold text-gray-900 text-lg">Inventory & Pricing</h2>
                                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">SKUs & Costs</span>
                            </div>
                            <div className="p-8">
                                <div className="mb-10 max-w-sm">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 ml-1">Base Price (₹)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-serif italic text-lg">₹</span>
                                        <input 
                                            required 
                                            name="price" 
                                            type="number" 
                                            step="0.01" 
                                            value={formData.price} 
                                            onChange={handleChange} 
                                            className="w-full bg-white border border-gray-200 focus:border-black focus:ring-0 rounded-xl pl-10 pr-4 py-4 text-2xl font-bold text-gray-900 transition-all font-mono tracking-tight"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                {/* Variants Table */}
                                <div className="bg-gray-50/50 rounded-2xl border border-gray-100 overflow-hidden">
                                     <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        <div className="col-span-4 pl-2">Size / Variant</div>
                                        <div className="col-span-4">Stock Level</div>
                                        <div className="col-span-4 text-right pr-2">Actions</div>
                                    </div>
                                    
                                    <div className="divide-y divide-gray-100">
                                        {variants.map((variant, index) => (
                                            <div key={index} className="grid grid-cols-12 gap-6 px-6 py-4 items-center hover:bg-white transition-colors">
                                                <div className="col-span-4">
                                                    <input 
                                                        type="text" 
                                                        value={variant.size} 
                                                        onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                                                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 text-center uppercase focus:border-black focus:ring-0"
                                                        placeholder="Size"
                                                    />
                                                </div>
                                                <div className="col-span-4">
                                                     <div className="relative">
                                                        <input 
                                                            type="number" 
                                                            value={variant.stock} 
                                                            onChange={(e) => handleVariantChange(index, 'stock', Number(e.target.value))}
                                                            className={`w-full bg-white border rounded-lg px-3 py-2 text-sm font-mono text-center focus:border-black focus:ring-0 ${variant.stock < 5 ? 'border-red-200 text-red-600 bg-red-50/10' : 'border-gray-200 text-gray-900'}`}
                                                        />
                                                        {variant.stock < 5 && <div className="absolute top-1/2 -translate-y-1/2 right-2 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                                                     </div>
                                                </div>
                                                <div className="col-span-4 text-right flex justify-end">
                                                    <button type="button" onClick={() => removeVariant(index)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-3 bg-gray-100/50 border-t border-gray-100 text-center">
                                        <button type="button" onClick={addVariant} className="text-xs font-bold text-black uppercase tracking-wider hover:underline py-2">
                                            + Add Another Variant
                                        </button>
                                    </div>
                                </div>
                            </div>
                         </section>
                    </div>

                    {/* RIGHT COLUMN (4 cols) */}
                    <div className="lg:col-span-4 space-y-10">
                        
                         {/* SECTION: CATEGORIZATION */}
                        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                             <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
                                <h2 className="font-bold text-gray-900 text-base">Categorization</h2>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Gender */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Target Gender</label>
                                    <div className="flex gap-2 p-1 bg-gray-100 rounded-xl relative">
                                        <div className="absolute inset-0 p-1 pointer-events-none">
                                            {/* Minimal sliding logic simulation via active classes if we had them, simple radio aesthetic for now */}
                                        </div>
                                        {genderOptions.map(g => {
                                            const isActive = formData.gender.toLowerCase() === g.toLowerCase();
                                            return (
                                                <button
                                                    key={g}
                                                    type="button"
                                                    onClick={() => { setFormData(p => ({...p, gender: g})); setIsGenderDropdownOpen(false); }}
                                                    className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${isActive ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                                >
                                                    {g}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Master Category */}
                                <div className="dropdown-container relative">
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Category</label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={masterCategoryInputValue}
                                            onFocus={() => setIsMasterCategoryDropdownOpen(true)}
                                            onChange={(e) => { setMasterCategoryInputValue(e.target.value); setIsMasterCategoryDropdownOpen(true); }}
                                            className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-black focus:ring-0 rounded-xl px-4 py-3 text-gray-900 font-medium transition-all"
                                            placeholder="Select..."
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                             <div className="w-2 h-2 border-b-2 border-r-2 border-gray-400 rotate-45 transform -translate-y-1" />
                                        </div>
                                        {isMasterCategoryDropdownOpen && (
                                            <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto p-1.5 animate-in fade-in zoom-in-95 duration-200">
                                                {masterCategories.filter(c => c.toLowerCase().includes(masterCategoryInputValue.toLowerCase())).map(cat => (
                                                    <div key={cat} onMouseDown={() => { 
                                                        setMasterCategoryInputValue(cat); 
                                                        setFormData(prev => ({...prev, masterCategory: cat})); 
                                                        setIsMasterCategoryDropdownOpen(false); 
                                                    }} className="px-3 py-2.5 hover:bg-gray-50 rounded-lg text-sm text-gray-700 cursor-pointer font-medium">
                                                        {cat}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Sub Category */}
                                <div className="dropdown-container relative">
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Sub Category</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1 group">
                                            <input
                                                type="text"
                                                value={articleTypeInputValue}
                                                onFocus={() => setIsArticleTypeDropdownOpen(true)}
                                                onChange={(e) => { setArticleTypeInputValue(e.target.value); setIsArticleTypeDropdownOpen(true); }}
                                                className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-black focus:ring-0 rounded-xl px-4 py-3 text-gray-900 font-medium transition-all disabled:opacity-50"
                                                disabled={!formData.masterCategory}
                                                placeholder="Type..."
                                            />
                                             {isArticleTypeDropdownOpen && (
                                                <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto p-1.5 animate-in fade-in zoom-in-95 duration-200">
                                                    {filteredArticleTypes.map(at => (
                                                        <div key={at} onMouseDown={() => {
                                                            setArticleTypeInputValue(at);
                                                            setFormData(p => ({...p, category: at}));
                                                            setIsArticleTypeDropdownOpen(false);
                                                        }} className="px-3 py-2.5 hover:bg-gray-50 rounded-lg text-sm text-gray-700 cursor-pointer font-medium">{at}</div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleSuggestClick}
                                            disabled={isSuggesting || imageInputs.length === 0}
                                            className="bg-black/5 text-black p-3 rounded-xl hover:bg-purple-600 hover:text-white transition-all disabled:opacity-50 disabled:hover:bg-black/5 disabled:hover:text-black shadow-sm"
                                            title="AI Autodetect"
                                        >
                                            {isSuggesting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* SECTION: IMAGES */}
                        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                             <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                                <h2 className="font-bold text-gray-900 text-base">Media</h2>
                                <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{imageInputs.length}/5</span>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    {imageInputs.map((input, idx) => (
                                        <div key={input.id} className={`relative aspect-[3/4] bg-gray-50 rounded-xl overflow-hidden border border-gray-100 group shadow-sm transition-all hover:shadow-md ${idx === 0 ? 'col-span-2 border-2 border-black/5 ring-4 ring-black/5' : ''}`}>
                                            <Image src={input.preview} alt="Preview" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                            <button type="button" onClick={() => removeImage(input.id)} className="absolute top-2 right-2 bg-white/90 backdrop-blur text-black p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white transform translate-y-2 group-hover:translate-y-0 scale-90 group-hover:scale-100">
                                                <X className="w-3 h-3" />
                                            </button>
                                             {idx === 0 && <span className="absolute bottom-3 left-3 bg-black/70 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded">COVER</span>}
                                        </div>
                                    ))}
                                    {imageInputs.length < 5 && (
                                        <button 
                                            type="button" 
                                            onClick={() => fileInputRef.current?.click()} 
                                            className="aspect-[3/4] rounded-xl border-2 border-dashed border-gray-200 hover:border-black hover:bg-gray-50 transition-all flex flex-col items-center justify-center gap-2 group"
                                        >
                                            <div className="p-3 bg-gray-50 rounded-full group-hover:bg-white transition-colors group-hover:shadow-md">
                                                <Upload className="w-4 h-4 text-gray-400 group-hover:text-black" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-400 group-hover:text-black">Add Image</span>
                                        </button>
                                    )}
                                </div>
                                
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" multiple />
                                
                                <div className="relative">
                                    <input 
                                        name="imageUrl" 
                                        onKeyDown={handleUrlInput} 
                                        className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-black focus:ring-0 rounded-lg px-4 py-3 text-xs font-medium transition-all" 
                                        placeholder="Paste URL & Enter..." 
                                        type="url" 
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <ImageIcon className="w-3 h-3" />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                </div>
            </form>
        </div>
    );
}