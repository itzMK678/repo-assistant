export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
};

export const errorHandler = (error, req, res, next) => {
  console.error("Server error:", error);

  const statusCode =
    error.statusCode ||
    error.status ||
    error.response?.status ||
    500;

  const message =
    error.response?.data?.message ||
    error.message ||
    "Internal server error";

  res.status(statusCode).json({
    success: false,
    message
  });
};