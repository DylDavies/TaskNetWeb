import { arrayUnion, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../src/app/firebase";
import { AddSkill, getSkillByID } from "../../src/app/server/services/adminService";

jest.mock("firebase/firestore");

describe("adminService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getSkillByID", () => {
    it("should return null for non-existent skill area", async () => {
      (getDoc as jest.Mock).mockResolvedValue({ exists: () => false });
      const result = await getSkillByID("invalid");
      expect(result).toBeNull();
    });

    it("should return skill data for existing area", async () => {
      const mockData = { name: ["TS"] };
      (getDoc as jest.Mock).mockResolvedValue({ exists: () => true, data: () => mockData });
      const result = await getSkillByID("programming");
      expect(result).toEqual(mockData);
    });
  });

  describe("AddSkill", () => {
    it("should call setDoc successfully", async () => {
        (doc as jest.Mock).mockReturnValue("doc");
        (arrayUnion as jest.Mock).mockReturnValue("name");

        await AddSkill("area", "name");

        expect(setDoc).toHaveBeenCalledWith("doc", {SkillArea: "area", name: "name"})
    })
  })
});