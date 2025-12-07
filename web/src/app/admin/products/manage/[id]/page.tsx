"use client"
import { useEffect, useState, useRef, useCallback, use } from 'react';
import { Loader2, ArrowLeft, Trash2, Save, X, Plus, Upload, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Variant { size: string; color: string; stock: number; sku: string; }
interface ImageRecord { url: string; dominant_color: string; r: number; g: number; b: number; }
interface NewImageInput { type: 'file' | 'url'; id: number; value: File | string; preview: string; isNew: boolean; }

export default function AdminProductEditPage({ params }: { params: { id: string } }) {
    const [product, setProduct] = useState<any>(null);
    const [variants, setVariants] = useState<Variant[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [existingImages, setExistingImages] = useState<ImageRecord[]>([]); // Current images
    const [newImageInputs, setNewImageInputs] = useState<NewImageInput[]>([]); // New uploads/links
    const fileInputRef = useRef<HTMLInputElement>(null);
    const nextImageId = useRef(0);

    const { id: productId } = use(params);

    // Fetch Product & Initialize State
    const fetchProduct = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:4000/api/products/${productId}/admin`); 
            if (!res.ok) throw new Error('Product not found or API error');
            const data = await res.json();
            
            setProduct(data);
            setVariants(data.variants || []);
            setExistingImages(data.images || []); // Set existing images
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

    // IMAGE HANDLERS
    const addNewImageInput = useCallback((type: 'url' | 'file', fileOrUrl: File | string) => {
        if (existingImages.length + newImageInputs.length >= 5) return; // Max 5 images
        const preview = (type === 'file' && fileOrUrl instanceof File) 
          ? URL.createObjectURL(fileOrUrl) 
          : (fileOrUrl as string);
          
        setNewImageInputs(prev => [
          ...prev,
          { type, id: nextImageId.current++, value: fileOrUrl, preview, isNew: true }
        ]);
    }, [existingImages.length, newImageInputs.length]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            for (const file of Array.from(files)) {
                addNewImageInput('file', file);
            }
            e.target.value = '';
        }
    };

    const handleUrlInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const url = e.currentTarget.value;
        if (e.key === 'Enter' && url) {
            e.preventDefault();
            addNewImageInput('url', url);
            e.currentTarget.value = '';
        }
    };

    const removeExistingImage = (url: string) => {
        if (confirm("Remove this image? Changes will save immediately upon clicking 'Save Changes' button.")) {
            setExistingImages(prev => prev.filter(img => img.url !== url));
        }
    };

    const removeNewImage = (id: number) => {
        setNewImageInputs(prev => prev.filter(input => input.id !== id));
    };


    // VARIANT & FORM HANDLERS (Same as before)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setProduct({ ...product, [e.target.name]: e.target.value });
    };
    const handleVariantChange = (index: number, field: keyof Variant, value: string | number) => {
        const newVariants = [...variants];
        // @ts-ignore
        newVariants[index][field] = field === 'stock' ? parseInt(value as string) || 0 : value;
        setVariants(newVariants);
    };
    const addVariant = () => {
        setVariants([...variants, { size: '', color: product.variants[0]?.color || 'Default', stock: 0, sku: '' }]);
    };
    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    // HANDLE SAVE
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage('');

        const form = new FormData();
        
        // 1. Append Text Data
        form.append('name', product.name);
        form.append('slug', product.slug);
        form.append('brand', product.brand);
        form.append('description', product.description);
        form.append('category', product.category);
        form.append('price_cents', (parseFloat(product.price) * 100).toString());
        form.append('variants', JSON.stringify(variants));

        // 2. Separate and Append Images
        const existingImageUrls = existingImages.map(img => img.url);
        const newFileImages = newImageInputs.filter(input => input.type === 'file');
        const newUrlImages = newImageInputs.filter(input => input.type === 'url');

        // Send existing image URLs to the backend so it can merge them with new ones
        form.append('existingImageUrls', JSON.stringify(existingImageUrls));

        // Append new files
        newFileImages.forEach(input => {
             // @ts-ignore
            form.append('newImages', input.value); // Backend needs to look for 'newImages' (We will update the backend route/controller)
        });

        // Append new URLs
        form.append('newImageUrls', JSON.stringify(newUrlImages.map(input => input.value)));

        try {
            // New endpoint to update the entire product (We will use PATCH for update)
            const res = await fetch(`http://localhost:4000/api/products/${productId}/edit`, { 
                method: 'PATCH', 
                // IMPORTANT: No 'Content-Type' for FormData
                body: form
            });

            if (res.ok) {
                setMessage('✅ Product saved successfully!');
                const updatedProduct = await res.json();
                setExistingImages(updatedProduct.images); // Update image array from response
                setNewImageInputs([]); // Clear new inputs after successful upload/save
                setProduct({ ...updatedProduct, price: (updatedProduct.price_cents / 100).toFixed(2) }); // Update local product state
            } else {
                throw new Error('Failed to save product on backend.');
            }
        } catch (error) {
            setMessage('❌ Failed to save. Check console.');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-96"><Loader2 className="animate-spin w-8 h-8 text-blue-600" /></div>;
    }
    if (!product) return <div className="text-center py-20">Product not found.</div>;

    const totalImages = existingImages.length + newImageInputs.length;
    
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/products" className="p-2 hover:bg-gray-100 rounded-full transition">
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </Link>
                <h1 className="text-2xl font-bold">Edit Product: {product.name}</h1>
                {isSaving && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
                {message && <span className={`text-sm font-bold ${message.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>{message}</span>}
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-5 gap-8">
                
                {/* LEFT Column: Product Details (non-stock) */}
                <div className="col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <h2 className="text-xl font-bold mb-4">Product Details</h2>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Name</label>
                    <input type="text" name="name" value={product.name || ''} onChange={handleChange} className="w-full p-3 border rounded-lg" />
                    
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description</label>
                    <textarea name="description" value={product.description || ''} onChange={handleChange} className="w-full p-3 border rounded-lg h-32" />
                    
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Price ($)</label>
                    <input type="number" name="price" value={product.price || ''} onChange={handleChange} className="w-full p-3 border rounded-lg" />
                </div>
                
                {/* MIDDLE Column: Variants/Stock */}
                <div className="col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <h2 className="text-xl font-bold mb-4">Stock & Variant Management</h2>

                    {/* Variant Table (Same as before) */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-12 gap-4 text-xs font-bold text-gray-500 uppercase">
                            <div className="col-span-3">Size</div>
                            <div className="col-span-3">Stock</div>
                            <div className="col-span-4">SKU</div>
                            <div className="col-span-2"></div>
                        </div>
                        
                        {variants.map((variant, index) => (
                            <div key={index} className="grid grid-cols-12 gap-4 items-center border-b border-gray-50 pb-2">
                                <div className="col-span-3">
                                    <input type="text" name="size" value={variant.size} readOnly className="w-full p-2 border rounded-lg bg-gray-100 uppercase text-sm" />
                                </div>
                                <div className="col-span-3">
                                    <input 
                                        type="number" 
                                        name="stock"
                                        value={variant.stock} 
                                        onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div className="col-span-4">
                                    <input type="text" name="sku" value={variant.sku} readOnly className="w-full p-2 border rounded-lg bg-gray-100 text-xs" />
                                </div>
                                <div className="col-span-2 flex justify-end">
                                    <button type="button" onClick={() => removeVariant(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button type="button" onClick={addVariant} className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1 mt-4">
                        <Plus className="w-4 h-4" /> Add New Variant
                    </button>
                </div>
                
                {/* RIGHT Column: Images and Save Button */}
                <div className="col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="font-bold text-lg mb-4">Product Images ({totalImages}/5)</h2>
                        
                        {/* Current Images Grid */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                           {existingImages.map((img, index) => (
                              <div key={img.url} className="relative aspect-square rounded-lg overflow-hidden border-2 border-green-500">
                                <img src={img.url} alt={`Existing ${index}`} className="w-full h-full object-cover" />
                                <button type="button" onClick={() => removeExistingImage(img.url)} className="absolute top-1 right-1 bg-red-600/70 hover:bg-red-700 p-0.5 rounded-full transition">
                                    <X className="w-3 h-3 text-white" />
                                </button>
                                <span className="absolute bottom-0 left-0 text-xs font-bold bg-black/60 text-white px-1">OLD</span>
                              </div>
                           ))}
                           {newImageInputs.map(input => (
                               <div key={input.id} className="relative aspect-square rounded-lg overflow-hidden border-2 border-blue-500">
                                    <img src={input.preview} alt="New" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeNewImage(input.id)} className="absolute top-1 right-1 bg-black/50 hover:bg-red-700 p-0.5 rounded-full transition">
                                        <X className="w-3 h-3 text-white" />
                                    </button>
                                    <span className="absolute bottom-0 left-0 text-xs font-bold bg-blue-600/70 text-white px-1">NEW</span>
                               </div>
                           ))}
                           {totalImages < 5 && (
                                <div className="aspect-square bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center text-gray-400">
                                   <ImageIcon className="w-8 h-8 opacity-50" />
                                </div>
                           )}
                        </div>

                        {/* Image Input Buttons */}
                        <div className="flex flex-col gap-2">
                           <button type="button" onClick={() => fileInputRef.current?.click()} disabled={totalImages >= 5} className="w-full bg-blue-50 text-blue-600 font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-100 transition disabled:opacity-50">
                             <Upload className="w-4 h-4" /> Upload File
                           </button>
                           <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" multiple />
                           <input type="url" placeholder="Paste URL & Press Enter" onKeyDown={handleUrlInput} disabled={totalImages >= 5} className="w-full p-2 border rounded-lg text-sm disabled:bg-gray-100" />
                        </div>
                    </div>

                    <button type="submit" disabled={isSaving} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">
                        <Save className="w-5 h-5" /> Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}