import orderModel from '../models/orderModel.js';
import productModel from '../models/productModel.js';
import { stripe } from '../server.js';
// create orders
export const createOrderController = async (req, res) => {
    try {
        const {
            shippingInfo,
            orderItems,
            paymentMethod,
            paymentInfo,
            itemPrice,
            tax,
            shippingCharges,
            totalAmount,
        } = req.body;

        //validation
        // if (!shippingInfo || !orderItems || !paymentMethod ||
        //     !paymentInfo || !itemPrice || !tax || !shippingCharges || !totalAmount) {
        //     return res.status(404).send({
        //         success: false,
        //         message: "please provide required fields"
        //     });
        // }
        await orderModel.create({
            user: req.user._id,
            shippingInfo,
            orderItems,
            paymentMethod,
            paymentInfo,
            itemPrice,
            tax,
            shippingCharges,
            totalAmount,
        })
        //stock update
        for (let i = 0; i < orderItems.length; i++) {
            //find product
            const product = await productModel.findById(orderItems[i].product)
            product.stock -= orderItems[i].quantity
            await product.save()
        }
        res.status(201).send({
            success: true,
            message: "Order Placed Successfully"
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in create order API",
        });
    }
};


//get all orders - my ordes
export const getMyOrdersController = async (req, res) => {
    try {
        //find orders
        const orders = await orderModel.find({ user: req.user._id })
        //validation
        if (!orders) {
            return res.status(404).send({
                success: false,
                message: "No orders found"
            })
        }
        res.status(200).send({
            success: true,
            message: "Your orders data",
            totalOrders: orders.length,
            orders
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in my orders API",
        });
    }
}

//get single order info
export const singleOrdersDetailsController = async (req, res) => {
    try {
        //find orders
        const order = await orderModel.findById(req.params.id)
        //validation
        if (!order) {
            return res.status(404).send({
                success: false,
                message: "no order found"
            })
        }
        res.status(200).send({
            success: true,
            message: "Your order has been fetched successfully",
            order
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
            message: "Error in get single order api",
        });
    }
};

//Accept payments
export const paymentsController = async (req, res) => {
    try {
        //get amount
        const { totalAmount } = req.body;
        //validation
        if (!totalAmount) {
            return res.status(404).send({
                success: false,
                message: "Total amount is required"
            })
        }
        const { client_secret } = await stripe.paymentIntents.create({
            amount: Number(totalAmount * 100),
            currency: 'usd'
        })
        res.status(200).send({
            success: true,
            client_secret
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in get single order api",
        });
    }
}

//! ==============ADMIN SECTION======================
//get all orders
export const getAllOrdersController = async (req, res) => {
    try {
        const orders = await orderModel.find({})
        res.status(200).send({
            success: true,
            message: "All orders data",
            totalOrders: orders.length,
            orders
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in get all orders api",
        });
    }
}

//change order status
export const changeOrderStatusController = async (req, res) => {
    try {
        //find order
        const order = await orderModel.findById(req.params.id)
        //validaton
        if (!order) {
            return res.status(404).send({
                success: false,
                message: "order not found"
            })
        }
        if (order.orderStatus === "processing") order.orderStatus = "shipped"
        else if (order.orderStatus === "shipped") {
            order.orderStatus = "delivered"
            order.deliveredAt = Date.now()
        }
        else {
            return res.status(500).send({
                success: false,
                message: "Order has already been delivered"
            })
        }
        await order.save()
        res.status(200).send({
            success: true,
            message: "Order status updated"
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
            message: "Error in change order status api",
        });
    }
}