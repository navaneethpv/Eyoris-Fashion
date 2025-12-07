// api/src/routes/productRoutes.ts
import { Router } from 'express';
import { getProducts, getProductBySlug, createProduct, deleteProduct, getProductByIdAdmin, updateProduct, updateProductWithImages } from '../controllers/productController'; // <--- NEW IMPORT
import { upload } from '../config/multer';

const router = Router();

router.get('/', getProducts);
router.post('/', upload.array('images', 5), createProduct);
router.delete('/:id', deleteProduct);
router.put('/:id', updateProduct); // Update route

// ADMIN FETCH ROUTE (Fetch by ID) - Must be before the /:slug route
router.get('/:id/admin', getProductByIdAdmin); 

// PUBLIC FETCH ROUTE (Fetch by Slug)
router.get('/:slug', getProductBySlug); 

router.get('/:id/admin', getProductByIdAdmin); // Fetch by ID for Admin
router.patch('/:id/edit', upload.array('newImages', 5), updateProductWithImages); // <--- NEW ROUTE!
router.put('/:id', updateProduct); // Simple text update by ID (optional, kept for full replacement logic)
export default router;