import crypto from "crypto";

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET no definido");
  }
  return secret;
};

export const createCsrfToken = () => crypto.randomBytes(32).toString("hex");

export const signCsrfToken = (token) =>
  crypto.createHmac("sha256", getSecret()).update(String(token)).digest("hex");

export const safeEqual = (a, b) => {
  const left = Buffer.from(String(a || ""));
  const right = Buffer.from(String(b || ""));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
};
