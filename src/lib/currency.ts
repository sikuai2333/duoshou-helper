const cnyFormatter = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "CNY",
  maximumFractionDigits: 0,
});

export function formatCurrency(amount: number) {
  return cnyFormatter.format(amount);
}
