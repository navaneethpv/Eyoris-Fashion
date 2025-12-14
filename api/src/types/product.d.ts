// api/src/types/product.d.ts

export interface Image {
  url: string;
}

export interface Variant {
  size: string;
  color: string;
  sku: string;
  stock: number;
}

export interface DominantColor {
  hex: string;
  rgb: {
    r: number;
    g: number;
    b: number;
  };
  name?: string; // Made optional as it's missing in your provided sample
}

export interface AiTags {
  style_tags: string[];
  material_tags: string[];
  occasion_tags?: string[]; // Made optional, or provide default in schema
  description_summary?: string; // Made optional
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  description: string;
  category: string;
  subCategory: string;
  price_cents: number;
  price_before_cents?: number;
  images: Image[];
  variants: Variant[];
  dominantColor: DominantColor;
  aiTags: AiTags;
  rating: number;
  reviewsCount: number;
  isPublished: boolean;
  productId_ext: string;
  createdAt: Date;
  updatedAt: Date;
}