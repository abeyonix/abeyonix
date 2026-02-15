// src/utils/formatPrice.ts
export const formatPrice = (value: number) => {
  return new Intl.NumberFormat('en-IN').format(value);
};
