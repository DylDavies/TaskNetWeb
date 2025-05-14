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
      global.fetch = jest.fn();
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
        (global.fetch as jest.Mock).mockReturnValue({status: 200});

        await createNotification({
          message: "New message",
          uidFor: "user123",
          seen: false
        });
  
        expect(fetch).toHaveBeenCalledWith("/api/notifications/create", {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: "New message",
            uidFor: "user123",
            seen: false
          })
        })
      });
    });
  
    describe("deleteNotification", () => {
      it("should mark notification as deleted", async () => {
        (global.fetch as jest.Mock).mockReturnValue({status: 200});

        await deleteNotification("notif123")

        expect(fetch).toHaveBeenCalledWith("/api/notifications/delete", {
          method: "DELETE",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({uid: "notif123"})
        })
      });
    });
  
    describe("setNotificationSeen", () => {
      it("should update seen status", async () => {
        (global.fetch as jest.Mock).mockReturnValue({status: 200});

        await setNotificationSeen("notif123", true);

        expect(fetch).toHaveBeenCalledWith("/api/notifications/seen", {
          method: "PATCH",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({uid: "notif123", seen: true})
        })
      });
    });
  
    describe("markAllNotificationsAsSeenForUser", () => {
        it("should batch update notifications", async () => {
          (global.fetch as jest.Mock).mockReturnValue({status: 200});

          await markAllNotificationsAsSeenForUser(["notif1", "notif2"]);

          expect(fetch).toHaveBeenCalledWith("/api/notifications/aseen", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({uids: ["notif1", "notif2"]})
          })
        });
  
        it("should handle batch commit errors", async () => {
          (global.fetch as jest.Mock).mockReturnValue({status: 500, json: async () => "error"});

          const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      
          await markAllNotificationsAsSeenForUser(["notif1"])

          expect(consoleSpy).toHaveBeenCalled();
        });
    });
  
    describe("getNotificationsForUser", () => {
      it("should fetch user notifications", async () => {
        (global.fetch as jest.Mock).mockReturnValue({status: 200, json: async () => ({ results: [mockNotification] })})
  
        const result = await getNotificationsForUser("user123");
        
        expect(fetch).toHaveBeenCalledWith("/api/notifications/get/user123", {
          method: "GET",
          headers: { 'Content-Type': 'application/json' }
        });

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject(mockNotification);
      });
    });
  });