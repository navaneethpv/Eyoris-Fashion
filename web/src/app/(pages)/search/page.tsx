"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Camera, Search, X } from "lucide-react";
import Link from "next/link";
import ProductCard from "../components/ProductCard";
import ImageSearchModal from "../components/ImageSearchModal";
import { useDebounce } from "use-debounce";

// Force dynamic rendering
export const dynamic = "force-dynamic";

function SearchPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    const initialQuery = searchParams.get("q") || searchParams.get("search") || "";
    const [query, setQuery] = useState(initialQuery);
    const [debouncedQuery] = useDebounce(query, 500);

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    // Auto-focus on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Sync state with URL params if they change externally (e.g. back button)
    useEffect(() => {
        const q = searchParams.get("q") || searchParams.get("search") || "";
        if (q !== query) {
            setQuery(q);
        }
    }, [searchParams]);

    // Fetch products when debounced query changes
    useEffect(() => {
        if (!debouncedQuery.trim()) {
            setProducts([]);
            return;
        }

        // Update URL without reloading
        const params = new URLSearchParams();
        params.set("q", debouncedQuery);
        router.replace(`/search?${params.toString()}`);

        const fetchProducts = async () => {
            setLoading(true);
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL;
                if (!API_URL) return;

                // Use the same API endpoint as the main product listing
                const res = await fetch(
                    `${API_URL}/api/products?q=${encodeURIComponent(debouncedQuery)}&limit=20`
                );

                if (res.ok) {
                    const data = await res.json();
                    setProducts(data.data || []);
                }
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [debouncedQuery, router]);

    const handleClear = () => {
        setQuery("");
        setProducts([]);
        inputRef.current?.focus();
        router.replace("/search");
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 pb-20">
            {/* Sticky Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3">
                <Link href="/" className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-6 h-6" />
                </Link>

                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for clothes..."
                        className="block w-full pl-10 pr-10 py-2.5 bg-gray-50 border-none rounded-xl text-sm text-gray-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                    />
                    {query && (
                        <button
                            onClick={handleClear}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <button
                    onClick={() => setIsCameraOpen(true)}
                    className="p-2 text-gray-600 hover:text-primary hover:bg-violet-50 rounded-full transition-colors"
                >
                    <Camera className="w-6 h-6" />
                </button>
            </header>

            {/* Content */}
            <main className="px-4 py-6">
                {!query && (
                    <div className="flex flex-col items-center justify-center mt-20 text-center opacity-50">
                        <Search className="w-16 h-16 text-gray-200 mb-4" />
                        <p className="text-gray-500 font-medium">Type to search for products</p>
                    </div>
                )}

                {loading && (
                    <div className="text-center py-10 text-gray-500 text-sm animate-pulse">
                        Searching...
                    </div>
                )}

                {!loading && query && products.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-xl mx-4">
                        <p className="text-gray-500">No results found for "{query}"</p>
                    </div>
                )}

                {products.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                        {products.map((p) => (
                            <ProductCard
                                key={p._id || p.id}
                                product={{
                                    _id: p._id,
                                    slug: p.slug || "",
                                    name: p.name || "",
                                    brand: p.brand || "",
                                    price_cents: p.price_cents ?? 0,
                                    price_before_cents: p.price_before_cents ?? p.price_cents ?? 0,
                                    images: p.images ?? [],
                                    offer_tag: p.offer_tag,
                                }}
                            />
                        ))}
                    </div>
                )}
            </main>

            <ImageSearchModal
                isOpen={isCameraOpen}
                onClose={() => setIsCameraOpen(false)}
            />
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="p-4 text-center">Loading search...</div>}>
            <SearchPageContent />
        </Suspense>
    );
}
