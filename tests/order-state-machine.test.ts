import { describe, expect, it } from "vitest";
import {
  InvalidOrderTransitionError,
  assertValidOrderTransition,
  canTransitionOrder,
  isTerminalOrderStatus,
} from "@/lib/order-state-machine";

describe("order state machine", () => {
  it("allows the happy path pickup flow", () => {
    expect(canTransitionOrder("PENDING", "PAID")).toBe(true);
    expect(canTransitionOrder("PAID", "PREPARING")).toBe(true);
    expect(canTransitionOrder("PREPARING", "READY")).toBe(true);
    expect(canTransitionOrder("READY", "COMPLETED")).toBe(true);
  });

  it("allows cancellation before preparation is done", () => {
    expect(canTransitionOrder("PENDING", "CANCELLED")).toBe(true);
    expect(canTransitionOrder("PAID", "CANCELLED")).toBe(true);
    expect(canTransitionOrder("PREPARING", "CANCELLED")).toBe(true);
  });

  it("rejects skipping states", () => {
    expect(canTransitionOrder("PENDING", "READY")).toBe(false);
    expect(canTransitionOrder("PENDING", "COMPLETED")).toBe(false);
  });

  it("rejects moving out of a terminal state", () => {
    expect(isTerminalOrderStatus("COMPLETED")).toBe(true);
    expect(isTerminalOrderStatus("CANCELLED")).toBe(true);
    expect(canTransitionOrder("COMPLETED", "PENDING")).toBe(false);
    expect(canTransitionOrder("READY", "CANCELLED")).toBe(false);
  });

  it("throws a typed error with the attempted transition on invalid moves", () => {
    expect(() => assertValidOrderTransition("PENDING", "READY")).toThrow(
      InvalidOrderTransitionError,
    );
    try {
      assertValidOrderTransition("PENDING", "READY");
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidOrderTransitionError);
      expect((error as InvalidOrderTransitionError).from).toBe("PENDING");
      expect((error as InvalidOrderTransitionError).to).toBe("READY");
    }
  });
});
