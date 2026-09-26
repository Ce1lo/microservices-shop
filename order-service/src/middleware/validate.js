const { body, validationResult } = require("express-validator");

// Hàm bắt lỗi và trả về response 422 nếu có trường sai quy định
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Dữ liệu đơn hàng không hợp lệ",
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

// Bộ quy tắc kiểm tra khi tạo đơn hàng mới
const orderValidation = [
  body("customerId")
    .notEmpty().withMessage("customerId là bắt buộc")
    .isInt({ min: 1 }).withMessage("customerId phải là số nguyên dương"),
  body("customerName")
    .trim().notEmpty().withMessage("Tên khách hàng không được rỗng"),
  body("customerEmail")
    .isEmail().withMessage("Email khách hàng không đúng định dạng"),
  body("items")
    .isArray({ min: 1 }).withMessage("items phải là mảng có ít nhất 1 sản phẩm"),
  body("items.*.productId")
    .isInt({ min: 1 }).withMessage("productId của từng món phải là số nguyên dương"),
  body("items.*.productName")
    .trim().notEmpty().withMessage("productName không được rỗng"),
  body("items.*.price")
    .isFloat({ min: 0 }).withMessage("Giá sản phẩm phải là số không âm"),
  body("items.*.quantity")
    .isInt({ min: 1 }).withMessage("Số lượng sản phẩm phải >= 1"),
  handleValidation,
];

// Bộ quy tắc kiểm tra khi cập nhật trạng thái đơn hàng
const updateStatusValidation = [
  body("status")
    .notEmpty().withMessage("status là bắt buộc")
    .isIn(["pending", "confirmed", "shipping", "delivered", "cancelled"])
    .withMessage("Trạng thái phải là: pending, confirmed, shipping, delivered hoặc cancelled"),
  handleValidation,
];

module.exports = { orderValidation, updateStatusValidation };