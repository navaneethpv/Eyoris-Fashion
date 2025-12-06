import mongoose from 'mongoose';

// Image Sub-schema with Color Data
const ImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  dominant_color: { type: String }, // Hex, e.g., "#FF0000"
  r: { type: Number },
  g: { type: Number },
  b: { type: Number },
}, { _id: false });

// Variant Sub-schema
const VariantSchema = new mongoose.Schema({
  size: { type: String, required: true },
  color: { type: String, required: true },
  sku: { type: String },
  stock: { type: Number, default: 0 },
}, { _id: false });

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  brand: { type: String, required: true },
  category: { type: String, required: true, index: true },
  description: { type: String },
  
  // Pricing (in cents to avoid float issues)
  price_cents: { type: Number, required: true },
  price_before_cents: { type: Number }, // For strike-through prices
  offer_tag: { type: String }, // e.g., "Flat 30% Off"

  // Images & Visuals
  images: [ImageSchema], 
  
  // Inventory & Variants
  variants: [VariantSchema],

  // Meta
  tags: [{ type: String }], // e.g., ["summer", "casual", "cotton"]
  rating: { type: Number, default: 0 },
  reviews_count: { type: Number, default: 0 },
  is_published: { type: Boolean, default: true, index: true },

}, { timestamps: true });

// --- INDEXES ---

// 1. Text Search Index (Name, Description, Tags)
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });

// 2. Color Search Index (Creating an index on the nested fields for faster lookups if needed)
ProductSchema.index({ 'images.r': 1, 'images.g': 1, 'images.b': 1 });

// 3. Filter Indexes
ProductSchema.index({ 'variants.size': 1 });
ProductSchema.index({ 'variants.color': 1 });
ProductSchema.index({ price_cents: 1 });

export const Product = mongoose.model('Product', ProductSchema);