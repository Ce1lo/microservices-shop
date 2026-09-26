const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ERROR:`, err);

  // 1. Lỗi CastError của Mongoose (thường do truyền sai định dạng ObjectId trong URL)
  if (err.name === "CastError") {
    return res.status(404).json({
      success: false,
      message: `Không tìm thấy bản ghi với mã định danh '${err.value}'`
    });
  }

  // 2. Lỗi validation của Schema Mongoose
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(422).json({
      success: false,
      message: "Lỗi kiểm tra dữ liệu từ CSDL",
      errors: messages
    });
  }

  // 3. Lỗi trùng lặp khoá duy nhất (Unique index: ví dụ trùng orderCode)
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Dữ liệu bị trùng lặp khoá duy nhất",
      field: Object.keys(err.keyValue)
    });
  }

  // 4. Lỗi hệ thống chung (500)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Lỗi máy chủ nội bộ",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
};

module.exports = errorHandler;