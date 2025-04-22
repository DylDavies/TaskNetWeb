import { formatBudget } from "@/app/server/formatters/Budget";

describe("Budget Utilities", () => {
  test("formats valid budget range", () => {
    expect(formatBudget(100, 200)).toBe("R100 - R200");
  });

  test("handles missing budgetMin", () => {
    expect(formatBudget(undefined, 200)).toBe("Budget min is NAN");
  });

  test("handles missing budgetMax", () => {
    expect(formatBudget(100, undefined)).toBe("Budget max is NAN");
  });

  test("handles zero values", () => {
    expect(formatBudget(0, 0)).toBe("R0 - R0");
  });

  test("handles both missing values", () => {
    expect(formatBudget(undefined, undefined)).toBe("Budget min is NAN");
  });

  test("formats large values with k", () => {
    expect(formatBudget(12000, 42000)).toBe("R12k - R42k");
  });

  test("formats one large with k and one small without", () => {
    expect(formatBudget(1200, 22000)).toBe("R1200 - R22k");
  });
});