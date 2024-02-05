import categoryModel from "../models/categoryModel.js";
import productModel from "../models/productModel.js";

//Create category
export const createCategory = async (req, res) => {
    try {
        const { category } = req.body;
        //validation
        if (!category) {
            return res.status(404).send({
                success: false,
                message: "please provide category name"
            });
        }
        await categoryModel.create({ category });
        res.status(200).send({
            success: true,
            message: `${category} category created successfully`
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error In creating CAT api"
        })
    }
}

//Get all categories
export const getAllCategoriesController = async (req, res) => {
    try {
        const categories = await categoryModel.find({})
        res.status(200).send({
            success: true,
            message: "Categories Fetch Successfully",
            totalCat: categories.length,
            categories,
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error In get all CAT api"
        })
    }
}

//Delete single category
export const deleteCategoryController = async (req, res) => {
    try {
        //find category
        const category = await categoryModel.findById(req.params.id)
        //validation
        if (!category) {
            return res.status(404).send({
                success: false,
                message: "Category not found"
            })
        }
        //find product with this category id
        const products = await productModel.find({ category: category._id })
        //update products category
        for (let i = 0; i < products.length; i++) {
            const product = products[i]
            product.category = undefined
            await product.save()
        }
        //save category
        await category.deleteOne();
        res.status(200).send({
            success: true,
            message: "Category deleted successfully"
        })
    } catch (error) {
        console.log(error);
        //Cast erro || object id
        if (error.name === "CastError") {
            return res.status(500).send({
                success: false,
                message: "invalid id",
            });
        }
        res.status(500).send({
            success: false,
            message: "Error in get single category api",
        });
    }
}

//update category
export const updateCategoryController = async (req, res) => {
    try {
        //find category
        const category = await categoryModel.findById(req.params.id)
        //validation
        if (!category) {
            return res.status(404).send({
                success: false,
                message: "Category not found"
            })
        }
        //get new category
        const { updatedCategory } = req.body;
        //find product with this category id
        const products = await productModel.find({ category: category._id })
        //update products category
        for (let i = 0; i < products.length; i++) {
            const product = products[i]
            product.category = updatedCategory;
            await product.save()
        }
        if (updatedCategory) category.category = updatedCategory;
        //save category
        await category.save();
        res.status(200).send({
            success: true,
            message: "Category updated successfully"
        })
    } catch (error) {
        console.log(error);
        //Cast erro || object id
        if (error.name === "CastError") {
            return res.status(500).send({
                success: false,
                message: "invalid id",
            });
        }
        res.status(500).send({
            success: false,
            message: "Error in update category api",
        });
    }
}
