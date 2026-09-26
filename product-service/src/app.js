const express = require("express"); 
const cors    = require("cors"); 
const helmet  = require("helmet"); 
const morgan  = require("morgan"); 
const swaggerUi   = require("swagger-ui-express"); 
const swaggerSpec = require("./swagger/swagger"); 
const productRoutes = require("./routes/productRoutes"); 
const errorHandler  = require("./middleware/errorHandler"); 
require("dotenv").config(); 

const app = express(); 

// ─── Security & Logging Middleware ─────────── 
app.use(helmet());     // Bảo mật HTTP headers 
app.use(cors()); 
app.use(morgan("dev")); // Log requests 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// ─── Swagger UI ────────────────────────────── 
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { 
  swaggerOptions: { persistAuthorization: true }, 
  customSiteTitle: "Product Service API Docs", 
})); 

// Export spec dạng JSON để tích hợp với API Gateway 
app.get("/api-docs.json", (req, res) => res.json(swaggerSpec)); 

// ─── Routes ────────────────────────────────── 
app.get("/health", (req, res) => res.json({ 
  status: "ok", service: process.env.SERVICE_NAME, uptime: process.uptime() 
})); 
app.use("/api/products", productRoutes); 

// ─── Global Error Handler (ĐẶT CUỐI CÙNG) ── 
app.use(errorHandler); 

module.exports = app;

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Product Service running on port ${PORT}`);
  console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
});