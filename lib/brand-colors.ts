/** BNC logo palette — green, yellow, red, orange from /public/logo.png */
export const BNC = {
  green: "#00A54F",
  yellow: "#FFF200",
  red: "#ED1C24",
  orange: "#DE8633",
} as const;

export const BRAND_GRADIENT = `linear-gradient(90deg, ${BNC.green}, ${BNC.yellow}, ${BNC.red}, ${BNC.orange})`;

export const BRAND_COLORS = [BNC.green, BNC.yellow, BNC.red, BNC.orange] as const;
