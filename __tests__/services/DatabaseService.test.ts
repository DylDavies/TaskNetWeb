// __tests__/services/DatabaseService.test.ts
import { 
    collection, where, query, getDocs, updateDoc, doc, 
    getDoc
  } from "firebase/firestore";
  import { 
    getPendingUsers, approveUser, denyUser, setUserType, 
    SetUserName, sendEmail, uploadFile, 
    getUser
  } from "../../src/app/server/services/DatabaseService";
  import UserStatus from "@/app/enums/UserStatus.enum";
import { getDownloadURL, uploadBytesResumable } from "firebase/storage";
import nodemailer from "nodemailer";

const { __mockTransporter } = nodemailer as any;
  
//Mocking dependancies
  jest.mock("firebase/firestore");
  jest.mock("firebase/storage");
  jest.mock("nodemailer");
  
  //what testsuite is called
  describe("DatabaseService", () => {
    //makes a mock user doc to test
    const mockUserDoc = {
      id: "user123",
      data: () => ({ status: UserStatus.Pending })
    };
  
    beforeEach(() => {
      jest.clearAllMocks();
      
    });

    //test for getUser function
    describe("getUser", () => {
      it("should return null if no user", async () => {
        (doc as jest.Mock).mockReturnValue({});
        (getDoc as jest.Mock).mockResolvedValue({exists: () => false});

        let result = await getUser("mockUid");

        expect(result).toBe(null);
      });

      it("should return user", async () => {
        (doc as jest.Mock).mockReturnValue({});
        (getDoc as jest.Mock).mockResolvedValue({exists: () => true, data: () => "data"});

        let result = await getUser("mockUid");

        expect(result).toBe("data");
      })
    });

    //Test for approve user funciton
    describe("approveUser", () => {
      it("should run updateDoc", async () => {        
        await approveUser("mockUid");

        expect(updateDoc).toHaveBeenCalled();
      });
    })

    //test for denyUser function
    describe("denyUser", () => {
      it("should run updateDoc", async () => {        
        await denyUser("mockUid");

        expect(updateDoc).toHaveBeenCalled();
      });
    });

    //Test for setUserName
    describe("setUserName", () => {
      it("should succeeed", async () => {
        (updateDoc as jest.Mock).mockReturnValue("success");

        await SetUserName("mockUId", "username");

        expect(updateDoc).toHaveBeenCalled();
      });

      it("should handle error on updateDoc", async () => {
        (updateDoc as jest.Mock).mockRejectedValue(new Error("failed"));

        const consoleSpy = jest.spyOn(console, "error").mockImplementation();

        await SetUserName("mockUId", "username");

        expect(consoleSpy).toHaveBeenCalled();
      });
    });
  
    //Test for getPendingUsers
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
  
    //Test for setUserType
    describe("setUserType", () => {
      it("should update user type", async () => {
        (doc as jest.Mock).mockReturnValue("user-ref");
        (updateDoc as jest.Mock).mockResolvedValue(true);
  
        await setUserType("user123", 2);
        expect(updateDoc).toHaveBeenCalledWith("user-ref", { type: 2 });
      });
  
      it("should handle update errors", async () => {
        const error = new Error("DB error");
        (updateDoc as jest.Mock).mockRejectedValue(error);
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
        await expect(setUserType("invalid", 1)).rejects.toThrow("DB error");
        expect(consoleSpy).toHaveBeenCalledWith("Could not set user type", error);
      });
    });
  
    //Test for sendEmail
    describe("sendEmail", () => {
      const mockSendMail = __mockTransporter.sendMail;

      let consoleSpy: jest.SpyInstance;
    
      beforeEach(() => {
        mockSendMail.mockClear();
        consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      });
    
      afterEach(() => {
        consoleSpy.mockRestore();
      });

      it('should handle email errors', async () => {
        const testError = new Error('SMTP error');
        mockSendMail.mockImplementationOnce((mailOptions: any, callback: any) => {
          callback(testError, null);
        });
    
        await expect(sendEmail('test@test.com', 'Subject', 'Body'))
          .rejects.toThrow('SMTP error');
    
        expect(consoleSpy).toHaveBeenCalledWith(
          'Email send error:',
          expect.objectContaining({ message: 'SMTP error' })
        );
      });
    
      it('should handle successful email sending', async () => {
        await expect(sendEmail('test@test.com', 'Subject', 'Body'))
          .resolves.toBe('250 OK');
      });
    });
  
    //test for uploadFile
    describe("uploadFile", () => {
      it("should handle successful upload", async () => {
        (uploadBytesResumable as jest.Mock).mockReturnValue({
          snapshot: { ref: "file-ref" },
          on: jest.fn((_, __, ___, onComplete) => onComplete())
        });
        (getDownloadURL as jest.Mock).mockResolvedValue("http://example.com/file");
  
        await expect(uploadFile(new File([], "test.txt"), "path", "name"))
          .resolves.toBe("http://example.com/file");
      });
  
      it("should handle upload errors", async () => {
        const error = new Error("Upload failed");
        (uploadBytesResumable as jest.Mock).mockReturnValue({
          on: jest.fn().mockImplementation((_, __, onError) => onError(error))
        });
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
        await expect(uploadFile(new File([], "test.txt"), "path", "name"))
          .rejects.toThrow("Upload failed");
        expect(consoleSpy).toHaveBeenCalledWith("Upload failed", error);
      });
    
      it("should handle downloadUrl error", async () => {
        (uploadBytesResumable as jest.Mock).mockReturnValue({
          snapshot: { ref: "file-ref" },
          on: jest.fn((_, __, ___, onComplete) => onComplete())
        });
        (getDownloadURL as jest.Mock).mockRejectedValue(new Error("failed"));
  
        await expect(uploadFile(new File([], "test.txt"), "path", "name"))
          .rejects.toBe("Failed to retrieve download url")
      });
    });
  });