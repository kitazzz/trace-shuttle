interface ShippingSelectionInput {
  rush: boolean;
  country: string;
}

export function chooseShippingMode(input: ShippingSelectionInput): string {
  /* @trace[impl spec=SPEC-CHECKOUT-EXPRESS] */
  if (input.rush && input.country === "JP") {
    return "express";
  }

  /* @trace[needs-review] */
  if (input.country !== "JP") {
    return "manual-review";
  }

  return "standard";
}
