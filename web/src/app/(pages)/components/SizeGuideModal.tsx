"use client";

import { useState, useRef, useEffect } from "react";
import { X, Ruler, Info } from "lucide-react";

interface SizeGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type TabType = "dresses" | "footwear";

export default function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
    const [activeTab, setActiveTab] = useState<TabType>("dresses");
    const modalRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            // Prevent body scroll when modal is open
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop with blur */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                aria-hidden="true"
            />

            {/* Modal Content */}
            <div
                ref={modalRef}
                className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-serif font-medium text-gray-900 flex items-center gap-2">
                            <Ruler className="w-5 h-5 text-gray-400" />
                            Size Guide
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Find your perfect fit</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-900"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab("dresses")}
                        className={`flex-1 py-4 text-sm font-medium transition-colors relative ${activeTab === "dresses"
                                ? "text-gray-900"
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        Dresses
                        {activeTab === "dresses" && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("footwear")}
                        className={`flex-1 py-4 text-sm font-medium transition-colors relative ${activeTab === "footwear"
                                ? "text-gray-900"
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        Footwear
                        {activeTab === "footwear" && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900" />
                        )}
                    </button>
                </div>

                {/* Content Area */}
                <div className="overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">

                    {/* DRESSES CONTENT */}
                    {activeTab === "dresses" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Women's Dresses Table */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Women's Dresses</h3>
                                <div className="overflow-x-auto rounded-xl border border-gray-100">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-500 font-medium">
                                            <tr>
                                                <th className="px-4 py-3">Size</th>
                                                <th className="px-4 py-3">Bust (in)</th>
                                                <th className="px-4 py-3">Waist (in)</th>
                                                <th className="px-4 py-3">Hip (in)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {[
                                                { size: "XS", bust: "30–32", waist: "24–26", hip: "32–34" },
                                                { size: "S", bust: "33–35", waist: "27–29", hip: "35–37" },
                                                { size: "M", bust: "36–38", waist: "30–32", hip: "38–40" },
                                                { size: "L", bust: "39–41", waist: "33–35", hip: "41–43" },
                                                { size: "XL", bust: "42–44", waist: "36–38", hip: "44–46" },
                                                { size: "XXL", bust: "45–47", waist: "39–41", hip: "47–49" },
                                            ].map((row, i) => (
                                                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-gray-900">{row.size}</td>
                                                    <td className="px-4 py-3 text-gray-600">{row.bust}</td>
                                                    <td className="px-4 py-3 text-gray-600">{row.waist}</td>
                                                    <td className="px-4 py-3 text-gray-600">{row.hip}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Fit Tips */}
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                                    <Info className="w-4 h-4 text-gray-400" />
                                    Fit Tips
                                </h4>
                                <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside marker:text-gray-300">
                                    <li>For a relaxed fit, consider sizing up.</li>
                                    <li>For a fitted look, choose your exact size.</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* FOOTWEAR CONTENT */}
                    {activeTab === "footwear" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">

                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Women's Footwear */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Women's Footwear</h3>
                                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                                <tr>
                                                    <th className="px-3 py-2">UK</th>
                                                    <th className="px-3 py-2">EU</th>
                                                    <th className="px-3 py-2">US</th>
                                                    <th className="px-3 py-2">CM</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {[
                                                    { uk: "3", eu: "36", us: "5", cm: "22.8" },
                                                    { uk: "4", eu: "37", us: "6", cm: "23.5" },
                                                    { uk: "5", eu: "38", us: "7", cm: "24.1" },
                                                    { uk: "6", eu: "39", us: "8", cm: "24.8" },
                                                    { uk: "7", eu: "40", us: "9", cm: "25.4" },
                                                    { uk: "8", eu: "41", us: "10", cm: "26.0" },
                                                ].map((row, i) => (
                                                    <tr key={i} className="hover:bg-gray-50/50">
                                                        <td className="px-3 py-2 font-medium text-gray-900">{row.uk}</td>
                                                        <td className="px-3 py-2 text-gray-600">{row.eu}</td>
                                                        <td className="px-3 py-2 text-gray-600">{row.us}</td>
                                                        <td className="px-3 py-2 text-gray-600">{row.cm}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Men's Footwear */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Men's Footwear</h3>
                                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                                <tr>
                                                    <th className="px-3 py-2">UK</th>
                                                    <th className="px-3 py-2">EU</th>
                                                    <th className="px-3 py-2">US</th>
                                                    <th className="px-3 py-2">CM</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {[
                                                    { uk: "6", eu: "40", us: "7", cm: "25.0" },
                                                    { uk: "7", eu: "41", us: "8", cm: "25.7" },
                                                    { uk: "8", eu: "42", us: "9", cm: "26.3" },
                                                    { uk: "9", eu: "43", us: "10", cm: "27.0" },
                                                    { uk: "10", eu: "44", us: "11", cm: "27.6" },
                                                    { uk: "11", eu: "45", us: "12", cm: "28.3" },
                                                ].map((row, i) => (
                                                    <tr key={i} className="hover:bg-gray-50/50">
                                                        <td className="px-3 py-2 font-medium text-gray-900">{row.uk}</td>
                                                        <td className="px-3 py-2 text-gray-600">{row.eu}</td>
                                                        <td className="px-3 py-2 text-gray-600">{row.us}</td>
                                                        <td className="px-3 py-2 text-gray-600">{row.cm}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Fit Tips */}
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                                    <Info className="w-4 h-4 text-gray-400" />
                                    Fit Tips
                                </h4>
                                <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside marker:text-gray-300">
                                    <li>Measure heel to toe.</li>
                                    <li>If between sizes, choose the larger size.</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Mandatory Disclaimer */}
                    <div className="text-xs text-gray-400 text-center pt-4 border-t border-gray-100">
                        Size guide is for reference only. Actual fit may vary by style and fabric.
                    </div>
                </div>
            </div>
        </div>
    );
}
