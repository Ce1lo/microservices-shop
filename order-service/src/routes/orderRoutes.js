const router = require("express").Router();
const {
  createOrder,
  getOrdersByCustomer,
  getOrderById,
  updateOrderStatus
} = require("../controllers/orderController");
const { orderValidation, updateStatusValidation } = require("../middleware/validate");

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Quản lý đơn hàng (MongoDB)
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Tạo đơn hàng mới
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - customerName
 *               - customerEmail
 *               - items
 *             properties:
 *               customerId:
 *                 type: integer
 *                 example: 1
 *               customerName:
 *                 type: string
 *                 example: Tran Van B
 *               customerEmail:
 *                 type: string
 *                 example: tranvanb@example.com
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [productId, productName, price, quantity]
 *                   properties:
 *                     productId:   { type: integer, example: 1 }
 *                     productName: { type: string, example: "iPhone 15 Pro" }
 *                     price:       { type: number, example: 27990000 }
 *                     quantity:    { type: integer, example: 1 }
 *               shippingAddress:
 *                 type: object
 *                 properties:
 *                   street:   { type: string, example: "456 Le Loi" }
 *                   district: { type: string, example: "Quan 1" }
 *                   city:     { type: string, example: "TP HCM" }
 *               note:
 *                 type: string
 *                 example: Đóng gói cẩn thận
 *     responses:
 *       201:
 *         description: Đơn hàng tạo thành công (tự sinh orderCode và totalAmount)
 *       422:
 *         description: Dữ liệu không hợp lệ
 */
router.post("/", orderValidation, createOrder);

/**
 * @swagger
 * /api/orders/customer/{customerId}:
 *   get:
 *     summary: Lấy danh sách đơn hàng theo khách hàng (có phân trang & lọc)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema: { type: integer }
 *         description: Mã định danh của khách hàng
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Số thứ tự trang
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Số đơn hàng mỗi trang
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, shipping, delivered, cancelled]
 *         description: Lọc theo trạng thái đơn hàng
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng kèm thông tin phân trang
 */
router.get("/customer/:customerId", getOrdersByCustomer);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Lấy chi tiết đơn hàng theo MongoDB ID (_id)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: MongoDB ObjectId của đơn hàng
 *     responses:
 *       200:
 *         description: Chi tiết đơn hàng
 *       404:
 *         description: Không tìm thấy đơn hàng
 */
router.get("/:id", getOrderById);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Cập nhật trạng thái đơn hàng
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, shipping, delivered, cancelled]
 *                 example: confirmed
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 *       404:
 *         description: Không tìm thấy đơn hàng
 *       422:
 *         description: Trạng thái không hợp lệ
 */
router.put("/:id/status", updateStatusValidation, updateOrderStatus);

module.exports = router;