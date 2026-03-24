interface Order {
  shipped: boolean;
  amount: number;
}

export function runOrderCommand(order: Order, command: string): string {
  /* @trace[impl spec=SPEC-ORDER-CANCEL] */
  if (command === "cancel" && !order.shipped) {
    return "canceled";
  }

  /* @trace[impl spec=SPEC-NOT-DEFINED] */
  if (command === "promo-refund" && order.amount > 1000) {
    return "manual-promo-refund";
  }

  /* @trace[needs-review] */
  if (command === "escalate") {
    return "review";
  }

  return "ignored";
}
