# Pricing System

<!-- @trace[requirement id=REQ-PRICING category=pricing] -->

## Discount Rules

<!-- @trace[spec id=SPEC-DISCOUNT-PREMIUM req=REQ-PRICING] -->

Premium-tier users receive a 10% discount on all orders.

<!-- @trace[spec id=SPEC-DISCOUNT-BULK req=REQ-PRICING] -->

Orders of 10 or more items receive a 5% bulk discount.

<!-- @trace[spec id=SPEC-DISCOUNT-STACK req=REQ-PRICING] -->

Only the highest applicable discount is applied; discounts do not stack.
