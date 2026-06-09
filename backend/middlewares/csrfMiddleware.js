export const csrfProtect = (req, res, next) => {
  const safeMethods = ["GET", "HEAD", "OPTIONS"];

  if (safeMethods.includes(req.method)) {
    return next();
  }

  const headerToken = req.headers["x-xsrf-token"];
  const cookieToken = req.cookies?.["XSRF-TOKEN"];

  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return res.status(403).json({
      success: false,
      message: "Token CSRF inválido",
    });
  }

  next();
};
