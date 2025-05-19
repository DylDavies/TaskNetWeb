// __tests__/app/api/notification-routes.test.ts
import { NextRequest } from 'next/server';
// Corrected: db is imported but its mock is what's used.
import { db as actualDbInstanceForAssertion } from '../../../src/app/firebase'; 
import * as firestore from 'firebase/firestore';
import Notification from '../../../src/app/interfaces/Notification.interface';
import FSNotification from '../../../src/app/interfaces/FSNotification.interface';
// Corrected: Removed .ts extension
import NotificationActionType from '../../../src/app/enums/NotificationActionType.enum'; 

// Import route handlers
import { POST as postNotificationsAseen } from '@/app/api/notifications/aseen/route';
import { POST as postNotificationsCreate } from '@/app/api/notifications/create/route';
import { DELETE as deleteNotificationsDelete } from '@/app/api/notifications/delete/route';
import { GET as getNotificationsGetUid } from '@/app/api/notifications/get/[uid]/route';
import { PATCH as patchNotificationsSeen } from '@/app/api/notifications/seen/route';

// Mock NotificationService functions
jest.mock('../../../src/app/server/services/NotificationService', () => ({
  toDB: jest.fn(data => ({ ...data, _toDBProcessed: true })), 
  fromDB: jest.fn(data => ({ ...data, _fromDBProcessed: true })), 
}));

// --- Common Mocks ---
jest.mock('next/server', () => {
  const actualNextServer = jest.requireActual('next/server');
  return {
    ...actualNextServer,
    NextResponse: {
      ...actualNextServer.NextResponse,
      json: jest.fn((body, init) => ({
        json: async () => body,
        text: async () => JSON.stringify(body),
        status: init?.status || 200,
        ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300,
        headers: new Headers(init?.headers),
      })),
    },
  };
});

// This is the mock for the db instance itself.
const mockDbObject = { type: 'mocked-db-instance' }; // A simple identifiable object
jest.mock('../../../src/app/firebase', () => ({
  db: { type: 'mocked-db-instance' }, // Route will import this mocked db object
}));

// Define implementations for batch methods and the writeBatch creator function
const mockBatchUpdateImpl = jest.fn();
const mockBatchCommitImpl = jest.fn();
const mockWriteBatchFactory = jest.fn((...args: any[]) => ({ 
  update: mockBatchUpdateImpl,
  commit: mockBatchCommitImpl,
}));

jest.mock('firebase/firestore', () => {
  const originalModule = jest.requireActual('firebase/firestore');
  return {
    ...originalModule,
    collection: jest.fn(),
    doc: jest.fn(),
    setDoc: jest.fn(),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    updateDoc: jest.fn(),
    query: jest.fn(),
    where: jest.fn((fieldPath, opStr, value) => ({ _type: 'mocked_QueryConstraint', fieldPath, opStr, value })),
    and: jest.fn((...constraints) => ({ _type: 'mocked_AndConstraint', constraints })),
    writeBatch: (...args: any[]) => mockWriteBatchFactory(...args), 
    addDoc: jest.fn(),
  };
});


