export const parseExcelDate = (value) => {
  if (!value) return null;

  if (typeof value === "number") {
    return new Date((value - 25569) * 86400 * 1000).toISOString().slice(0, 10);
  }

  if (value instanceof Date && !isNaN(value)) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "string") {
    const d = new Date(value);
    if (!isNaN(d)) return d.toISOString().slice(0, 10);
  }

  return null;
};

export const normalizeKey = (key) =>
  key.toString().trim().toUpperCase().replace(/\s+/g, "_").replace(/[^A-Z0-9_]/g, "");
