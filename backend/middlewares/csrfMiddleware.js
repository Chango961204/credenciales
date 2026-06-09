import { safeEqual, signCsrfToken } from "../utils/csrf.js";

export const csrfProtect = (req, res, next) => {
  const safeMethods = ["GET", "HEAD", "OPTIONS"];

  if (safeMethods.includes(req.method)) {
    return next();
  }

  const headerToken = req.headers["x-xsrf-token"];
  const cookieToken = req.cookies?.["XSRF-TOKEN"];
  const signedToken = req.cookies?.["XSRF-SIGNATURE"];

  if (
    !headerToken ||
    !cookieToken ||
    !signedToken ||
    !safeEqual(headerToken, cookieToken) ||
    !safeEqual(signedToken, signCsrfToken(headerToken))
  ) {
    return res.status(403).json({
      success: false,
      message: "Token CSRF invalido",
    });
  }

  next();
};
