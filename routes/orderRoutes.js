import express from 'express';
import { isAdmin, isAuth } from '../middlewares/authMiddleware.js';
import { changeOrderStatusController, createOrderController, getAllOrdersController, getMyOrdersController, paymentsController, singleOrdersDetailsController } from '../controllers/orderController.js';



const router = express.Router();

//routes
//* =================== ORDERS ROUTES ====================
//create category
router.post('/create', isAuth, createOrderController)

//get all orders
router.get('/my-orders', isAuth, getMyOrdersController)

//get single order detatils
router.get('/my-orders/:id', isAuth, singleOrdersDetailsController)

//accept payments
router.post('/payments', isAuth, paymentsController)


//! ADMIN Part
//get all orders
router.get("/admin/get-all-orders", isAuth, isAdmin, getAllOrdersController)

//change order status
router.put('/admin/order/:id', isAuth, isAdmin, changeOrderStatusController)

export default router;
