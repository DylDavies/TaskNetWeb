import { 
  AddSkill, 
  getSkillArray, 
  getAllSkillIDs, 
  getAllSkills, 
  mapSkillsToAreas 
} from "../../src/app/server/services/SkillsService";

// Mock the global fetch function
global.fetch = jest.fn() as jest.Mock;

describe("SkillsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  describe("AddSkill", () => {
    it("should successfully add skill", async () => {
      const mockResponse = { 
        ok: true, 
        json: jest.fn().mockResolvedValue({ success: true }) 
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await AddSkill("programming", "TypeScript");
      
      expect(fetch).toHaveBeenCalledWith('/api/skills/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ SkillArea: "programming", skillName: "TypeScript" })
      });
      expect(result).toEqual({ success: true });
    });

    it("should throw error when response not ok", async () => {
      const mockResponse = { ok: false };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(AddSkill("programming", "TypeScript"))
        .rejects.toThrow("Failed to add skill");
    });

    it("should log and rethrow fetch errors", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      (fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      await expect(AddSkill("programming", "TypeScript"))
        .rejects.toThrow("Network error");
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error adding skill:",
        expect.any(Error)
      );
    });
  });

  describe("getSkillArray", () => {
    it("should return skill areas with names", async () => {
      const mockData = { results: [{ id: "1", skills: ["TS"] }] };
      const mockResponse = { 
        ok: true, 
        json: jest.fn().mockResolvedValue(mockData) 
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      const result = await getSkillArray();
      expect(result).toEqual([{ id: "1", skills: ["TS"] }]);
    });

    it("should return empty array when response not ok", async () => {
      const mockResponse = { ok: false };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      const result = await getSkillArray();
      expect(result).toEqual([]);
    });

    it("should return empty array on fetch error", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      (fetch as jest.Mock).mockRejectedValue(new Error("Network error"));
      
      const result = await getSkillArray();
      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error getting all the skills",
        expect.any(Error)
      );
    });
  });

  describe("getAllSkills", () => {
    it("should return unique skills from all areas", async () => {
      const mockData = { 
        results: [
          { id: "1", skills: ["TS", "JS"] },
          { id: "2", skills: ["JS", "Python"] }
        ] 
      };
      const mockResponse = { 
        ok: true, 
        json: jest.fn().mockResolvedValue(mockData) 
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      const result = await getAllSkills();
      expect(result).toEqual(["TS", "JS", "Python"]);
    });

    it("should return empty array when no skills exist", async () => {
      const mockData = { results: [] };
      const mockResponse = { 
        ok: true, 
        json: jest.fn().mockResolvedValue(mockData) 
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      const result = await getAllSkills();
      expect(result).toEqual([]);
    });

    it("should return empty array on error", async () => {
      jest.spyOn(console, "error").mockImplementation();
      (fetch as jest.Mock).mockRejectedValue(new Error("Network error"));
      
      const result = await getAllSkills();
      expect(result).toEqual([]);
    });
  });

  describe("getAllSkillIDs", () => {
    it("should return array of document IDs", async () => {
      const mockData = { results: ["id1", "id2"] };
      const mockResponse = { 
        ok: true, 
        json: jest.fn().mockResolvedValue(mockData) 
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      const result = await getAllSkillIDs();
      expect(result).toEqual(["id1", "id2"]);
    });

    it("should return empty array when response not ok", async () => {
      const mockResponse = { ok: false };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      const result = await getAllSkillIDs();
      expect(result).toEqual([]);
    });

    it("should return empty array on fetch error", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      (fetch as jest.Mock).mockRejectedValue(new Error("Network error"));
      
      const result = await getAllSkillIDs();
      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching job IDs:",
        expect.any(Error)
      );
    });
  });

  describe("mapSkillsToAreas", () => {
    it("should return skill area mapping", async () => {
      const mockData = { 
        results: { programming: ["TS"], design: ["Figma"] } 
      };
      const mockResponse = { 
        ok: true, 
        json: jest.fn().mockResolvedValue(mockData) 
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      const result = await mapSkillsToAreas(["TS", "Figma"]);
      expect(result).toEqual({ programming: ["TS"], design: ["Figma"] });
    });

    it("should return empty object when response not ok", async () => {
      const mockResponse = { ok: false };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      const result = await mapSkillsToAreas(["TS", "Figma"]);
      expect(result).toEqual({});
    });

    it("should return empty object on fetch error", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      (fetch as jest.Mock).mockRejectedValue(new Error("Network error"));
      
      const result = await mapSkillsToAreas(["TS", "Figma"]);
      expect(result).toEqual({});
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error mapping skills to ares",
        expect.any(Error)
      );
    });

    it("should send correct request body", async () => {
      const mockResponse = { ok: true, json: jest.fn().mockResolvedValue({ results: {} }) };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      await mapSkillsToAreas(["TS", "Figma"]);
      
      expect(fetch).toHaveBeenCalledWith('/api/skills/map', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillNames: ["TS", "Figma"] })
      });
    });
  });
});