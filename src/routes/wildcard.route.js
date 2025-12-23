function notFound(req, res) {
  return res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl,
    method: req.method,
  });
}

module.exports = notFound;
