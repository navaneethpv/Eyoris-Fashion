import mongoose, { Document, Schema } from "mongoose";
import { IDominantColor, IAITags } from "./common";

export interface IProductV2 extends Document {
    name: string;
    slug: string;
    description: string;
    price: number;
    price_cents: number;
    price_before_cents?: number;
    brand: string;
    category: string;
    subCategory?: string;
    gender?: string;
    masterCategory?: string;
    isFashionItem?: boolean;
    images: string[];
    stock: number;
    views?: number;
    dominantColor: IDominantColor & { name?: string };
    aiTags: IAITags;
    variants?: any[];
    rating?: number;
    reviewsCount?: number;
    isPublished?: boolean;
}

const ProductV2Schema = new Schema<IProductV2>(
    {
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, trim: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        price_cents: { type: Number, required: true },
        price_before_cents: { type: Number },
        brand: { type: String, required: true },
        category: { type: String, required: true, index: true },
        subCategory: { type: String },
        gender: { type: String, index: true },
        masterCategory: { type: String },
        isFashionItem: { type: Boolean, default: false },

        images: [{ type: String, required: true }],

        stock: {
            type: Number,
            required: true,
            default: 0,
        },

        views: {
            type: Number,
            default: 0
        },

        dominantColor: {
            hex: { type: String },
            rgb: { type: [Number] },
            name: { type: String },
        },

        aiTags: {
            dominant_color_name: { type: String },
            style_tags: { type: [String] },
            material_tags: { type: [String] },
        },

        variants: [{ type: Schema.Types.Mixed }],
        rating: { type: Number },
        reviewsCount: { type: Number, default: 0 },
        isPublished: { type: Boolean, default: true },
    },
    { timestamps: true }
);

ProductV2Schema.index({ name: "text", category: "text" });

export const ProductV2 = mongoose.model<IProductV2>("ProductV2", ProductV2Schema);
export default ProductV2;
