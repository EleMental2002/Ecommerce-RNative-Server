import express from 'express';
import { isAdmin, isAuth } from '../middlewares/authMiddleware.js';
import { createProductController, deleteProductController, deleteProductImageController, getAllProductsController, getSingleProductController, getTopProductsController, productReviewController, updateProductController, updateProductImageController } from '../controllers/productController.js';
import { singleUpload } from '../middlewares/multer.js';

const router = express.Router();

//routes
//Get all products
router.get('/get-all', getAllProductsController)

//get top products
router.get("/top", getTopProductsController)
//Get single product
router.get('/:id', getSingleProductController)

//Create product
router.post('/create', isAuth, isAdmin, singleUpload, createProductController)

//Update product
router.put('/:id', isAuth, isAdmin, updateProductController)

//Update product image
router.put('/image/:id', isAuth, isAdmin, singleUpload, updateProductImageController)

//delete product image
router.delete('/delete-image/:id', isAuth, isAdmin, deleteProductImageController)

//delete product 
router.delete('/delete/:id', isAuth, isAdmin, deleteProductController)

//review product
router.put("/:id/review", isAuth, productReviewController)



export default router;
