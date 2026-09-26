const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]); // Buộc Node.js dùng DNS Google để phân giải MongoDB SRV

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swagger");
const orderRoutes = require("./routes/orderRoutes");
const errorHandler = require("./middleware/errorHandler");
require("dotenv").config();

const app = express();

// ─── 1. Security & Logging Middleware ───────────
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── 2. Swagger UI Documentation ────────────────
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: "Order Service API Docs",
  })
);

// Endpoint xuất file OpenAPI spec JSON (hỗ trợ tích hợp API Gateway)
app.get("/api-docs.json", (req, res) => res.json(swaggerSpec));

// ─── 3. Routes ──────────────────────────────────
// Health check route
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: process.env.SERVICE_NAME || "order-service",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    uptime: process.uptime(),
  });
});

// Main routes
app.use("/api/orders", orderRoutes);

// ─── 4. Global Error Handler (Đặt ở cuối cùng) ──
app.use(errorHandler);

// ─── 5. Database Connection & Server Startup ────
const PORT = process.env.PORT || 3002;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("LỖI: Chưa cấu hình MONGODB_URI trong file .env!");
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log(" Kết nối MongoDB thành công!");
    app.listen(PORT, () => {
      console.log(` Order Service đang chạy trên cổng ${PORT}`);
      console.log(` Swagger Docs: http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    console.error(" Kết nối MongoDB thất bại:", err.message);
    process.exit(1);
  });

module.exports = app;