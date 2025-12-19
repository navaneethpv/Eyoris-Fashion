"use client";

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

interface SliderProduct {
  _id: string;
  slug: string;
  name: string;
  brand?: string;
  price_cents: number;
  images?: any;
  rating?: number;
}

interface ProductSliderProps {
  title: string;
  products: SliderProduct[];
}

export default function ProductSlider({ title, products }: ProductSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!products || products.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300; // approx card width
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="mt-12 mb-8">
       <div className="flex items-center justify-between mb-6">
         <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
           {title}
         </h2>
         <div className="flex gap-2">
           <button 
             onClick={() => scroll('left')}
             className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors"
             aria-label="Scroll left"
           >
             <ChevronLeft className="w-5 h-5 text-gray-600" />
           </button>
           <button 
             onClick={() => scroll('right')}
             className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors"
             aria-label="Scroll right"
           >
             <ChevronRight className="w-5 h-5 text-gray-600" />
           </button>
         </div>
       </div>

       <div 
         ref={scrollRef}
         className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
         style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
       >
         {products.map((product) => (
           <div 
             key={product._id} 
             className="min-w-[200px] w-[200px] md:min-w-[240px] md:w-[240px] snap-start flex-shrink-0"
           >
             <ProductCard product={product} />
           </div>
         ))}
       </div>
    </section>
  );
}
