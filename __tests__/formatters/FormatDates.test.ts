import formatDateAsNumber, { formatDateAsString, formatDateAsDate, convertDateStringToNumber } from "@/app/server/formatters/FormatDates";

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


  it("converts Date to number format", () => {
    const date = new Date("2023-10-15");
    expect(formatDateAsNumber(date)).toBe(20231015);
  });

  it("converts YYYY-MM-DD string to number", () => {
    expect(convertDateStringToNumber("2023-10-15")).toBe(20231015);
  });

  it("formats leap year date correctly", () => {
    expect(formatDateAsString(20240229)).toBe("29 February 2024");
  });

  it("formats 31 December correctly", () => {
    expect(formatDateAsString(20231231)).toBe("31 December 2023");
  });

  it("handles date with invalid day", () => {
    expect(formatDateAsString(20230230)).toMatch(/Invalid Date|02 March 2023/);
  });
  
  it("handles date with invalid month", () => {
    expect(formatDateAsString(20231301)).toMatch(/Invalid Date|01 January 2024/);
  });
  
  it("handles non-numeric string input", () => {
    // @ts-ignore
    expect(formatDateAsString("20231015")).toBe("Invalid date");
  });

  it("formats valid date", () => {
    expect(formatDateAsString(20231015)).toBe("15 October 2023");
  });
  
  
});