const mongoose = require("mongoose");

// 1. Sub-schema cho từng sản phẩm trong đơn hàng
// Lưu snapshot thông tin (tên, giá) tại thời điểm mua phòng khi Product Service thay đổi giá sau này
const OrderItemSchema = new mongoose.Schema({
  productId:   { type: Number, required: true },   // ID sản phẩm từ Product Service
  productName: { type: String, required: true },   // Tên sản phẩm tại thời điểm mua
  price:       { type: Number, required: true },   // Giá bán tại thời điểm mua
  quantity:    { type: Number, required: true, min: [1, "Số lượng phải ít nhất là 1"] },
  subtotal:    { type: Number, required: true },   // price * quantity
}, { _id: false }); // Không cần tạo _id riêng cho từng item con

// 2. Schema chính của Đơn hàng
const OrderSchema = new mongoose.Schema({
  orderCode:     { type: String, unique: true },   // Tự sinh: ORD-YYYYMMDD-0001
  customerId:    { type: Number, required: [true, "Customer ID là bắt buộc"] },
  customerName:  { type: String, required: [true, "Tên khách hàng là bắt buộc"] },
  customerEmail: { type: String, required: [true, "Email là bắt buộc"] },
  items:         { 
    type: [OrderItemSchema], 
    validate: [arr => arr.length > 0, "Đơn hàng phải có ít nhất 1 sản phẩm"] 
  },
  totalAmount:   { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "confirmed", "shipping", "delivered", "cancelled"],
    default: "pending",
  },
  shippingAddress: {
    street:   String,
    city:     String,
    district: String,
  },
  note: String,
}, {
  timestamps: true,  // Tự động sinh createdAt và updatedAt
  versionKey: false, // Bỏ trường __v mặc định của MongoDB
});

// 3. Pre-save hook: Tự sinh mã đơn hàng trước khi lưu vào DB (nếu chưa có)
OrderSchema.pre("save", async function (next) {
  if (!this.orderCode) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // Ví dụ: 20260926
    const count = await mongoose.model("Order").countDocuments();
    this.orderCode = `ORD-${date}-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

// 4. Virtual field: Tính tổng số lượng sản phẩm (không lưu vào DB, tự tính khi gọi)
OrderSchema.virtual("totalItems").get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// 5. Index để tăng tốc độ truy vấn
OrderSchema.index({ customerId: 1, createdAt: -1 }); // Tìm kiếm đơn của khách hàng theo thời gian
OrderSchema.index({ status: 1 });                    // Lọc theo trạng thái đơn

module.exports = mongoose.model("Order", OrderSchema);