interface BillingUser {
  tier: "basic" | "premium";
}

interface BillingOrder {
  itemCount: number;
}

export function getBillingDiscount(
  user: BillingUser,
  order: BillingOrder,
): number {
  /* @trace[impl spec=SPEC-BILLING-PREMIUM] */
  if (user.tier === "premium") {
    return 0.1;
  }

  /* @trace[impl spec=SPEC-BILLING-BULK] */
  if (order.itemCount >= 10) {
    return 0.05;
  }

  return 0;
}
