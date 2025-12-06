"use client"
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

const CATEGORIES = ['T-Shirts', 'Jeans', 'Dresses', 'Jackets', 'Sneakers', 'Accessories'];
const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
];

export default function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Helper to update URL params
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      params.set('page', '1'); // Reset to page 1 on filter change
      return params.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (key: string, value: string) => {
    router.push(`/product?${createQueryString(key, value)}`);
  };

  return (
    <div className="space-y-8">
      {/* Sort By */}
      <div>
        <h3 className="font-bold text-sm mb-3 uppercase tracking-wider">Sort By</h3>
        <select 
          className="w-full p-2 border border-gray-300 rounded text-sm bg-white"
          value={searchParams.get('sort') || 'newest'}
          onChange={(e) => handleFilterChange('sort', e.target.value)}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Categories */}
      <div>
        <h3 className="font-bold text-sm mb-3 uppercase tracking-wider">Categories</h3>
        <div className="space-y-2">
          {CATEGORIES.map((cat) => {
            const isActive = searchParams.get('category') === cat;
            return (
              <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="radio" 
                  name="category"
                  checked={isActive}
                  onChange={() => handleFilterChange('category', cat)}
                  className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                />
                <span className={`text-sm group-hover:text-primary transition-colors ${isActive ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                  {cat}
                </span>
              </label>
            );
          })}
          {/* Clear Filter */}
          {searchParams.get('category') && (
            <button 
              onClick={() => handleFilterChange('category', '')}
              className="text-xs text-red-500 hover:underline mt-2"
            >
              Clear Category
            </button>
          )}
        </div>
      </div>

      {/* Price Range (Simple manual inputs) */}
      <div>
        <h3 className="font-bold text-sm mb-3 uppercase tracking-wider">Price</h3>
        <div className="flex gap-2">
           <button onClick={() => handleFilterChange('maxPrice', '5000')} className="px-3 py-1 border text-xs rounded hover:bg-gray-100">Under $50</button>
           <button onClick={() => handleFilterChange('minPrice', '10000')} className="px-3 py-1 border text-xs rounded hover:bg-gray-100">$100+</button>
        </div>
        {(searchParams.get('minPrice') || searchParams.get('maxPrice')) && (
           <button 
           onClick={() => {
             const params = new URLSearchParams(searchParams.toString());
             params.delete('minPrice');
             params.delete('maxPrice');
             router.push(`/product?${params.toString()}`);
           }}
           className="text-xs text-red-500 hover:underline mt-2"
         >
           Clear Price
         </button>
        )}
      </div>
    </div>
  );
}