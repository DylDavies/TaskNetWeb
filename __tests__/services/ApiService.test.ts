import ApiService from "@/app/services/ApiService";

describe("ApiService", () => {
  const mockResponse = (status: number, body: any) =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(body)
    });

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  describe("logout", () => {
    it("should handle successful logout", async () => {
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse(200, {}));
      
      await ApiService.logout();
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/auth/logout"),
        expect.objectContaining({ method: "POST" })
      );
    });

    it("should handle logout error", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      await ApiService.logout();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe("sessionExists", () => {
    it("should handle non-OK response", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ presence: false })
      });

      const result = await ApiService.sessionExists();
      expect(result).toEqual({ presence: false });
    });
  });

  describe("login", () => {
    it("should handle network errors", async () => {
      // Mock the fetch to reject with an error
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network failure"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
  
      await ApiService.login("invalid-token");
      
      // Verify the error was logged
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Network failure" })
      );
    });
  
    it("should handle HTTP errors", async () => {
      // Mock a 401 response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401
      });
      
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
  
      await ApiService.login("invalid-token");
      
      // Verify error logging
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.objectContaining({ status: 401, message: "invalid-token" })
      );
    });
  });
});