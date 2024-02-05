import mongoose from "mongoose";

//review model
const reviewSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            requried: [true, "name is required"],
        },
        rating: {
            type: Number,
            default: 0,
        },
        comment: {
            type: String,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            requried: [true, "user requried"],
        },
    },
    { timestamps: true }
);

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "product name is required"],
        },
        description: {
            type: String,
            required: [true, "product description is required"],
        },
        price: {
            type: Number,
            reuired: [true, "product price is required"],
        },
        stock: {
            type: Number,
            required: [true, "product stock is required"],
        },
        // quantity: {
        //     type: Number,
        //     required: [true, 'product quantity is required']
        // },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
        },
        images: [
            {
                public_id: String,
                url: String,
            },
        ],
        reviews: [reviewSchema],
        rating: {
            type: Number,
            default: 0,
        },
        numReviews: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

export const productModel = mongoose.model("Products", productSchema);
export default productModel;
