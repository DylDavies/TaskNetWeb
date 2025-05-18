import { collection, doc, setDoc, getDocs, arrayUnion, updateDoc } from "firebase/firestore";
import { db } from "../../src/app/firebase";
import { AddSkill, getSkillArray, getAllSkillIDs } from "../../src/app/server/services/SkillsService";

jest.mock("firebase/firestore");

describe("SkillsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("AddSkill", () => {
    it("should add skill to specified area", async () => {
        (doc as jest.Mock).mockReturnValue("doc");
        (arrayUnion as jest.Mock).mockReturnValue("TypeScript");

        await AddSkill("programming", "TypeScript");
        
        expect(updateDoc).toHaveBeenCalledWith(
            "doc",
            expect.objectContaining(
              { names: "TypeScript" })
        );
    });
  });

  describe("getSkillArray", () => {
    it("should return skill areas with names", async () => {
      const mockData = [{ id: "1", data: () => ({ names: ["TS"] })}];
      (getDocs as jest.Mock).mockResolvedValue({ docs: mockData });
      
      const result = await getSkillArray();
      expect(result).toEqual([{ id: "1", skills: ["TS"] }]);
    });
  });

  describe("getAllSkillIDs", () => {
    it("should return array of document IDs", async () => {
      const forEach = jest.fn((cb) => cb());
      (getDocs as jest.Mock).mockResolvedValue({ forEach });
      
      const result = await getAllSkillIDs();
      expect(forEach).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it("should handle getDoc error", async () => {
        (getDocs as jest.Mock).mockRejectedValue(new Error("error"));

        const consoleSpy = jest.spyOn(console, "error").mockImplementation();
        
        let result = await getAllSkillIDs();

        expect(consoleSpy).toHaveBeenCalled();
        expect(result).toEqual([]);
    });
  });
});