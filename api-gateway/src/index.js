const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const app = express();

// 1. Bảo mật Header & CORS
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(",") || "*" }));

// 2. Giới hạn tần suất gọi API (Rate Limiting: 100 requests / 15 phút / IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút!",
  },
});
app.use(limiter);

// 3. Health check của Gateway
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    gateway: true,
    service: process.env.SERVICE_NAME,
    uptime: process.uptime(),
  });
});

// 4. Reverse Proxy sang Product Service (Port 3001)
app.use(
  createProxyMiddleware({
    target: process.env.PRODUCT_SERVICE_URL,
    changeOrigin: true,
    pathFilter: "/api/products",
    on: {
      error: (err, req, res) => {
        console.error("Lỗi kết nối Product Service:", err.message);
        res.status(503).json({
          success: false,
          message: "Product Service hiện không khả dụng",
        });
      },
    },
  })
);

// 5. Reverse Proxy sang Order Service (Port 3002)
app.use(
  createProxyMiddleware({
    target: process.env.ORDER_SERVICE_URL,
    changeOrigin: true,
    pathFilter: "/api/orders",
    on: {
      error: (err, req, res) => {
        console.error("Lỗi kết nối Order Service:", err.message);
        res.status(503).json({
          success: false,
          message: "Order Service hiện không khả dụng",
        });
      },
    },
  })
);

// 6. Khởi động API Gateway
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(` API Gateway đang chạy trên cổng ${PORT}`);
  console.log(`- /api/products -> ${process.env.PRODUCT_SERVICE_URL}`);
  console.log(`- /api/orders   -> ${process.env.ORDER_SERVICE_URL}`);
});