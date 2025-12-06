"use client"
import { useState, useRef } from 'react';
import { X, Upload, Loader2, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface ImageSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageSearchModal({ isOpen, onClose }: ImageSearchModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [queryColor, setQueryColor] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResults([]); // Reset previous results
      setQueryColor(null);
    }
  };

  const handleSearch = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('http://localhost:4000/api/ai/image-search', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setResults(data.results || []);
      setQueryColor(data.queryColor);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResults([]);
    setQueryColor(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary to-accent" />
            AI Color Match
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* 1. Upload Section */}
          {!results.length && !loading && (
            <div className="flex flex-col items-center justify-center h-full py-10 space-y-6">
              {preview ? (
                <div className="relative w-64 h-64 rounded-xl overflow-hidden shadow-lg border-4 border-white">
                   <Image src={preview} alt="Preview" fill className="object-cover" />
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full max-w-md h-64 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-violet-50 transition-colors group"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-white group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-primary" />
                  </div>
                  <p className="font-medium text-gray-600">Click to upload photo</p>
                  <p className="text-xs text-gray-400 mt-2">Supports JPG, PNG (Max 5MB)</p>
                </div>
              )}

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />

              {preview && (
                <div className="flex gap-4">
                  <button onClick={reset} className="px-6 py-2.5 rounded-full font-bold text-sm border border-gray-300 hover:bg-gray-50">
                    Replace
                  </button>
                  <button 
                    onClick={handleSearch}
                    className="px-8 py-2.5 rounded-full font-bold text-sm bg-primary text-white hover:bg-violet-700 shadow-lg shadow-violet-200"
                  >
                    Find Matches
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 2. Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Analyzing colors...</p>
            </div>
          )}

          {/* 3. Results Section */}
          {results.length > 0 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-6 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                    <Image src={preview!} alt="Original" fill className="object-cover" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <div className="text-center">
                    <div 
                      className="w-16 h-16 rounded-lg shadow-sm border border-gray-200"
                      style={{ backgroundColor: queryColor?.hex || '#ccc' }}
                    />
                    <span className="text-[10px] font-mono text-gray-500 mt-1 block uppercase">{queryColor?.hex}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">Analysis Complete</h3>
                  <p className="text-sm text-gray-500">
                    We found {results.length} items matching this dominant color.
                  </p>
                </div>
                <button onClick={reset} className="text-sm font-semibold text-primary hover:underline">
                  Start Over
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {results.map((product: any) => (
                  <Link key={product.slug} href={`/products/${product.slug}`} onClick={onClose} className="group block">
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 mb-2">
                      <Image 
                        src={product.images[0].url} 
                        alt={product.name} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform" 
                      />
                      <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full">
                        {Math.round(product.similarity * 100)}% Match
                      </div>
                    </div>
                    <h4 className="font-medium text-sm text-gray-900 truncate">{product.name}</h4>
                    <p className="text-xs text-gray-500">${(product.price_cents / 100).toFixed(2)}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}