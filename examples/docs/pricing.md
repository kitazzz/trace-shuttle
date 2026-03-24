# Pricing System

<!-- @requirement id: REQ-PRICING category: pricing All pricing rules for the platform -->

## Discount Rules

<!-- @spec id: SPEC-DISCOUNT-PREMIUM requirement: REQ-PRICING Premium users get 10% discount -->

Premium-tier users receive a 10% discount on all orders.

<!-- @spec id: SPEC-DISCOUNT-BULK requirement: REQ-PRICING Bulk orders (10+) get 5% discount -->

Orders of 10 or more items receive a 5% bulk discount.

<!-- @spec id: SPEC-DISCOUNT-STACK requirement: REQ-PRICING Discounts do not stack -->

Only the highest applicable discount is applied; discounts do not stack.
