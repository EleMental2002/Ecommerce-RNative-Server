import express from 'express';
import { isAdmin, isAuth } from '../middlewares/authMiddleware.js';
import { createCategory, deleteCategoryController, getAllCategoriesController, updateCategoryController } from '../controllers/categoryController.js';


const router = express.Router();

//routes
//* =================== CAT ROUTES ====================
//create category
router.post('/create', isAuth, isAdmin, createCategory)
//get all category
router.get('/get-all', getAllCategoriesController)
//delete single category
router.post("/delete/:id", isAuth, isAdmin, deleteCategoryController)
//update category
router.put("/update/:id", isAuth, isAdmin, updateCategoryController)



export default router;
