import { 
    addDoc, collection, doc, updateDoc, getDocs, query, where, writeBatch, 
    and,
    setDoc
  } from "firebase/firestore";
  import { db } from "../../src/app/firebase";
  import { 
    createNotification, deleteNotification, setNotificationSeen, 
    getNotificationsForUser, fromDB, toDB, markAllNotificationsAsSeenForUser 
  } from "../../src/app/server/services/NotificationService";
  import Notification from "@/app/interfaces/Notification.interface";
  import FSNotification from "@/app/interfaces/FSNotification.interface";
import NotificationActionType from "@/app/enums/NotificationActionType.enum";
  
  jest.mock("firebase/firestore");
  
  const mockNotification: Notification = {
    uid: "notif123",
    message: "Test message",
    seen: false,
    sentTime: new Date(),
    uidFor: "user123",
    deleted: false,
    action: {
        locationUid: "mockUid",
        type: NotificationActionType.goToFreelancerJob
    }
  };
  
  const mockFSNotification: FSNotification = {
    ...mockNotification,
    sentTime: mockNotification.sentTime.getTime(),
    action: {
        locationUid: "mockUid",
        type: NotificationActionType.goToFreelancerJob
    }
  };
  
  describe("NotificationService", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    describe("Data Conversion", () => {
      it("fromDB should convert FSNotification to Notification", () => {
        const result = fromDB(mockFSNotification);
        expect(result.sentTime).toBeInstanceOf(Date);
        expect(result).toMatchObject(mockNotification);
      });
  
      it("toDB should convert Notification to FSNotification with action", () => {
        const result = toDB(mockNotification);
        expect(result.sentTime).toBe(mockNotification.sentTime.getTime());
        expect(result.action).toEqual({locationUid: "mockUid", type: 0});
      });
  
      it("toDB should convert Notification without action", () => {
        const notifWithoutAction = { ...mockNotification, action: undefined };
        const result = toDB(notifWithoutAction);
        expect(result.action).toBeUndefined();
      });
    });
  
    describe("createNotification", () => {
      it("should create a new notification", async () => {
        const mockDocRef = { id: "new-notif" };
        (addDoc as jest.Mock).mockResolvedValue(mockDocRef);
        (collection as jest.Mock).mockReturnValue("notifications-collection");
  
        await createNotification({
          message: "New message",
          uidFor: "user123",
          seen: false
        });
  
        expect(addDoc).toHaveBeenCalledWith("notifications-collection", expect.any(Object));
        expect(setDoc).toHaveBeenCalledWith(mockDocRef, expect.objectContaining({
          uid: "new-notif",
          deleted: false
        }));
      });
    });
  
    describe("deleteNotification", () => {
      it("should mark notification as deleted", async () => {
        await deleteNotification("notif123");
        expect(updateDoc).toHaveBeenCalledWith(doc(db, "notifications", "notif123"), {
          deleted: true
        });
      });
    });
  
    describe("setNotificationSeen", () => {
      it("should update seen status", async () => {
        await setNotificationSeen("notif123", true);
        expect(updateDoc).toHaveBeenCalledWith(doc(db, "notifications", "notif123"), {
          seen: true
        });
      });
    });
  
    describe("markAllNotificationsAsSeenForUser", () => {
        it("should batch update notifications", async () => {
            const mockBatch = { update: jest.fn(), commit: jest.fn() };
            (writeBatch as jest.Mock).mockReturnValue(mockBatch);
    
            await markAllNotificationsAsSeenForUser(["notif1", "notif2"]);
            
            expect(mockBatch.update).toHaveBeenCalledTimes(2);
            expect(mockBatch.commit).toHaveBeenCalled();
        });
  
        it("should handle batch commit errors", async () => {
            const mockBatch = { 
                update: jest.fn(), 
                commit: jest.fn().mockRejectedValue(new Error("Batch error"))
            };

            (writeBatch as jest.Mock).mockReturnValue(mockBatch);
            const consoleSpy = jest.spyOn(console, "error").mockImplementation();
        
            await markAllNotificationsAsSeenForUser(["notif1"])

            expect(consoleSpy).toHaveBeenCalled();
        });
    });
  
    describe("getNotificationsForUser", () => {
      it("should fetch user notifications", async () => {
        const mockSnapshot = {
          forEach: jest.fn(cb => cb({ data: () => mockFSNotification }))
        };

        (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);
        (query as jest.Mock).mockReturnValue("user-query");
        (and as jest.Mock).mockReturnValue({})
  
        const result = await getNotificationsForUser("user123");
        
        expect(query).toHaveBeenCalledWith(
          collection(db, "notifications"),
          expect.any(Object)
        );
        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject(mockNotification);
      });
    });
  });