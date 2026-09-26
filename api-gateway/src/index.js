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

const productServiceUrl = process.env.PRODUCT_SERVICE_URL?.replace(/\/+$/, "") || "http://localhost:3001";
const orderServiceUrl = process.env.ORDER_SERVICE_URL?.replace(/\/+$/, "") || "http://localhost:3002";

// 3. Root & Documentation Routes
app.get("/", (req, res) => {
  res.json({
    message: "Microservices Shop API Gateway is running!",
    gateway: true,
    services: {
      products: `${productServiceUrl}/api/products`,
      orders: `${orderServiceUrl}/api/orders`,
      productSwagger: `${productServiceUrl}/api-docs`,
      orderSwagger: `${orderServiceUrl}/api-docs`,
    },
    routes: [
      { path: "/health", description: "Gateway health check" },
      { path: "/api-docs", description: "Redirect to Product Service Swagger UI" },
      { path: "/api-docs/orders", description: "Redirect to Order Service Swagger UI" },
      { path: "/api/products", description: "Product Service proxy endpoints" },
      { path: "/api/orders", description: "Order Service proxy endpoints" },
    ],
  });
});

// Redirect /api-docs to Product Service Swagger
app.get("/api-docs", (req, res) => {
  res.redirect(`${productServiceUrl}/api-docs`);
});

// Redirect /api-docs/orders to Order Service Swagger
app.get("/api-docs/orders", (req, res) => {
  res.redirect(`${orderServiceUrl}/api-docs`);
});

// Health check của Gateway
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    gateway: true,
    service: process.env.SERVICE_NAME || "api-gateway",
    uptime: process.uptime(),
  });
});

// 4. Reverse Proxy sang Product Service (Port 3001)
app.use(
  createProxyMiddleware({
    target: productServiceUrl,
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
    target: orderServiceUrl,
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
  console.log(`- /api/products -> ${productServiceUrl}`);
  console.log(`- /api/orders   -> ${orderServiceUrl}`);
});