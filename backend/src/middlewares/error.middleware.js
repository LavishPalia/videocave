const errorHandler = (err, req, res, next) => {
  console.log(err.stack);

  return res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || "Internal server error",
    errors: err.errors || [],
  });
};

export default errorHandler;
