import type { OrderStatus } from "@prisma/client";

/**
 * Explicit transition table for order fulfillment. Any transition not listed
 * here is rejected — this is the single source of truth for what state
 * changes are legal, used both by the admin status-update endpoint and by
 * customer-facing cancellation.
 */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export class InvalidOrderTransitionError extends Error {
  constructor(
    public readonly from: OrderStatus,
    public readonly to: OrderStatus,
  ) {
    super(`Cannot move order from ${from} to ${to}`);
    this.name = "InvalidOrderTransitionError";
  }
}

export function canTransitionOrder(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function assertValidOrderTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransitionOrder(from, to)) {
    throw new InvalidOrderTransitionError(from, to);
  }
}

export function nextOrderStatuses(from: OrderStatus): OrderStatus[] {
  return TRANSITIONS[from];
}

export function isTerminalOrderStatus(status: OrderStatus): boolean {
  return TRANSITIONS[status].length === 0;
}
