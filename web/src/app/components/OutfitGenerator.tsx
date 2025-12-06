"use client"
import { useState } from 'react';
import { Wand2, Loader2, Shirt, MoveRight } from 'lucide-react';

export default function OutfitGenerator({ currentProduct }: { currentProduct: string }) {
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      setGenerated(true);
    }, 2000);
  };

  return (
    <div className="mt-12 border border-violet-100 bg-gradient-to-r from-violet-50 to-white rounded-2xl p-6 md:p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <Wand2 className="w-5 h-5 text-primary" />
            AI Stylist
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Not sure how to style this? Let our AI generate a complete look for you.
          </p>
        </div>
        {!generated && (
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-lg shadow-violet-200 hover:bg-violet-700 transition flex items-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            Generate Outfit
          </button>
        )}
      </div>

      {generated && (
        <div className="animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-white px-2 py-1 rounded border border-violet-100">
              Casual Street Look
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 md:gap-8 items-center">
            {/* The Item */}
            <div className="text-center opacity-50">
               <div className="bg-white p-4 rounded-xl border border-gray-100 mb-2 h-32 flex items-center justify-center">
                  <span className="text-xs text-gray-400 font-medium">This Item</span>
               </div>
            </div>

            <div className="flex justify-center text-gray-300">
              <MoveRight className="w-6 h-6" />
            </div>

            {/* Suggested Match (Mocked) */}
            <div className="text-center">
               <div className="bg-white p-2 rounded-xl border border-primary/20 shadow-sm mb-2 relative h-32 overflow-hidden">
                  <img 
                    src="https://picsum.photos/seed/jeans/200/300" 
                    alt="Jeans" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1">
                    98% Match
                  </div>
               </div>
               <p className="text-xs font-bold">Urban Cargo Pants</p>
               <p className="text-[10px] text-gray-500">$45.00</p>
            </div>
          </div>
          
          <button 
            onClick={() => setGenerated(false)} 
            className="text-xs text-gray-400 mt-4 hover:text-primary underline"
          >
            Try another style
          </button>
        </div>
      )}
    </div>
  );
}