"use client"
import { useEffect, useState, useCallback, use } from 'react';
import { Loader2, ArrowLeft, Trash2, Save, Plus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Variant {
    size: string;
    color: string;
    stock: number;
    sku: string;
}


interface Product {
    name: string;
    slug: string;
    images: string[];
    variants: Variant[];
    price: string;
    description: string;
    // Add other fields as needed
}

export default function AdminProductEditPage({ params }: { params: Promise<{ id: string }> }) {
    const [product, setProduct] = useState<Product | null>(null);
    const [variants, setVariants] = useState<Variant[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    const { id: productId } = use(params);

    const fetchProduct = useCallback(async () => {
        setLoading(true);
        try {

            const res = await fetch(`http://localhost:4000/api/products/admin/${productId}`);
            if (!res.ok) throw new Error('Product not found or API error');
            const data = await res.json();
            
            setProduct(data);
            setVariants(data.variants || []);
        } catch (error) {
            console.error(error);
            setMessage('Error: Could not load product data.');
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        if (productId) fetchProduct();
    }, [productId, fetchProduct]);

    // Handle form field changes (non-variant fields)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!product) return;
        setProduct({ ...product, [e.target.name]: e.target.value });
    };

    // Handle Variant Array changes
    const handleVariantChange = (index: number, field: keyof Variant, value: string | number) => {
        const newVariants = [...variants];
        // @ts-expect-error
        newVariants[index][field] = field === 'stock' ? parseInt(value as string) || 0 : value;
        setVariants(newVariants);
    };

    const addVariant = () => {
        if (!product) return;
        setVariants([...variants, { size: '', color: product.variants[0]?.color || 'Default', stock: 0, sku: '' }]);
    };
    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    // HANDLE SAVE
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product) return;
        setIsSaving(true);
        setMessage('');

        try {
            // New endpoint to update the entire product
            const res = await fetch(`http://localhost:4000/api/products/${productId}`, { 
                method: 'PUT', // Use PUT for full replacement or PATCH for partial
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...product,
                    price_cents: parseFloat(product.price) * 100, // Re-convert price field if you allow editing
                    variants: variants // Send the updated variant array
                })
            });

            if (res.ok) {
                setMessage('✅ Product saved successfully!');
            } else {
                throw new Error('Failed to save product on backend.');
            }
        } catch (error) {
            console.error(error);
            setMessage('❌ Failed to save. Check console.');
        } finally {
            setIsSaving(false);
        }
    };

    // Placeholder for missing variables and functions
    const imageInputs: any[] = []; // Define properly based on your code
    const fileInputRef = { current: null }; // Define properly
    const totalImages = 0; // Define properly
    const Upload = () => null; // Import or define
    const handleFileChange = () => {}; // Define function
    const handleUrlInput = () => {}; // Define function

    if (loading) {
        return <div className="flex justify-center items-center h-96"><Loader2 className="animate-spin w-8 h-8 text-blue-600" /></div>;
    }
    if (!product) return <div className="text-center py-20">Product not found.</div>;

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
                        <h2 className="font-bold text-lg mb-4">Product Images</h2>
                        

                        {/* Current Images Grid */}
                        <div className="grid grid-cols-3 gap-4">
                            {(product.images || []).map((img, index) => (
                                <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                    <Image src={img} alt={`Existing ${index}`} fill className="object-cover" />
                                </div>
                            ))}
                            {imageInputs.map((input, index) => (
                                <div key={`new-${index}`} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                    <Image src={input.preview} alt="New" fill className="object-cover" />
                                </div>
                            ))}
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