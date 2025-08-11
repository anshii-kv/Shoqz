const errorHandler = (err, req, res, next) => {
    console.log("Erdfdslfds,",err)
  console.error("Error:", err.stack || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";
    console.log('dsfdfsd')
  res.status(statusCode).render("user/page-404", {
    statusCode,
    message,
  });
};

module.exports = errorHandler;