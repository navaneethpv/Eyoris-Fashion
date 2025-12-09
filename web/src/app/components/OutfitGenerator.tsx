"use client"
import { useState } from 'react';
import Link from 'next/link';
import { Wand2, Loader2, Zap, Tag, Info, ChevronDown } from 'lucide-react'; // 👈 ADD ChevronDown

// Simplified types matching the Gemini output schema
interface OutfitItem {
    role: string;
    suggestedType: string;
    colorSuggestion: string;
    colorHexSuggestion: string;
    reason: string;
}

interface OutfitResult {
    outfitTitle: string;
    outfitItems: OutfitItem[];
    overallStyleExplanation: string;
    tags: string[];
}

// Styles available for the user to choose
const STYLE_VIBES = [
    { value: 'simple_elegant', label: 'Simple & Elegant' },
    { value: 'street_casual', label: 'Street & Casual' },
    { value: 'office_formal', label: 'Office & Formal' },
    { value: 'party_bold', label: 'Party & Bold' },
];


export default function OutfitGenerator({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OutfitResult | null>(null);

  // 🛑 NEW STATE FOR USER INPUT 🛑
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [styleVibe, setStyleVibe] = useState(STYLE_VIBES[0].value);
  // 🛑 END NEW STATE 🛑


  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);

    // 🛑 GATHERING USER INPUT FOR AI PROMPT 🛑
    const userPreferences = {
        gender: gender, // Use state
        styleVibe: styleVibe, // Use state
        avoidColors: ['neon green', 'bright yellow'], // Test a few colors
        preferredBrightness: 'medium',
        maxItems: 4
    };
    // 🛑 END GATHERING USER INPUT 🛑


    try {
      const res = await fetch('http://localhost:4000/api/ai/outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, userPreferences })
      });
      
      if (!res.ok) throw new Error("API failed");
      
      const data = await res.json();
      setResult(data);

    } catch (err) {
      console.error(err);
      setResult({ outfitTitle: "Generation Failed", overallStyleExplanation: "Could not connect to AI stylist.", outfitItems: [], tags: ["error"] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-12 border border-violet-100 bg-gradient-to-r from-violet-50 to-white rounded-2xl p-6 md:p-8">
      
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <Wand2 className="w-5 h-5 text-primary" />
            AI Stylist: Outfit Generator
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Let our AI generate a complete, matching outfit for your current item.
          </p>
        </div>
        <button 
            onClick={handleGenerate}
            disabled={loading}
            className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-lg shadow-violet-200 hover:bg-violet-700 transition flex items-center gap-2 disabled:opacity-70"
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {result ? 'Generate New Look' : 'Generate Outfit'}
        </button>
      </div>
      
      {/* 🛑 USER PREFERENCE INPUTS 🛑 */}
      <div className='flex gap-4 pb-4 mb-4 border-b border-violet-100'>
        {/* Gender Selector */}
        <div className='flex-1'>
            <label className='text-xs font-bold text-gray-500 uppercase block mb-1'>Gender</label>
            <div className='relative'>
                <select 
                    value={gender} 
                    onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                    className='w-full p-2 border border-gray-300 rounded-lg appearance-none bg-white pr-8 text-sm focus:border-primary'
                >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                </select>
                <ChevronDown className='w-4 h-4 absolute right-3 top-2.5 text-gray-500 pointer-events-none' />
            </div>
        </div>

        {/* Style Vibe Selector */}
        <div className='flex-1'>
            <label className='text-xs font-bold text-gray-500 uppercase block mb-1'>Style Vibe</label>
            <div className='relative'>
                <select 
                    value={styleVibe} 
                    onChange={(e) => setStyleVibe(e.target.value)}
                    className='w-full p-2 border border-gray-300 rounded-lg appearance-none bg-white pr-8 text-sm focus:border-primary'
                >
                    {STYLE_VIBES.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
                </select>
                <ChevronDown className='w-4 h-4 absolute right-3 top-2.5 text-gray-500 pointer-events-none' />
            </div>
        </div>
      </div>
      {/* 🛑 END NEW: USER PREFERENCE INPUTS 🛑 */}


      {loading && (
        <div className="flex flex-col items-center justify-center py-6">
          <Loader2 className="w-6 h-6 text-primary animate-spin mb-3" /> 
          <p className="text-sm text-gray-500">Thinking like a stylist...</p>
        </div>
      )}

      {result && result.outfitItems.length > 0 && (
        <div className="animate-fade-in space-y-6">
          <h4 className="text-2xl font-bold text-gray-900">{result.outfitTitle}</h4>
          
          {/* Outfit Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {result.outfitItems.map((item, index) => (
              <div key={index} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <div className="text-xs font-bold text-gray-500 uppercase flex items-center mb-2">
                    <Tag className="w-3 h-3 mr-1" /> {item.role}
                </div>
                <h5 className="font-bold text-lg text-gray-900">{item.suggestedType}</h5>
                <div className="flex items-center gap-2 mt-2">
                    <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: item.colorHexSuggestion }} />
                    <span className="text-sm text-gray-600 capitalize">{item.colorSuggestion}</span>
                </div>
                <p className="text-xs text-gray-500 mt-3 border-t border-gray-50 pt-2">{item.reason}</p>
                {/* Note: This link is purely illustrative; matching real catalog products requires complex search or pre-computation */}
                {item.role === 'top' && (
                    <Link href={`/products/${productId}`} className="text-xs font-bold text-primary hover:underline mt-2">
                        (View Base Item)
                    </Link>
                )}
              </div>
            ))}
          </div>

          {/* Explanation */}
          <div className="bg-gray-50 p-4 rounded-xl text-sm border border-gray-100">
            <h5 className="font-bold mb-1 flex items-center gap-1 text-gray-800"><Info className="w-4 h-4" /> Stylist's Notes</h5>
            <p className="text-gray-600">{result.overallStyleExplanation}</p>
          </div>

        </div>
      )}

      {result && result.outfitItems.length === 0 && !loading && (
        <div className="text-center py-6 text-gray-500">
            {result.overallStyleExplanation}
        </div>
      )}
    </div>
  );
}