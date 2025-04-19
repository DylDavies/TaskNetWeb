import { uploadCV } from "../../src/app/server/services/ApplicationService";
import { uploadFile } from "../../src/app/server/services/DatabaseService";

jest.mock("../../src/app/server/services/DatabaseService");

describe("ApplicationService", () => {
  const mockFile = new File([], "test.pdf", { type: "application/pdf" });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should reject non-PDF files", async () => {
    const invalidFile = new File([], "test.txt", { type: "text/plain" });
    const result = await uploadCV(invalidFile, "123");
    expect(result).toBe(" ");
  });

  it("should upload valid PDF files", async () => {
    (uploadFile as jest.Mock).mockResolvedValue("http://example.com/cv");
    const result = await uploadCV(mockFile, "123");
    expect(result).toBe("http://example.com/cv");
  });
});