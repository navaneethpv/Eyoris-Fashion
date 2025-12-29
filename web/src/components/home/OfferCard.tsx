"use client";

import { MouseEventHandler } from "react";
import { ArrowRight } from "lucide-react";

export type OfferFilters = {
  gender?: "Men" | "Women" | "Kids";
  category?: string[];
  maxPrice?: number;
  colors?: string[];
};

export interface OfferCardProps {
  title: string;
  subtitle: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

export default function OfferCard({ title, subtitle, onClick }: OfferCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group relative overflow-hidden rounded-2xl
        bg-[#0f0f0f] text-left text-white
        p-5 sm:p-6
        border border-white/10
        transition-all duration-300
        hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40
      "
    >
      {/* SUBTLE GRADIENT GLOW */}
      <div className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_60%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.06),transparent_55%)]" />

      <div className="relative flex flex-col gap-3">
        {/* BADGE */}
        <div className="inline-flex items-center gap-2 self-start rounded-full bg-white/10 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-widest text-gray-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Limited Time
        </div>

        {/* TITLE */}
        <h3 className="text-sm sm:text-base font-semibold tracking-tight text-white">
          {title}
        </h3>

        {/* SUBTITLE */}
        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
          {subtitle}
        </p>

        {/* FOOTER */}
        <div className="mt-6 flex items-center justify-between text-xs text-gray-300">
          <span className="inline-flex items-center gap-1 transition group-hover:text-white">
            View curated styles
            <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
          </span>

          <span className="rounded-full border border-white/20 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-widest text-white">
            Shop Now
          </span>
        </div>
      </div>
    </button>
  );
}
