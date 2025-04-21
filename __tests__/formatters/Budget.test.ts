import { formatBudget } from "@/app/server/formatters/Budget";

describe("Budget Utilities", () => {
  test("formats valid budget range", () => {
    expect(formatBudget(100, 200)).toBe("R100k - R200k");
  });

  test("handles missing budgetMin", () => {
    expect(formatBudget(undefined, 200)).toBe("Budget min is NAN");
  });

  test("handles missing budgetMax", () => {
    expect(formatBudget(100, undefined)).toBe("Budget max is NAN");
  });

  test("handles zero values", () => {
    expect(formatBudget(0, 0)).toBe("R0k - R0k");
  });

  test("handles both missing values", () => {
    expect(formatBudget(undefined, undefined)).toBe("Budget min is NAN");
  });
});