describe('API Routes: Notifications', () => {
  let mockRequest: NextRequest;
  const { NextResponse: MockNextResponse } = jest.requireMock('next/server');
  const { toDB: mockToDB, fromDB: mockFromDB } = jest.requireMock('../../../src/app/server/services/NotificationService');
  let dateSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    (MockNextResponse.json as jest.Mock).mockClear();
    
    mockBatchUpdateImpl.mockClear();
    mockBatchCommitImpl.mockClear();
    mockWriteBatchFactory.mockClear(); 

    mockRequest = {
      json: jest.fn(),
      nextUrl: { searchParams: new URLSearchParams() },
      headers: new Headers(),
    } as unknown as NextRequest;
  });
  
  afterEach(() => {
    if (dateSpy) {
      dateSpy.mockRestore();
    }
  });


  // --- /api/notifications/aseen ---
  describe('/api/notifications/aseen (POST)', () => {
    beforeEach(() => {
        (firestore.doc as jest.Mock).mockImplementation((db, path, id) => ({ _id: `doc-${id}`, path: `${path}/${id}` })); 
        mockBatchCommitImpl.mockResolvedValue(undefined); 
    });

    it('should mark multiple notifications as seen', async () => {
      const uids = ['notif1', 'notif2'];
      (mockRequest.json as jest.Mock).mockResolvedValue({ uids });

      await postNotificationsAseen(mockRequest);

      expect(mockRequest.json).toHaveBeenCalled();
      // Check that writeBatch was called with our mocked db object
      expect(mockWriteBatchFactory).toHaveBeenCalledWith(mockDbObject); 
      expect(firestore.doc).toHaveBeenCalledWith(mockDbObject, "notifications", uids[0]);
      expect(firestore.doc).toHaveBeenCalledWith(mockDbObject, "notifications", uids[1]);
      expect(mockBatchUpdateImpl).toHaveBeenCalledTimes(2);
      expect(mockBatchUpdateImpl).toHaveBeenCalledWith(expect.objectContaining({ _id: 'doc-notif1' }), { seen: true });
      expect(mockBatchUpdateImpl).toHaveBeenCalledWith(expect.objectContaining({ _id: 'doc-notif2' }), { seen: true });
      expect(mockBatchCommitImpl).toHaveBeenCalled();

      const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
      expect(mockCallArgs[1]?.status).toBe(200);
      expect(mockCallArgs[0]).toEqual({});
    });

    it('should handle empty uids array gracefully', async () => {
        (mockRequest.json as jest.Mock).mockResolvedValue({ uids: [] });
        await postNotificationsAseen(mockRequest);
        expect(mockWriteBatchFactory).toHaveBeenCalledWith(mockDbObject);
        expect(mockBatchUpdateImpl).not.toHaveBeenCalled();
        expect(mockBatchCommitImpl).toHaveBeenCalled(); 
        const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
        expect(mockCallArgs[1]?.status).toBe(200);
    });

    it('should return 500 if batch commit fails', async () => {
      const uids = ['notif1'];
      (mockRequest.json as jest.Mock).mockResolvedValue({ uids });
      const error = new Error('Batch commit failed');
      mockBatchCommitImpl.mockRejectedValue(error); 

      await postNotificationsAseen(mockRequest);

      expect(mockWriteBatchFactory).toHaveBeenCalledWith(mockDbObject);
      expect(mockBatchUpdateImpl).toHaveBeenCalledWith(expect.objectContaining({ _id: 'doc-notif1' }), { seen: true });
      expect(mockBatchCommitImpl).toHaveBeenCalled(); 

      const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
      expect(mockCallArgs[1]?.status).toBe(500);
      expect(mockCallArgs[0].message).toBe("Error marking all notifications as seen");
      expect(mockCallArgs[0].error).toEqual(error); 
    });
  });

  // --- /api/notifications/create ---
  describe('/api/notifications/create (POST)', () => {
    const mockNotificationPayload: Omit<Notification, "uid" | "sentTime" | "deleted"> = {
      uidFor: 'user123',
      message: 'You have a new message regarding a job.',
      seen: false,
      action: { 
        type: NotificationActionType.goToFreelancerJob, 
        locationUid: 'jobOrApplicationUid123', 
      },
    };
    const mockCollectionRef = { _id: 'mockNotificationsCollectionCreate' };
    const mockAddedDocRef = { id: 'newNotifId123', path: 'notifications/newNotifId123' }; 

    beforeEach(() => {
      (firestore.collection as jest.Mock).mockReturnValue(mockCollectionRef);
      (firestore.addDoc as jest.Mock).mockResolvedValue(mockAddedDocRef); 
      (firestore.setDoc as jest.Mock).mockResolvedValue(undefined);
      (mockToDB as jest.Mock).mockImplementation(data => ({ ...data, _toDBProcessed: true }));
    });

    it('should create a notification successfully', async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue(mockNotificationPayload);
      const fixedDate = new Date('2024-05-18T12:00:00.000Z');
      dateSpy = jest.spyOn(global, 'Date').mockImplementation(() => fixedDate);

      await postNotificationsCreate(mockRequest);

      expect(mockRequest.json).toHaveBeenCalled();
      expect(firestore.collection).toHaveBeenCalledWith(mockDbObject, "notifications");
      expect(firestore.addDoc).toHaveBeenCalledWith(mockCollectionRef, mockNotificationPayload);
      
      const expectedFullNotificationData: Notification = {
        uid: mockAddedDocRef.id,
        sentTime: fixedDate, 
        deleted: false,
        ...mockNotificationPayload,
      };
      expect(mockToDB).toHaveBeenCalledWith(expectedFullNotificationData);
      expect(firestore.setDoc).toHaveBeenCalledWith(mockAddedDocRef, { ...expectedFullNotificationData, _toDBProcessed: true }); 
      
      const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
      expect(mockCallArgs[1]?.status).toBe(200);
      expect(mockCallArgs[0]).toEqual({});
    });

    it('should create a notification successfully without an action', async () => {
        const payloadWithoutAction: Omit<Notification, "uid" | "sentTime" | "deleted" | "action"> = {
            uidFor: 'user456',
            message: 'A simple notification.',
            seen: false,
          };
        (mockRequest.json as jest.Mock).mockResolvedValue(payloadWithoutAction);
        
        const fixedDate = new Date('2024-05-19T10:00:00.000Z');
        if(dateSpy) dateSpy.mockRestore(); 
        dateSpy = jest.spyOn(global, 'Date').mockImplementation(() => fixedDate);
  
        await postNotificationsCreate(mockRequest);
  
        expect(firestore.addDoc).toHaveBeenCalledWith(mockCollectionRef, payloadWithoutAction);
        const dataPassedToSetDoc = (firestore.setDoc as jest.Mock).mock.calls[0][1];
        expect(dataPassedToSetDoc).not.toHaveProperty('action');
        expect(dataPassedToSetDoc).toEqual(expect.objectContaining({ 
            uid: mockAddedDocRef.id,
            sentTime: fixedDate,
            deleted: false,
            uidFor: 'user456',
            message: 'A simple notification.',
            seen: false,
            _toDBProcessed: true 
          }));
      });

    it('should return 500 if addDoc fails', async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue(mockNotificationPayload);
      const error = new Error('addDoc failed');
      (firestore.addDoc as jest.Mock).mockRejectedValue(error); 

      await postNotificationsCreate(mockRequest);
      const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
      expect(mockCallArgs[1]?.status).toBe(500);
      expect(mockCallArgs[0].message).toBe("Error creating notification");
    });

    it('should return 500 if setDoc fails', async () => {
        (mockRequest.json as jest.Mock).mockResolvedValue(mockNotificationPayload);
        const error = new Error('setDoc failed');
        (firestore.setDoc as jest.Mock).mockRejectedValue(error);
  
        await postNotificationsCreate(mockRequest);
        const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
        expect(mockCallArgs[1]?.status).toBe(500);
        expect(mockCallArgs[0].message).toBe("Error creating notification");
      });
  });
  
  describe('/api/notifications/delete (DELETE)', () => {
    const mockDocRefDelete = { _id: 'mockDocRefDelete' };
    beforeEach(() => {
        (firestore.doc as jest.Mock).mockReturnValue(mockDocRefDelete);
        (firestore.updateDoc as jest.Mock).mockResolvedValue(undefined);
    });

    it('should mark a notification as deleted', async () => {
      const uid = 'notifToDelete123';
      (mockRequest.json as jest.Mock).mockResolvedValue({ uid });

      await deleteNotificationsDelete(mockRequest);

      expect(firestore.doc).toHaveBeenCalledWith(mockDbObject, "notifications", uid);
      expect(firestore.updateDoc).toHaveBeenCalledWith(mockDocRefDelete, { deleted: true });
      
      const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
      expect(mockCallArgs[1]?.status).toBe(200);
      expect(mockCallArgs[0]).toEqual({});
    });

    it('should return 500 if updateDoc fails', async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue({ uid: 'notif1' });
      const error = new Error('updateDoc failed');
      (firestore.updateDoc as jest.Mock).mockRejectedValue(error);
      
      await deleteNotificationsDelete(mockRequest);
      const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
      expect(mockCallArgs[1]?.status).toBe(500);
      expect(mockCallArgs[0].message).toBe("Error deleting notification");
    });
  });

  describe('/api/notifications/get/[uid] (GET)', () => {
    const mockParamsGet = { uid: 'user123Get' }; 
    const mockCollectionRefGet = { _id: 'mockNotificationsCollectionGet' };
    const mockQueryInstanceGet = { _id: 'mockQueryInstanceGet' };

    const rawNotif1: FSNotification = { 
      uid: 'notifId1Get', 
      uidFor: 'user123Get', 
      message: 'Message for notification 1 GET',
      seen: false, 
      sentTime: new Date('2024-01-01T10:00:00.000Z').getTime(), 
      deleted: false, 
      action: { 
        type: NotificationActionType.goToFreelancerJob, 
        locationUid: 'relevantUid1Get' 
      } 
    };
    const rawNotif2: FSNotification = { 
      uid: 'notifId2Get',
      uidFor: 'user123Get', 
      message: 'Message for notification 2 GET, seen',
      seen: true, 
      sentTime: new Date('2024-01-02T10:00:00.000Z').getTime(), 
      deleted: false, 
    };

    beforeEach(() => {
        (firestore.collection as jest.Mock).mockReturnValue(mockCollectionRefGet);
        (firestore.query as jest.Mock).mockReturnValue(mockQueryInstanceGet);
        (mockFromDB as jest.Mock).mockImplementation(data => ({ ...data, _fromDBProcessed: true }));
    });

    it('should fetch notifications for a user', async () => {
      const mockDocs = [
        { data: () => rawNotif1 },
        { data: () => rawNotif2 },
      ];
      (firestore.getDocs as jest.Mock).mockResolvedValue({ docs: mockDocs, forEach: (cb: any) => mockDocs.forEach(cb) });

      await getNotificationsGetUid(mockRequest, { params: Promise.resolve(mockParamsGet) });

      expect(firestore.collection).toHaveBeenCalledWith(mockDbObject, "notifications");
      expect(firestore.where).toHaveBeenCalledWith("uidFor", "==", mockParamsGet.uid);
      expect(firestore.where).toHaveBeenCalledWith("deleted", "==", false);
      expect(firestore.and).toHaveBeenCalledWith(
        expect.objectContaining({ fieldPath: "uidFor", value: mockParamsGet.uid }),
        expect.objectContaining({ fieldPath: "deleted", value: false })
      );
      expect(firestore.query).toHaveBeenCalledWith(mockCollectionRefGet, expect.objectContaining({_type: 'mocked_AndConstraint'}));
      expect(firestore.getDocs).toHaveBeenCalledWith(mockQueryInstanceGet);
      expect(mockFromDB).toHaveBeenCalledWith(rawNotif1);
      expect(mockFromDB).toHaveBeenCalledWith(rawNotif2);

      const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
      expect(mockCallArgs[1]?.status).toBe(200);
      expect(mockCallArgs[0].results).toEqual([
        { ...rawNotif1, _fromDBProcessed: true },
        { ...rawNotif2, _fromDBProcessed: true },
      ]);
    });

    it('should return empty array if no notifications found', async () => {
        (firestore.getDocs as jest.Mock).mockResolvedValue({ docs: [], forEach: (cb: any) => [].forEach(cb) });
        await getNotificationsGetUid(mockRequest, { params: Promise.resolve(mockParamsGet) });
        const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
        expect(mockCallArgs[0].results).toEqual([]);
    });
    
    it('should return 500 if Firestore getDocs fails', async () => {
        const error = new Error('Firestore getDocs failed');
        (firestore.getDocs as jest.Mock).mockRejectedValue(error);
        await getNotificationsGetUid(mockRequest, { params: Promise.resolve(mockParamsGet) });
        const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
        expect(mockCallArgs[1]?.status).toBe(500);
        expect(mockCallArgs[0].message).toBe("Error marking all notifications as seen"); 
      });
  });

  describe('/api/notifications/seen (PATCH)', () => {
    const mockDocRefSeen = { _id: 'mockDocRefSeen' };
    beforeEach(() => {
        (firestore.doc as jest.Mock).mockReturnValue(mockDocRefSeen);
        (firestore.updateDoc as jest.Mock).mockResolvedValue(undefined);
    });

    it('should mark a notification as seen/unseen', async () => {
      const payload = { uid: 'notif123', seen: true };
      (mockRequest.json as jest.Mock).mockResolvedValue(payload);

      await patchNotificationsSeen(mockRequest);

      expect(firestore.doc).toHaveBeenCalledWith(mockDbObject, "notifications", payload.uid);
      expect(firestore.updateDoc).toHaveBeenCalledWith(mockDocRefSeen, { seen: payload.seen });

      const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
      expect(mockCallArgs[1]?.status).toBe(200);
      expect(mockCallArgs[0]).toEqual({});
    });
    
    it('should return 500 if updateDoc fails', async () => {
        (mockRequest.json as jest.Mock).mockResolvedValue({ uid: 'notif1', seen: true });
        const error = new Error('updateDoc failed');
        (firestore.updateDoc as jest.Mock).mockRejectedValue(error);
        
        await patchNotificationsSeen(mockRequest);
        const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
        expect(mockCallArgs[1]?.status).toBe(500);
        expect(mockCallArgs[0].message).toBe("Error marking notification as seen");
      });
  });
});