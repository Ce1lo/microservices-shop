const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Order Service API",
      version: "1.0.0",
      description: "API quản lý đơn hàng sử dụng Express & MongoDB — Lab 2a Microservices",
      contact: { name: "Dev Team", email: "dev@example.com" }
    },
    servers: [
      { url: "http://localhost:3002", description: "Development Server" }
    ],
    components: {
      schemas: {
        OrderItem: {
          type: "object",
          required: ["productId", "productName", "price", "quantity"],
          properties: {
            productId:   { type: "integer", example: 1 },
            productName: { type: "string",  example: "iPhone 15 Pro" },
            price:       { type: "number",  example: 27990000 },
            quantity:    { type: "integer", example: 2, minimum: 1 },
            subtotal:    { type: "number",  example: 55980000 }
          }
        },
        Order: {
          type: "object",
          properties: {
            _id:          { type: "string",  example: "650c1f1e2f8b2a1a8c9e0001" },
            orderCode:    { type: "string",  example: "ORD-20260926-0001" },
            customerId:   { type: "integer", example: 101 },
            customerName: { type: "string",  example: "Nguyen Van A" },
            customerEmail:{ type: "string",  example: "vana@example.com" },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/OrderItem" }
            },
            totalAmount:  { type: "number",  example: 55980000 },
            status: {
              type: "string",
              enum: ["pending", "confirmed", "shipping", "delivered", "cancelled"],
              example: "pending"
            },
            shippingAddress: {
              type: "object",
              properties: {
                street:   { type: "string", example: "123 Nguyen Trai" },
                district: { type: "string", example: "Quan 5" },
                city:     { type: "string", example: "TP Ho Chi Minh" }
              }
            },
            note:      { type: "string", example: "Giao trong giờ hành chính" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        }
      }
    }
  },
  apis: ["./src/routes/*.js"] // Quét tất cả annotations trong thư mục routes
};

module.exports = swaggerJsdoc(options);