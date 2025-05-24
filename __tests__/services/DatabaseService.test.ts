// __tests__/services/DatabaseService.test.ts
import {
  getPendingUsers,
  approveUser,
  denyUser,
  setUserType,
  SetUserName, 
  uploadFile,
  getUser,
  getUsername,
  setAvatar,
  addSkillsToFreelancer,
  getSkillsForFreelancer,
  removeSkillFromFreelancer,
} from "../../src/app/server/services/DatabaseService"; 
import UserStatus from "@/app/enums/UserStatus.enum"; 
import UserData from "../../src/app/interfaces/UserData.interface"; 
import PendingUser from "@/app/interfaces/PendingUser.interface"; 

// Mocking global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("DatabaseService", () => {
  const mockUid = "user123";
  const mockUsername = "testuser";

  beforeEach(() => {
    jest.clearAllMocks(); // Clears all mocks, including fetch
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({}),
      text: async () => "OK",
    });
  });

  // Test for getUser function
  describe("getUser", () => {
    it("should return null if uid is invalid (empty string)", async () => {
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
      const result = await getUser("");
      expect(result).toBeNull();
      expect(mockFetch).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Invalid UID provided to getUser:",
        ""
      );
      consoleWarnSpy.mockRestore();
    });

    it("should return null if API response is not ok", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => "Internal Server Error",
      });
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation();
      const result = await getUser(mockUid);
      expect(result).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/database/user?userID=${encodeURIComponent(mockUid)}`
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "API error: 500 - Internal Server Error"
      );
      consoleErrorSpy.mockRestore();
    });

    it("should return user data if API call is successful", async () => {
      const mockUserData: UserData = {
        username: mockUsername,
        type: 1,
        status: UserStatus.Approved,
        date: Date.now(),
        skills: {}
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: mockUserData }),
      });
      const result = await getUser(mockUid);
      expect(result).toEqual(mockUserData);
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/database/user?userID=${encodeURIComponent(mockUid)}`
      );
    });

    it("should return null if API result is null", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ result: null }),
        });
        const result = await getUser(mockUid);
        expect(result).toBeNull();
      });

    it("should return null and log error if fetch throws an error", async () => {
      const error = new Error("Network error");
      mockFetch.mockRejectedValueOnce(error);
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation();
      const result = await getUser(mockUid);
      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to fetch user data from API:",
        error
      );
      consoleErrorSpy.mockRestore();
    });
  });

  // Test for approveUser function
  describe("approveUser", () => {
    it("should call fetch with correct parameters", async () => {
      await approveUser(mockUid);
      const expectedParams = new URLSearchParams();
      expectedParams.append("userID", mockUid);
      expectedParams.append("status", "1");
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/database/status?${expectedParams.toString()}`,
        {
          method: "PATCH",
          headers: {},
        }
      );
    });

    it("should throw error and log if fetch fails", async () => {
      const error = new Error("API down");
      mockFetch.mockRejectedValueOnce(error);
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation();
      await expect(approveUser(mockUid)).rejects.toThrow("API down");
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Error in approveUser function for UID ${mockUid}:`,
        error
      );
      consoleErrorSpy.mockRestore();
    });

     it("should not throw if API response is not ok (handled by API, client just calls)", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 500,
          text: async () => "Server Error",
        });
        await expect(approveUser(mockUid)).resolves.toBeUndefined();
    });
  });

  // Test for denyUser function
  describe("denyUser", () => {
    it("should call fetch with correct parameters", async () => {
      await denyUser(mockUid);
      const expectedParams = new URLSearchParams();
      expectedParams.append("userID", mockUid);
      expectedParams.append("status", "2");
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/database/status?${expectedParams.toString()}`,
        {
          method: "PATCH",
          headers: {},
        }
      );
    });

    it("should throw error and log if fetch fails", async () => {
      const error = new Error("Network Issue");
      mockFetch.mockRejectedValueOnce(error);
       const consoleErrorSpy = jest 
        .spyOn(console, "error")
        .mockImplementation();
      await expect(denyUser(mockUid)).rejects.toThrow("Network Issue");
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Error in denyUser function for UID ${mockUid}:`, 
        error
      );
      consoleErrorSpy.mockRestore();
    });
  });

  // Test for SetUserName 
  describe("SetUserName", () => {
    it("should return true on successful update", async () => {
      const result = await SetUserName(mockUid, mockUsername);
      const expectedParams = new URLSearchParams();
      expectedParams.append("userID", mockUid);
      expectedParams.append("name", mockUsername);
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/database/username?${expectedParams.toString()}`,
        {
          method: "PATCH",
          headers: {},
        }
      );
      expect(result).toBe(true);
    });

    it("should return false and log error if API response is not ok", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: async () => ({ message: "Invalid username format" }),
      });
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation();
      const result = await SetUserName(mockUid, "invalid user");
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Could not set username for UID ${mockUid}. Invalid username format` 
      );
      consoleErrorSpy.mockRestore();
    });

    it("should return false and log error if fetch fails", async () => {
      const error = new Error("Connection failed");
      mockFetch.mockRejectedValueOnce(error);
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation();
      const result = await SetUserName(mockUid, mockUsername);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Client-side error in SetUserName for UID ${mockUid} with username "${mockUsername}":`,
        error
      );
      consoleErrorSpy.mockRestore();
    });

    it("should return false if username is null", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      // @ts-ignore to test runtime validation
      const result = await SetUserName(mockUid, null);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith("Username cannot be null or undefined.");
      expect(mockFetch).not.toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  // Test for getPendingUsers
  describe("getPendingUsers", () => {
    const mockPendingUser: PendingUser = {
      uid: "pendingUser1",
      status: UserStatus.Pending,
      type: 0,
      username: "pending.user",
      date: Date.now(),
    };

    it("should return pending users if API call is successful", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: [mockPendingUser] }),
      });
      const result = await getPendingUsers();
      expect(result).toEqual([mockPendingUser]);
      expect(mockFetch).toHaveBeenCalledWith("/api/database/pending");
    });

    it("should return empty array if API response is not ok", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => "Server Error",
      });
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation();
      const result = await getPendingUsers();
      expect(result).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "API error fetching pending users: 500 - Server Error"
      );
      consoleErrorSpy.mockRestore();
    });

    it("should return empty array if fetch throws an error", async () => {
      const error = new Error("Network Failure");
      mockFetch.mockRejectedValueOnce(error);
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation();
      const result = await getPendingUsers();
      expect(result).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to fetch pending users from API:",
        error
      );
      consoleErrorSpy.mockRestore();
    });

     it("should return empty array if API result is null or undefined", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ result: null }), // Test for null result
        });
        let result = await getPendingUsers();
        expect(result).toEqual([]);

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({}), // Test for undefined result 
          });
        result = await getPendingUsers();
        expect(result).toEqual([]);
      });
  });

  // Test for setUserType
  describe("setUserType", () => {
    const userType = 2; // Freelancer

    it("should return true on successful update", async () => {
      const result = await setUserType(mockUid, userType);
      const expectedParams = new URLSearchParams();
      expectedParams.append("userID", mockUid);
      expectedParams.append("type", String(userType));
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/database/type?${expectedParams.toString()}`,
        {
          method: "PATCH",
          headers: {},
        }
      );
      expect(result).toBe(true);
    });

    it("should return false and log error if API response is not ok", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ message: "Permission denied" }),
      });
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation();
      const result = await setUserType(mockUid, userType);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `API error setting user type for UID '${mockUid}' to type '${userType}': 403 - Forbidden. Response: Permission denied`
      );
      consoleErrorSpy.mockRestore();
    });

    it("should return false and log error if fetch throws an error", async () => {
      const error = new Error("Server unreachable");
      mockFetch.mockRejectedValueOnce(error);
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation();
      const result = await setUserType(mockUid, userType);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Failed to set user type for UID '${mockUid}' to type '${userType}' due to client-side/network error:`,
        error
      );
      consoleErrorSpy.mockRestore();
    });
  });

  // Test for uploadFile
  describe("uploadFile", () => {
    const mockFile = new File(["content"], "test.txt", {
      type: "text/plain",
    });
    const mockPath = "test/path";
    const mockName = "testfile.txt";
    const mockDownloadURL = "http://example.com/file/testfile.txt";

    it("should return downloadURL on successful upload", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ downloadURL: mockDownloadURL }),
      });

      const result = await uploadFile(mockFile, mockPath, mockName);

      expect(result).toBe(mockDownloadURL);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const fetchCall = mockFetch.mock.calls[0];
      expect(fetchCall[0]).toBe("/api/database/file");
      expect(fetchCall[1]?.method).toBe("POST");
      expect(fetchCall[1]?.body).toBeInstanceOf(FormData);
      const formData = fetchCall[1]?.body as FormData;
      expect(formData.get("file")).toEqual(mockFile);
      expect(formData.get("path")).toBe(mockPath);
      expect(formData.get("name")).toBe(mockName);
    });

    it("should throw error if API response is not ok", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Upload Error",
        json: async () => ({ message: "Failed to process file" }),
      });
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation();

      await expect(
        uploadFile(mockFile, mockPath, mockName)
      ).rejects.toThrow(
        "Failed to upload file. Failed to process file"
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Failed to upload file "${mockName}" to path "${mockPath}": Failed to process file`
      );
      consoleErrorSpy.mockRestore();
    });

    it("should throw error if API response does not include downloadURL", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "Uploaded but no URL" }), // Missing downloadURL
      });
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation();
      await expect(
        uploadFile(mockFile, mockPath, mockName)
      ).rejects.toThrow(
        "File upload succeeded but did not receive a download URL."
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Failed to upload file "${mockName}": API response did not include a downloadURL.`
      );
      consoleErrorSpy.mockRestore();
    });

    it("should throw error and log if fetch fails", async () => {
      const error = new Error("Network error during upload");
      mockFetch.mockRejectedValueOnce(error);
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation();
      await expect(
        uploadFile(mockFile, mockPath, mockName)
      ).rejects.toThrow("Network error during upload");
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Client-side error in uploadFile for file "${mockName}", path "${mockPath}":`,
        error
      );
      consoleErrorSpy.mockRestore();
    });
  });

  // Test for getUsername
  describe("getUsername", () => {
    it("should return username if getUser returns a user", async () => {
      const mockUserData: UserData = {
        username: mockUsername,
        type: 1,
        status: UserStatus.Approved,
        date: Date.now(),
        skills: {},
      };
      // Mock fetch for the underlying getUser call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: mockUserData }),
      });

      const result = await getUsername(mockUid);
      expect(result).toBe(mockUsername);
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/database/user?userID=${encodeURIComponent(mockUid)}`
      );
    });

    it('should return "No username" if getUser returns null', async () => {
      // Mock fetch for the underlying getUser call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: null }),
      });

      const result = await getUsername(mockUid);
      expect(result).toBe("No username");
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/database/user?userID=${encodeURIComponent(mockUid)}`
      );
    });

     it('should return "No username" if getUser encounters an API error', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            text: async () => "Internal Server Error",
        });
        jest.spyOn(console, "error").mockImplementation(); 
        const result = await getUsername(mockUid);
        expect(result).toBe("No username");
        (console.error as jest.Mock).mockRestore();
    });
  });

  // Test for setAvatar
  describe("setAvatar", () => {
    const mockAvatarUrl = "http://example.com/avatar.png";

    it("should return true on successful update with an avatar URL", async () => {
      const result = await setAvatar(mockUid, mockAvatarUrl);
      const expectedParams = new URLSearchParams();
      expectedParams.append("userID", mockUid);
      expectedParams.append("avatar", mockAvatarUrl);
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/database/avatar?${expectedParams.toString()}`,
        {
          method: "PATCH",
          headers: {},
        }
      );
      expect(result).toBe(true);
    });

    it("should return true on successful update with null avatar (empty string sent)", async () => {
      const result = await setAvatar(mockUid, null);
      const expectedParams = new URLSearchParams();
      expectedParams.append("userID", mockUid);
      expectedParams.append("avatar", ""); 
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/database/avatar?${expectedParams.toString()}`,
        {
          method: "PATCH",
          headers: {},
        }
      );
      expect(result).toBe(true);
    });

    it("should return false if uid is empty", async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        const result = await setAvatar("", mockAvatarUrl);
        expect(result).toBe(false);
        expect(consoleErrorSpy).toHaveBeenCalledWith("User ID (uid) cannot be empty or null when setting avatar.");
        expect(mockFetch).not.toHaveBeenCalled();
        consoleErrorSpy.mockRestore();
    });

    it("should return false and log error if API response is not ok", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: async () => ({ message: "Invalid avatar URL" }),
      });
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation();
      const result = await setAvatar(mockUid, mockAvatarUrl);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Could not set avatar for UID ${mockUid}. Invalid avatar URL`
      );
      consoleErrorSpy.mockRestore();
    });

    it("should return false and log error if fetch fails", async () => {
      const error = new Error("Network Error");
      mockFetch.mockRejectedValueOnce(error);
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation();
      const result = await setAvatar(mockUid, mockAvatarUrl);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Client-side error in setAvatar for UID ${mockUid}:`,
        error
      );
      consoleErrorSpy.mockRestore();
    });
  });

  // Test for addSkillsToFreelancer
  describe("addSkillsToFreelancer", () => {
    const mockSkills = { "Programming": ["JavaScript", "Python"] };

    it("should call fetch with correct parameters and not throw on success", async () => {
      await expect(addSkillsToFreelancer(mockUid, mockSkills)).resolves.toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith(
        `api/database/skills?userID=${encodeURIComponent(mockUid)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mockSkills),
        }
      );
    });

    it("should throw error if uid is invalid", async () => {
      await expect(addSkillsToFreelancer("", mockSkills)).rejects.toThrow(
        "User ID is missing or not in correct format"
      );
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should throw error if skillAreaSkillMap is empty", async () => {
      await expect(addSkillsToFreelancer(mockUid, {})).rejects.toThrow(
        "Skills are missing"
      );
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should throw error if API response is not ok", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Server Error",
        json: async () => ({ message: "Failed to add skills" }),
      });
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      await expect(addSkillsToFreelancer(mockUid, mockSkills)).rejects.toThrow(
        "Failed to add skills" 
      );
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it("should throw error if fetch fails", async () => {
      const error = new Error("Network problem");
      mockFetch.mockRejectedValueOnce(error);
       const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      await expect(addSkillsToFreelancer(mockUid, mockSkills)).rejects.toThrow(
        "Network problem"
      );
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  // Test for getSkillsForFreelancer
  describe("getSkillsForFreelancer", () => {
    const mockSkillsResponse = { "Design": ["UI/UX", "Graphic Design"] };

    it("should return skills map on successful API call", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: mockSkillsResponse }),
      });
      const result = await getSkillsForFreelancer(mockUid);
      expect(result).toEqual(mockSkillsResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/database/skills?userID=${encodeURIComponent(mockUid)}`,
        {
          method: "GET",
          headers: {},
        }
      );
    });

    it("should return empty object if uid is invalid", async () => {
        const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
        const result = await getSkillsForFreelancer(" "); 
        expect(result).toEqual({});
        expect(mockFetch).not.toHaveBeenCalled();
        expect(consoleWarnSpy).toHaveBeenCalledWith("Invalid UID provided to getSkillsForFreelancer client function:", " ");
        consoleWarnSpy.mockRestore();
    });

    it("should return empty object if API result is null", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ result: null }),
        });
        const result = await getSkillsForFreelancer(mockUid);
        expect(result).toEqual({});
      });

    it("should throw error if API response is not ok", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: async () => ({ message: "Skills not found for user" }),
      });
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      await expect(getSkillsForFreelancer(mockUid)).rejects.toThrow(
        "Skills not found for user"
      );
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it("should throw error if fetch fails", async () => {
      const error = new Error("API connection issue");
      mockFetch.mockRejectedValueOnce(error);
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      await expect(getSkillsForFreelancer(mockUid)).rejects.toThrow(
        "API connection issue"
      );
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  // Test for removeSkillFromFreelancer
  describe("removeSkillFromFreelancer", () => {
    const mockSkillName = "Python";

    it("should call fetch with correct parameters and not throw on success", async () => {
      await expect(removeSkillFromFreelancer(mockUid, mockSkillName)).resolves.toBeUndefined();
      const expectedParams = new URLSearchParams();
      expectedParams.append("userID", mockUid);
      expectedParams.append("skillName", mockSkillName);
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/database/removeSkill?${expectedParams.toString()}`,
        {
          method: "PATCH",
          headers: {},
        }
      );
    });

    it("should throw error if uid is invalid", async () => {
      await expect(removeSkillFromFreelancer("", mockSkillName)).rejects.toThrow(
        "User ID (uid) is required and must be a non-empty string."
      );
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should throw error if skillName is invalid", async () => {
      await expect(removeSkillFromFreelancer(mockUid, " ")).rejects.toThrow(
        "Skill name (skillName) is required and must be a non-empty string."
      );
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should throw error if API response is not ok", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: async () => ({ message: "Skill not found to remove" }),
      });
       const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      await expect(removeSkillFromFreelancer(mockUid, mockSkillName)).rejects.toThrow(
        "Skill not found to remove"
      );
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it("should throw error if fetch fails", async () => {
      const error = new Error("Server timeout");
      mockFetch.mockRejectedValueOnce(error);
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      await expect(removeSkillFromFreelancer(mockUid, mockSkillName)).rejects.toThrow(
        "Server timeout"
      );
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });
});