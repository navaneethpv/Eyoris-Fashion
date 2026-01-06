import React, { useState, useRef } from 'react';

interface Positioning {
    region: string;
    position: { x: number; y: number };
    scale: number;
    rotation: number;
}

interface TryOnProps {
    productImageUrl: string;
    productType: string; // 'bangle', 'ring', 'necklace', etc.
    onClose: () => void;
}

const VirtualTryOnModal: React.FC<TryOnProps> = ({ productImageUrl, productType, onClose }) => {
    const [userImage, setUserImage] = useState<string | null>(null);
    const [positioning, setPositioning] = useState<Positioning | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 1. Handle File Upload
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setUserImage(ev.target?.result as string);
                setPositioning(null); // Reset previous try-on
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    // 2. Call API to get Placement Logic
    const handleTryOn = async () => {
        if (!userImage) return;

        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/try-on/preview`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userImageBase64: userImage,
                    productImageUrl,
                    productType
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', response.status, errorText);
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            if (data.positioning) {
                setPositioning(data.positioning);
            }
        } catch (err: any) {
            console.error("Try-on failed", err);
            alert(`Could not analyze image placement. ${err.message || 'Please ensure the backend server is running on port 4000.'}`);
        } finally {
            setLoading(false);
        }
    };

    // 3. Calculated Styles for the Overlay
    const getOverlayStyle = () => {
        if (!positioning) return {};
        const { position, scale, rotation } = positioning;

        return {
            position: 'absolute' as 'absolute',
            left: `${position.x}%`,
            top: `${position.y}%`,
            transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
            width: '30%', // Base width relative to container; adjustable based on product type
            pointerEvents: 'none' as 'none',
            filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.3))' // Adds realism
        };
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="font-bold text-lg text-gray-800">✨ AI Virtual Try-On <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full ml-2">Prototype</span></h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-2xl">&times;</button>
                </div>

                {/* Canvas Area */}
                <div className="relative bg-gray-100 flex-grow flex items-center justify-center overflow-hidden min-h-[400px]">
                    {!userImage ? (
                        <div className="text-center p-8">
                            <p className="mb-4 text-gray-500">Upload a photo of your hand, wrist, or neck</p>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
                            >
                                Upload Photo 📸
                            </button>
                        </div>
                    ) : (
                        <div className="relative w-full h-full flex items-center justify-center">
                            {/* User Image (Background) */}
                            <img
                                src={userImage}
                                alt="User"
                                className="max-h-[60vh] object-contain w-auto shadow-sm"
                            />

                            {/* Product Overlay (The Magic) */}
                            {positioning && (
                                <img
                                    src={productImageUrl}
                                    alt="Virtual Accessory"
                                    style={getOverlayStyle()}
                                    className="transition-all duration-500 ease-out"
                                />
                            )}

                            {/* Loading State */}
                            {loading && (
                                <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
                                    <div className="animate-spin text-4xl">🍌</div>
                                </div>
                            )}
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
                </div>

                {/* Footer Controls */}
                <div className="p-4 border-t bg-white flex justify-between items-center">
                    {userImage ? (
                        <>
                            <button onClick={() => setUserImage(null)} className="text-sm text-gray-500 underline">Reset Photo</button>
                            <button
                                onClick={handleTryOn}
                                disabled={loading || !!positioning}
                                className={`px-8 py-3 rounded-lg font-semibold shadow-lg transition transform active:scale-95 ${positioning
                                    ? 'bg-green-100 text-green-700 cursor-default'
                                    : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                                    }`}
                            >
                                {positioning ? 'Try-On Applied ✅' : (loading ? 'Analyzing...' : 'Visualize on Me ✨')}
                            </button>
                        </>
                    ) : (
                        <span className="text-xs text-gray-400">Supported: Rings, Bangles, Necklaces</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VirtualTryOnModal;