import { sanitizeJobData } from "@/app/server/formatters/JobDataSanitization";
import JobData from "@/app/interfaces/JobData.interface";
import JobStatus from "@/app/enums/JobStatus.enum";

describe("Job Data Sanitization", () => {
  const validJobData: Partial<JobData> = {
    title: "Developer",
    description: "Job description",
    clientUId: "client123",
    budgetMin: 100,
    budgetMax: 200,
    deadline: 20231231,
    createdAt: 20231001,
    skills: { programming: ["TypeScript"] }
  };

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  test("validates complete job data", () => {
    const result = sanitizeJobData(validJobData);
    expect(result.status).toBe(JobStatus.Posted);
    expect(result.hiredUId).toBe("");
  });

  test("rejects missing title", () => {
    expect(() => sanitizeJobData({ ...validJobData, title: undefined }))
      .toThrow("title is missing or not a string");
  });

  test("rejects invalid budget range", () => {
    expect(() => sanitizeJobData({ ...validJobData, budgetMin: 300, budgetMax: 200 }))
      .toThrow("Maximum budget must be greater than minimum budget");
  });

  test("rejects invalid date formats", () => {
    expect(() => sanitizeJobData({ ...validJobData, deadline: 2023123 }))
      .toThrow("Invalid deadline date format.");
  });

  test("handles multiple validation errors", () => {
    expect(() => sanitizeJobData({
      ...validJobData,
      title: undefined,
      budgetMin: -100
    })).toThrow("Validation failed:\ntitle is missing or not a string\nminimum budget must be a non-negative number.");
  });

  test("requires clientUId", () => {
    expect(() => sanitizeJobData({ ...validJobData, clientUId: undefined }))
      .toThrow("clientUId is missing or not a string");
  });
});