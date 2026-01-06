// /web/src/app/(pages)/components/ProductCardSkeleton.tsx

"use client";

import React from "react";

export default function ProductCardSkeleton() {
    return (
        <div className="flex flex-col h-full bg-white border border-gray-100 p-5 animate-pulse">
            {/* Image Placeholder - 2:3 Aspect Ratio */}
            <div className="relative aspect-[2/3] bg-neutral-200 rounded-sm mb-3" />

            {/* Info Section */}
            <div className="flex flex-col gap-2">
                {/* Brand Placeholder */}
                <div className="h-3 w-1/2 bg-neutral-100 rounded-full" />

                {/* Name Placeholder */}
                <div className="h-4 w-full bg-neutral-200 rounded-lg" />

                {/* Price Placeholder */}
                <div className="h-5 w-1/3 bg-neutral-200 rounded-md mt-1" />
            </div>
        </div>
    );
}
