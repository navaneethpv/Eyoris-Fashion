"use client";

import { useState, useRef } from "react";
import { X, Upload, CheckCircle, AlertCircle, Loader2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";

interface StoryUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
    productId: string;
    productName: string;
    productImage: string;
}

export default function StoryUploadModal({
    isOpen,
    onClose,
    orderId,
    productId,
    productName,
    productImage
}: StoryUploadModalProps) {
    const { getToken } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [caption, setCaption] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState("");

    // Hidden file input ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            // Validate type
            if (!selectedFile.type.startsWith('image/')) {
                setErrorMessage("Please upload an image file (JPG/PNG).");
                setStatus('error');
                return;
            }
            // Validate size (e.g. 5MB)
            if (selectedFile.size > 5 * 1024 * 1024) {
                setErrorMessage("File size should be less than 5MB.");
                setStatus('error');
                return;
            }

            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setStatus('idle');
            setErrorMessage("");
        }
    };

    const handleSubmit = async () => {
        if (!file) return;

        setIsSubmitting(true);
        setStatus('idle');
        setErrorMessage("");

        try {
            const token = await getToken();
            const formData = new FormData();
            formData.append("image", file);
            formData.append("orderId", orderId);
            formData.append("productId", productId);
            formData.append("caption", caption);

            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

            const res = await fetch(`${API_URL}/api/stories`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to upload story");
            }

            setStatus('success');
            setTimeout(() => {
                onClose();
                // Reset state
                setFile(null);
                setPreview(null);
                setCaption("");
                setStatus('idle');
            }, 2000);

        } catch (error: any) {
            console.error("Upload error:", error);
            setStatus('error');
            setErrorMessage(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">Share Your Look</h3>
                    <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">

                    {/* Product Reference */}
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="relative w-12 h-12 bg-white rounded-md overflow-hidden border border-gray-200 flex-shrink-0">
                            {productImage ? (
                                <Image src={productImage} alt={productName} fill className="object-cover" />
                            ) : (
                                <ImageIcon className="w-5 h-5 text-gray-300 m-auto translate-y-3" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Purchased Item</p>
                            <p className="text-sm font-medium text-gray-900 truncate">{productName}</p>
                        </div>
                    </div>

                    {/* Image Upload Area */}
                    <div className="space-y-3">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`
                                relative aspect-[4/5] rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center text-center
                                ${preview ? 'border-transparent' : 'border-gray-200 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'}
                            `}
                        >
                            {preview ? (
                                <>
                                    <Image src={preview} alt="Preview" fill className="object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <p className="text-white font-medium flex items-center gap-2">
                                            <Upload className="w-4 h-4" /> Change Photo
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="p-6">
                                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <p className="font-medium text-gray-900">Upload Photo</p>
                                    <p className="text-xs text-gray-500 mt-1">Accepts JPG/PNG (Up to 5MB)</p>
                                    <p className="text-[10px] text-gray-400 mt-2 px-4">
                                        Tip: Make sure the product is clearly visible.
                                    </p>
                                </div>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>

                    {/* Caption */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Caption (Optional)</label>
                        <input
                            type="text"
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="How do you style it?"
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                            maxLength={100}
                        />
                    </div>

                    {/* Status Messages */}
                    {status === 'error' && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 flex-shrink-0" />
                            <span>Story uploaded successfully!</span>
                        </div>
                    )}

                    {/* Action Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={!file || isSubmitting || status === 'success'}
                        className={`
                            w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
                            ${!file || isSubmitting || status === 'success'
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                            }
                        `}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Verifying & Uploading...
                            </>
                        ) : status === 'success' ? (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                Posted
                            </>
                        ) : (
                            "Post Story"
                        )}
                    </button>

                    {isSubmitting && (
                        <p className="text-center text-xs text-gray-400 animate-pulse">
                            AI is verifying your photo...
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
