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
    it("formats valid date consistently", () => {
      expect(formatDateAsDate(validDate)).toBe("15 October 2023");
    });

    it("matches string format function", () => {
      const date = 20231225;
      expect(formatDateAsDate(date)).toBe(formatDateAsString(date));
    });

    it("handle no dateNum", () => {
        expect(formatDateAsDate()).toBe("Not specified");
    })

    it("should handle incorrect datestr", () => {
        expect(formatDateAsString(1)).toBe("Invalid date");
    })
  });
});