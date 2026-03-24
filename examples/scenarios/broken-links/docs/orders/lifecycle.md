# Order Lifecycle

<!-- @trace[requirement id=REQ-ORDERS-LIFECYCLE category=orders] -->

## Core Actions

<!-- @trace[spec id=SPEC-ORDER-CANCEL req=REQ-ORDERS-LIFECYCLE] -->

Orders can be canceled before shipment.

<!-- @trace[spec id=SPEC-ORDER-REFUND req=REQ-ORDERS-MISSING] -->

Refunds should be processed after payment capture is reversed.
