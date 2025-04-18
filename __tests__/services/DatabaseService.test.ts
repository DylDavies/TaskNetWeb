// __tests__/services/DatabaseService.test.ts
import { 
    collection, where, query, getDocs, updateDoc, doc 
  } from "firebase/firestore";
  import { 
    getPendingUsers, approveUser, denyUser, setUserType, 
    SetUserName, sendEmail, uploadFile 
  } from "../../src/app/server/services/DatabaseService";
  import UserStatus from "@/app/enums/UserStatus.enum";
import { getDownloadURL, uploadBytesResumable } from "firebase/storage";
  
  jest.mock("firebase/firestore");
  jest.mock("firebase/storage");
  jest.mock("nodemailer");
  
  describe("DatabaseService", () => {
    const mockUserDoc = {
      id: "user123",
      data: () => ({ status: UserStatus.Pending })
    };
  
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    describe("getPendingUsers", () => {
      it("should return pending users", async () => {
        (collection as jest.Mock).mockReturnValue("users-collection");
        (where as jest.Mock).mockReturnValue("where-clause");
        (query as jest.Mock).mockReturnValue("final-query");
        (getDocs as jest.Mock).mockResolvedValue({
          docs: [mockUserDoc]
        });
  
        const result = await getPendingUsers();
        expect(result).toEqual([{
          uid: "user123",
          status: UserStatus.Pending
        }]);
      });
    });
  
    describe("setUserType", () => {
      it("should update user type", async () => {
        (doc as jest.Mock).mockReturnValue("user-ref");
        (updateDoc as jest.Mock).mockResolvedValue(true);
  
        await setUserType("user123", 2);
        expect(updateDoc).toHaveBeenCalledWith("user-ref", { type: 2 });
      });
  
      it("should handle update errors", async () => {
        (updateDoc as jest.Mock).mockRejectedValue(new Error("DB error"));
        await expect(setUserType("invalid", 1)).rejects.toThrow();
      });
    });
  
    describe("sendEmail", () => {
      it("should handle successful email sending", async () => {
        const mockSendMail = jest.fn((_, cb) => cb(null, "success"));
        require("nodemailer").createTransport.mockReturnValue({
          sendMail: mockSendMail
        });
  
        await expect(sendEmail("test@test.com", "Subject", "Body"))
          .resolves.toBeUndefined();
      });
  
      it("should handle email errors", async () => {
        const mockSendMail = jest.fn((_, cb) => cb(new Error("SMTP error")));
        require("nodemailer").createTransport.mockReturnValue({
          sendMail: mockSendMail
        });

        let consoleSpy = jest.spyOn(console, "error").mockImplementation();
  
        await expect(consoleSpy).toHaveBeenCalled();
      });
    });
  
    describe("uploadFile", () => {
      it("should handle successful upload", async () => {
        (uploadBytesResumable as jest.Mock).mockReturnValue({
          snapshot: { ref: "file-ref" },
          on: jest.fn((_, __, onComplete) => onComplete())
        });
        (getDownloadURL as jest.Mock).mockResolvedValue("http://example.com/file");
  
        await expect(uploadFile(new File([], "test.txt"), "path", "name"))
          .resolves.toBe("http://example.com/file");
      });
  
      it("should handle upload errors", async () => {
        (uploadBytesResumable as jest.Mock).mockReturnValue({
          on: jest.fn((_, onError) => onError(new Error("Upload failed")))
        });
  
        await expect(uploadFile(new File([], "test.txt"), "path", "name"))
          .rejects.toThrow("Upload failed");
      });
    });
  
    // Similar tests for approveUser, denyUser, SetUserName
  });