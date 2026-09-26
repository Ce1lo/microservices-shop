const Order = require("../models/Order");

// ─────────────────────────────────────────────────────────────
// 1. POST /api/orders — Tạo đơn hàng mới
// ─────────────────────────────────────────────────────────────
const createOrder = async (req, res, next) => {
  try {
    const {
      customerId,
      customerName,
      customerEmail,
      items,
      shippingAddress,
      note,
    } = req.body;

    // Tự động tính subtotal từng item và tính tổng tiền toàn đơn
    const processedItems = items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    }));

    const totalAmount = processedItems.reduce((sum, item) => sum + item.subtotal, 0);

    const order = await Order.create({
      customerId,
      customerName,
      customerEmail,
      items: processedItems,
      totalAmount,
      shippingAddress,
      note,
    });

    res.status(201).json({
      success: true,
      message: "Tạo đơn hàng thành công",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// 2. GET /api/orders/customer/:customerId — Lấy danh sách đơn theo khách hàng
// ─────────────────────────────────────────────────────────────
const getOrdersByCustomer = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Xây dựng điều kiện lọc
    const filter = { customerId: parseInt(customerId) };
    if (status) {
      filter.status = status;
    }

    // Chạy song song truy vấn dữ liệu và đếm tổng số bản ghi
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// 3. GET /api/orders/:id — Lấy chi tiết đơn hàng theo ID
// ─────────────────────────────────────────────────────────────
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// 4. PUT /api/orders/:id/status — Cập nhật trạng thái đơn hàng
// ─────────────────────────────────────────────────────────────
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true } // Trả về bản ghi mới sau khi cập nhật và kích hoạt validation
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng để cập nhật",
      });
    }

    res.json({
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrdersByCustomer,
  getOrderById,
  updateOrderStatus,
};