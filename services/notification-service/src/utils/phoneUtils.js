export const formatPhone = (number) => {
  if (!number) return number;

  // already correct E.164
  if (number.startsWith("+")) return number;

  // Sri Lanka local format (0XXXXXXXXX → +94XXXXXXXXX)
  if (number.startsWith("0")) {
    return "+94" + number.slice(1);
  }

  return number;
};