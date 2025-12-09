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
  size: { type: String, required: true }, // e.g. "S", "M", "L"
  color: { type: String, required: true }, // e.g. "Red", "Blue"
  sku: { type: String }, // Unique identifier for size-color combo
  stock: { type: Number, default: 0 }, // Available quantity
}, { _id: false });

const ProductSchema = new mongoose.Schema({
  productId_ext: {
    type: String,
    required: true,
    unique: true,
    // Provide a fallback default so bulk seeding doesn't fail when source lacks an external id
    default: () => `seed-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
  }, // Your dataset's 'id' field
  title: {
    type: String,
    required: true,
    // Fallback title when missing during ingestion/seeding
    default: 'Untitled Product',
  }, // Your dataset's 'title' field (maps to 'name' in frontend)
  brand: { type: String, required: true },
  
  category: { // Your dataset's 'category' field
    type: String, 
    required: true, 
    // Extend this enum based on your dataset's actual categories
    enum: ['Men', 'Women', 'Kids', 'T-Shirts', 'Hoodies', 'Jeans', 'Joggers', 'Shirts', 'Jackets', 'Dresses', 'Sneakers', 'Accessories', 'Ethnic Wear'], 
  },
  subcategory: { type: String }, // Your dataset's 'subcategory' field (e.g., "shorts")
  
  description: { type: String }, // Mapped from 'raw_color_text'
  product_url: { type: String }, // Your dataset's 'product_url'
  
  // Pricing (using your dataset's 'price' and 'mrp')
  price_cents: { type: Number, required: true }, // Removed inline index: true
  price_before_cents: { type: Number }, // Your dataset's 'mrp'
  discountPercent: { type: Number, default: 0 }, 
  offer_tag: { type: String }, 

  images: [ImageSchema], 
  variants: [VariantSchema],

  tags: [{ type: String }], 
  rating: { type: Number, default: 0 },
  reviews_count: { type: Number, default: 0 },
  is_published: { type: Boolean, default: true }, // Removed inline index: true

}, { timestamps: true });

// --- INDEXES (Consolidated and Cleaned to avoid warnings) ---

// 1. Text Search Index
ProductSchema.index({ title: 'text', description: 'text', tags: 'text', brand: 'text', subcategory: 'text' });

// 2. Color Search Index
ProductSchema.index({ 'images.r': 1, 'images.g': 1, 'images.b': 1 });

// 3. Filter Indexes
ProductSchema.index({ category: 1 });
ProductSchema.index({ subcategory: 1 });
ProductSchema.index({ 'variants.size': 1 });
ProductSchema.index({ 'variants.color': 1 });
ProductSchema.index({ price_cents: 1 });
ProductSchema.index({ brand: 1 });
ProductSchema.index({ is_published: 1 }); // Corrected place for this index

export const Product = mongoose.model('Product', ProductSchema);