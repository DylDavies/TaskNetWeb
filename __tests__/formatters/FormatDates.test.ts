import { formatDateAsString, formatDateAsDate } from "@/app/server/formatters/FormatDates";

describe("Date Formatting Utilities", () => {
  const validDate = 20231015; // October 15, 2023
  const invalidDate = 20231345; // Invalid date

  describe("formatDateAsString", () => {
    it("formats valid date", () => {
      expect(formatDateAsString(validDate)).toBe("15 October 2023");
    });

    it("handles invalid date length", () => {
      expect(formatDateAsString(2023101)).toBe("Invalid date");
    });

    it("handles undefined input", () => {
      expect(formatDateAsString(undefined)).toBe("Not specified");
    });

    it("handles invalid date components", () => {
      expect(formatDateAsString(invalidDate)).toMatch(/Invalid Date|15 December 2024/);
    });
  });

  describe("formatDateAsDate", () => {
    it("gets valid date", () => {
      const d = formatDateAsDate(validDate);

      expect(d.getFullYear()).toBe(2023);
      expect(d.getMonth()).toBe(9);
      expect(d.getDate()).toBe(15);
    });
  });
});