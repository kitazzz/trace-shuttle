interface LoyaltySnapshot {
  eligibleMonths: number;
}

export function isVip(snapshot: LoyaltySnapshot): boolean {
  /* @trace[impl spec=SPEC-LOYALTY-VIP-UPGRADE] */
  return snapshot.eligibleMonths >= 12;
}
