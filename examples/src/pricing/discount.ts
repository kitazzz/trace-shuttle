interface User {
  tier: string;
  role: string;
}

interface Order {
  items: { price: number }[];
}

interface DiscountResult {
  rate: number;
  reason: string;
}

export function calculateDiscount(user: User, order: Order): DiscountResult {
  const rates: DiscountResult[] = [];

  /* @impl SPEC-DISCOUNT-PREMIUM */
  if (user.tier === "premium") {
    rates.push({ rate: 0.1, reason: "premium discount" });
  }

  /* @impl SPEC-DISCOUNT-BULK */
  if (order.items.length >= 10) {
    rates.push({ rate: 0.05, reason: "bulk discount" });
  }

  /* @impl SPEC-DISCOUNT-STACK */
  /* @decision SPEC-DISCOUNT-STACK Use max rate to prevent stacking */
  if (rates.length > 1) {
    return rates.reduce((best, r) => (r.rate > best.rate ? r : best));
  }

  return rates[0] ?? { rate: 0, reason: "no discount" };
}
