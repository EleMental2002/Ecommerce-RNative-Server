import cloudinary from 'cloudinary';
import productModel from "../models/productModel.js";
import { getDataUri } from "../utils/features.js";


//GET ALL PRODUCTS
export const getAllProductsController = async (req, res) => {
    const { keyword, category } = req.query;
    try {
        const products = await productModel.find({
            name: {
                $regex: keyword ? keyword : "",
                $options: "i",

            },
            // category: category ? category : undefined
        }).populate("category")
        res
            .status(200)
            .send({
                success: true,
                message: "all products fetched successfully",
                totalProducts: products.length,
                products,
            });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in get all products api",
        });
    }
};

//get top products
export const getTopProductsController = async (req, res) => {
    try {
        const products = await productModel.find({})
            .sort({ rating: -1 })
            .limit(3)
        res.status(200).send({
            success: true,
            message: "Top 3 products",
            products
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in get top products api",
        });
    }
}

//Get single product
export const getSingleProductController = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id)
        //validation
        if (!product) {
            return res.status(404).send({ succeess: false, message: "Product not found" });
        }
        res.status(200).send({ succeess: true, message: "Product successfully found", product, });
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
            message: "Error in get single product api",
        });
    }
};

//Create product
export const createProductController = async (req, res) => {
    try {
        const { name, description, price, category, stock } = req.body;
        //validation
        // if (!name || !description || !price || !stock) {
        //     return res.status(500).send({
        //         succeess: false,
        //         message: "Please Provide all fields"
        //     })
        // }
        if (!req.file) {
            return res.status(500).send({
                succeess: false,
                message: "Please provide product images"
            })
        }
        const file = getDataUri(req.file);
        const cdb = await cloudinary.v2.uploader.upload(file.content)
        const image = {
            public_id: cdb.public_id,
            url: cdb.secure_url
        }



        await productModel.create({
            name, description, price, category, stock, images: [image]
        })

        res.status(201).send({
            success: true,
            message: "Product created successfully"
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in creating product api",
            error
        });
    }
};

//update product
export const updateProductController = async (req, res) => {
    try {
        //find product
        const product = await productModel.findById(req.params.id);
        //validation
        if (!product) {
            return res.status(404).send({
                success: false,
                message: "Product not found",
            })
        }
        const { name, description, price, stock, category } = req.body;
        //validate and update
        if (name) product.name = name;
        if (description) product.description = description;
        if (price) product.price = price;
        if (stock) product.stock = stock;
        if (category) product.category = category;

        await product.save();
        res.status(200).send({
            success: true,
            message: "Product details updated successfully"
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
            message: "Error in update product api",
            error
        });
    }
};

//Update product image
export const updateProductImageController = async (req, res) => {
    try {
        //find product
        const product = await productModel.findById(req.params.id);
        //validation
        if (!product) {
            return res.status(404).send({
                success: false,
                message: "Product not found"
            })
        }
        //check file
        if (!req.file) {
            return res.status(404).send({
                success: false,
                message: "Product image not found"
            });
        }
        const file = getDataUri(req.file)
        const cdb = await cloudinary.v2.uploader.upload(file.content)
        const image = {
            public_id: cdb.public_id,
            url: cdb.secure_url,
        }
        // save
        product.images.push(image);
        await product.save();
        res.status(200).send({
            succeess: true,
            message: "Product image updated successfully"
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
            message: "Error in update product image api",
            error
        });
    }
}

//Delete product image
export const deleteProductImageController = async (req, res) => {
    try {
        //find product
        const product = await productModel.findById(req.params.id);
        //validation
        if (!product) {
            return res.status(404).send({
                succeess: false,
                message: "Product not found"
            })
        }
        //image id find
        const id = req.query.id;
        if (!id) {
            return res.status(404).send({
                success: false,
                message: "Product image not found"
            })
        }
        let isExist = -1;
        product.images.forEach((item, index) => {
            if (item._id.toString() === id.toString()) isExist = index;
        })
        if (isExist < 0) {
            return res.status(404).send({
                succeess: false,
                message: "Image not found"
            });
        }

        //Delete product image
        await cloudinary.v2.uploader.destroy(product.images[isExist].public_id)
        product.images.splice(isExist, 1);
        await product.save();
        return res.status(200).send({
            succeess: true,
            message: "Product Image Deleted Successfully"
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
            message: "Error in delete product image api",
            error
        });
    }
}

export const deleteProductController = async (req, res) => {
    try {
        //find product 
        const product = await productModel.findById(req.params.id);
        //validation
        if (!product) {
            return res.status(404).send({
                success: false,
                message: "product not found"
            })
        }
        //find and delete image cloudinary
        for (let index = 0; index < product.images.length; index++) {
            await cloudinary.v2.uploader.destroy(product.images[index].public_id)
        }
        await product.deleteOne();
        res.status(200).send({
            succeess: true,
            message: "Product deleted successfully"
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
            message: "Error in delete product api",
            error
        });
    }
}

//create product review and comment
export const productReviewController = async (req, res) => {
    try {
        const { comment, rating } = req.body;
        //find product
        const product = await productModel.findById(req.params.id);
        // checking user previous comments and reviews
        const alreadyReviewed = product.reviews.find((r) => r.user.toString() === req.user._id.toString())
        if (alreadyReviewed) {
            return res.status(400).send({
                success: false,
                message: "Product already reviewed"
            })
        }
        //review object
        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user._id
        }
        //passing review object to reviews array
        product.reviews.push(review)
        //Number of reviews
        product.numReviews = product.reviews.length
        product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length
        //save
        await product.save()
        res.status(200).send({
            success: true,
            messag: "Review Added"
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
            message: "Error in review comment api",
            error
        });
    }
}