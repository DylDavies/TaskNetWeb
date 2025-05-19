// __tests__/app/api/application-routes.test.ts
import { NextRequest } from 'next/server';
import * as firestore from 'firebase/firestore';
import ApplicationStatus from '@/app/enums/ApplicationStatus.enum';
import { makeApplicationID as actualMakeApplicationID } from '@/app/server/services/ApplicationService'; // For type, will be mocked

// Import route handlers
import { PATCH as patchApplicationAccept } from '@/app/api/application/accept/[aid]/route';
import { POST as postApplicationAdd } from '@/app/api/application/add/route';
import { GET as getApplicationApplied } from '@/app/api/application/applied/[jid]/[aid]/route';
import { PATCH as patchApplicationDeny } from '@/app/api/application/deny/[aid]/route';
import { GET as getApplicationGetAid } from '@/app/api/application/get/[aid]/route';
import { GET as getApplicationGetPending } from '@/app/api/application/get/pending/[jid]/route';

// --- Mocks ---
// Mock next/server
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

// Mock Firebase
const mockDbObject = { type: 'mocked-db-instance-application' };
jest.mock('../../../src/app/firebase', () => ({
  db: { type: 'mocked-db-instance-application' },
}));

// Mock ApplicationService
jest.mock('../../../src/app/server/services/ApplicationService', () => ({
  makeApplicationID: jest.fn((jobId, applicantId) => `${jobId}_${applicantId}`),
}));


// Mock firebase/firestore
jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('firebase/firestore'),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn((fieldPath, opStr, value) => ({ _type: 'mocked_QueryConstraint', fieldPath, opStr, value })),
}));


describe('API Routes: Application', () => {
  let mockRequest: NextRequest;
  const { NextResponse: MockNextResponse } = jest.requireMock('next/server');
  const { makeApplicationID } = jest.requireMock('../../../src/app/server/services/ApplicationService');
  let consoleErrorSpy: jest.SpyInstance;
  let abortController: AbortController;

  // Helper to create a mock request
  const createMockRequest = (method: string = 'GET') => {
    abortController = new AbortController();
    return {
      json: jest.fn(),
      nextUrl: { searchParams: new URLSearchParams() } as URL,
      headers: new Headers(),
      url: 'http://localhost/api/test',
      method: method, // Set method during creation
      clone: jest.fn(() => ({ ...mockRequest })),
      signal: abortController.signal,
      cookies: {
        get: jest.fn(),
        getAll: jest.fn(),
        has: jest.fn(),
        set: jest.fn(),
        delete: jest.fn(),
        clear: jest.fn(),
      } as any,
      body: null,
    } as unknown as NextRequest;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (MockNextResponse.json as jest.Mock).mockClear();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    // mockRequest will be created in specific describe/beforeEach blocks
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    if (abortController) {
      abortController.abort(); 
    }
  });

  // --- /api/application/accept/[aid] ---
  describe('PATCH /api/application/accept/[aid]', () => {
    const mockAid = 'test-app-id-accept';
    const mockDocRef = { id: mockAid, path: `applications/${mockAid}` };

    beforeEach(() => {
        mockRequest = createMockRequest('PATCH'); // Create request with PATCH method
        (firestore.doc as jest.Mock).mockReturnValue(mockDocRef);
    });

    it('should accept an application and return 200', async () => {
      (firestore.updateDoc as jest.Mock).mockResolvedValueOnce(undefined);

      const params = { aid: mockAid };
      const response = await patchApplicationAccept(mockRequest, { params: Promise.resolve(params) });

      expect(firestore.doc).toHaveBeenCalledWith(mockDbObject, 'applications', mockAid);
      expect(firestore.updateDoc).toHaveBeenCalledWith(mockDocRef, {
        Status: ApplicationStatus.Approved,
      });
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({});
    });

    it('should return 500 if Firestore update fails', async () => {
      const firestoreError = new Error('Firestore update failed');
      (firestore.updateDoc as jest.Mock).mockRejectedValueOnce(firestoreError);

      const params = { aid: mockAid };
      const response = await patchApplicationAccept(mockRequest, { params: Promise.resolve(params) });

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.message).toBe('Error accepting applicant');
      expect(body.error).toEqual(firestoreError);
    });
  });

  // --- /api/application/add ---
  describe('POST /api/application/add', () => {
    const mockApplicationData = {
      ApplicantID: 'applicant123',
      BidAmount: 100,
      CVURL: 'http://example.com/cv.pdf',
      EstimatedTimeline: 7,
      JobID: 'job456',
      ApplicantionID: 'app789', 
      ApplicationDate: Date.now(),
    };
    const mockDocRef = { id: mockApplicationData.ApplicantionID, path: `applications/${mockApplicationData.ApplicantionID}` };

    beforeEach(() => {
        mockRequest = createMockRequest('POST'); // Create request with POST method
        (firestore.doc as jest.Mock).mockReturnValue(mockDocRef);
        (firestore.setDoc as jest.Mock).mockResolvedValue(undefined);
    });

    it('should add an application and return 200', async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue(mockApplicationData);

      const response = await postApplicationAdd(mockRequest);

      expect(mockRequest.json).toHaveBeenCalled();
      expect(firestore.doc).toHaveBeenCalledWith(mockDbObject, 'applications', mockApplicationData.ApplicantionID);
      expect(firestore.setDoc).toHaveBeenCalledWith(mockDocRef, {
        ApplicantID: mockApplicationData.ApplicantID,
        ApplicationDate: mockApplicationData.ApplicationDate,
        BidAmount: mockApplicationData.BidAmount,
        CVURL: mockApplicationData.CVURL,
        EstimatedTimeline: mockApplicationData.EstimatedTimeline,
        JobID: mockApplicationData.JobID,
        Status: ApplicationStatus.Pending,
      });
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({});
    });

    it('should return 500 if request body parsing fails', async () => {
        const jsonError = new Error('Invalid JSON');
        (mockRequest.json as jest.Mock).mockRejectedValue(jsonError);
        const response = await postApplicationAdd(mockRequest);
        expect(response.status).toBe(500);
        const body = await response.json();
        expect(body.message).toBe('Error adding application');
        expect(body.error).toEqual(jsonError);
    });


    it('should return 500 if Firestore setDoc fails', async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue(mockApplicationData);
      const firestoreError = new Error('Firestore setDoc failed');
      (firestore.setDoc as jest.Mock).mockRejectedValueOnce(firestoreError);

      const response = await postApplicationAdd(mockRequest);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.message).toBe('Error adding application');
      expect(body.error).toEqual(firestoreError);
    });
  });

  // --- /api/application/applied/[jid]/[aid] ---
  describe('GET /api/application/applied/[jid]/[aid]', () => {
    const mockJid = 'jobTestId';
    const mockAid = 'applicantTestId';
    const mockCombinedId = `${mockJid}_${mockAid}`; 
    const mockDocRef = { id: mockCombinedId, path: `applications/${mockCombinedId}` };

    beforeEach(() => {
        mockRequest = createMockRequest('GET');
        (firestore.doc as jest.Mock).mockReturnValue(mockDocRef);
        (makeApplicationID as jest.Mock).mockReturnValue(mockCombinedId);
    });

    it('should return true if application exists', async () => {
      (firestore.getDoc as jest.Mock).mockResolvedValueOnce({ exists: () => true, data: () => ({ some: 'data' }) });
      const params = { jid: mockJid, aid: mockAid };
      const response = await getApplicationApplied(mockRequest, { params: Promise.resolve(params) });

      expect(makeApplicationID).toHaveBeenCalledWith(mockJid, mockAid);
      expect(firestore.doc).toHaveBeenCalledWith(mockDbObject, 'applications', mockCombinedId);
      expect(firestore.getDoc).toHaveBeenCalledWith(mockDocRef);
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({ result: true });
    });

    it('should return false if application does not exist', async () => {
      (firestore.getDoc as jest.Mock).mockResolvedValueOnce({ exists: () => false });
      const params = { jid: mockJid, aid: mockAid };
      const response = await getApplicationApplied(mockRequest, { params: Promise.resolve(params) });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({ result: false });
    });

    it('should return 500 if Firestore getDoc fails', async () => {
      const firestoreError = new Error('Firestore getDoc failed');
      (firestore.getDoc as jest.Mock).mockRejectedValueOnce(firestoreError);
      const params = { jid: mockJid, aid: mockAid };
      const response = await getApplicationApplied(mockRequest, { params: Promise.resolve(params) });

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.message).toBe('Error adding application'); 
      expect(body.error).toEqual(firestoreError);
    });
  });

  // --- /api/application/deny/[aid] ---
  describe('PATCH /api/application/deny/[aid]', () => {
    const mockAidDeny = 'test-app-id-deny';
    const mockDocRefDeny = { id: mockAidDeny, path: `applications/${mockAidDeny}` };

     beforeEach(() => {
        mockRequest = createMockRequest('PATCH');
        (firestore.doc as jest.Mock).mockReturnValue(mockDocRefDeny);
    });

    it('should deny an application and return 200', async () => {
      (firestore.updateDoc as jest.Mock).mockResolvedValueOnce(undefined);
      const params = { aid: mockAidDeny };
      const response = await patchApplicationDeny(mockRequest, { params: Promise.resolve(params) });

      expect(firestore.doc).toHaveBeenCalledWith(mockDbObject, 'applications', mockAidDeny);
      expect(firestore.updateDoc).toHaveBeenCalledWith(mockDocRefDeny, {
        Status: ApplicationStatus.Denied,
      });
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({});
    });

    it('should return 500 if Firestore update fails', async () => {
      const firestoreError = new Error('Firestore update failed for deny');
      (firestore.updateDoc as jest.Mock).mockRejectedValueOnce(firestoreError);
      const params = { aid: mockAidDeny };
      const response = await patchApplicationDeny(mockRequest, { params: Promise.resolve(params) });

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.message).toBe('Error accepting applicant'); 
      expect(body.error).toEqual(firestoreError);
    });
  });

  // --- /api/application/get/[aid] ---
  describe('GET /api/application/get/[aid]', () => {
    const mockAidGet = 'appGet123';
    const mockDocRefGet = { id: mockAidGet, path: `applications/${mockAidGet}` };
    const mockAppData = { JobID: 'job1', ApplicantID: 'user1', Status: ApplicationStatus.Pending };

    beforeEach(() => {
        mockRequest = createMockRequest('GET');
        (firestore.doc as jest.Mock).mockReturnValue(mockDocRefGet);
    });

    it('should return application data if found', async () => {
      (firestore.getDoc as jest.Mock).mockResolvedValueOnce({ exists: () => true, data: () => mockAppData });
      const params = { aid: mockAidGet };
      const response = await getApplicationGetAid(mockRequest, { params: Promise.resolve(params) });

      expect(firestore.doc).toHaveBeenCalledWith(mockDbObject, "applications", mockAidGet);
      expect(firestore.getDoc).toHaveBeenCalledWith(mockDocRefGet);
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({ result: mockAppData });
    });

    it('should return null if application not found', async () => {
      (firestore.getDoc as jest.Mock).mockResolvedValueOnce({ exists: () => false });
      const params = { aid: mockAidGet };
      const response = await getApplicationGetAid(mockRequest, { params: Promise.resolve(params) });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({ result: null });
    });
  });

  // --- /api/application/get/pending/[jid] ---
  describe('GET /api/application/get/pending/[jid]', () => {
    const mockJidPending = 'jobPending123';
    const mockCollectionRef = { _id: 'mockApplicationsCollection' };
    const mockQueryInstance = { _id: 'mockQueryInstance' };

    const app1Data = { ApplicantID: 'user1', ApplicationDate: Date.now(), BidAmount: 50, CVURL: 'cv1.pdf', EstimatedTimeline: 5, JobID: mockJidPending, Status: ApplicationStatus.Pending };
    const app2Data = { ApplicantID: 'user2', ApplicationDate: Date.now(), BidAmount: 75, CVURL: 'cv2.pdf', EstimatedTimeline: 10, JobID: mockJidPending, Status: ApplicationStatus.Pending };
    const user1DocData = { username: 'Applicant One' };
    const user2DocData = { username: 'Applicant Two' };


    beforeEach(() => {
        mockRequest = createMockRequest('GET');
        (firestore.collection as jest.Mock).mockReturnValue(mockCollectionRef);
        (firestore.query as jest.Mock).mockReturnValue(mockQueryInstance);
        (firestore.where as jest.Mock).mockImplementation((field, op, value) => ({field, op, value, _isMockConstraint: true})); 
    });

    it('should return pending applications with usernames', async () => {
      const mockAppDocs = [
        { id: 'app1', data: () => app1Data },
        { id: 'app2', data: () => app2Data },
      ];
      (firestore.getDocs as jest.Mock).mockResolvedValueOnce({ docs: mockAppDocs, empty: false, size: 2 });

      (firestore.doc as jest.Mock)
        .mockImplementation((db, collectionName, id) => ({ _type: 'mockDocRef', id, collectionName }));

      (firestore.getDoc as jest.Mock)
        .mockImplementation(async (docRef: any) => {
            if (docRef.collectionName === 'users' && docRef.id === 'user1') return { exists: () => true, data: () => user1DocData };
            if (docRef.collectionName === 'users' && docRef.id === 'user2') return { exists: () => true, data: () => user2DocData };
            return { exists: () => false };
        });


      const params = { jid: mockJidPending };
      const response = await getApplicationGetPending(mockRequest, { params: Promise.resolve(params) });

      expect(firestore.collection).toHaveBeenCalledWith(mockDbObject, 'applications');
      expect(firestore.where).toHaveBeenCalledWith('Status', '==', ApplicationStatus.Pending);
      expect(firestore.where).toHaveBeenCalledWith('JobID', '==', mockJidPending);
      expect(firestore.query).toHaveBeenCalledWith(mockCollectionRef, expect.anything(), expect.anything()); 
      expect(firestore.getDocs).toHaveBeenCalledWith(mockQueryInstance);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.results).toHaveLength(2);
      expect(body.results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ ApplicationID: 'app1', ...app1Data, username: 'Applicant One' }),
          expect.objectContaining({ ApplicationID: 'app2', ...app2Data, username: 'Applicant Two' }),
        ])
      );
    });

    it('should handle no pending applications', async () => {
        (firestore.getDocs as jest.Mock).mockResolvedValueOnce({ docs: [], empty: true, size: 0 });
        const params = { jid: mockJidPending };
        const response = await getApplicationGetPending(mockRequest, { params: Promise.resolve(params) });
        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.results).toEqual([]);
    });

    it('should handle missing username for an applicant', async () => {
        const appOnlyData = { ApplicantID: 'userOnly', ApplicationDate: Date.now(), BidAmount: 60, CVURL: 'cvOnly.pdf', EstimatedTimeline: 6, JobID: mockJidPending, Status: ApplicationStatus.Pending };
        const mockAppDocs = [{ id: 'appOnly', data: () => appOnlyData }];
        (firestore.getDocs as jest.Mock).mockResolvedValueOnce({ docs: mockAppDocs, empty: false, size: 1 });
         (firestore.doc as jest.Mock)
        .mockImplementation((db, collectionName, id) => ({ _type: 'mockDocRef', id, collectionName }));
        (firestore.getDoc as jest.Mock).mockImplementation(async (docRef: any) => {
             if (docRef.collectionName === 'users' && docRef.id === 'userOnly') return { exists: () => true, data: () => ({}) }; 
             return { exists: () => false };
        });


        const params = { jid: mockJidPending };
        const response = await getApplicationGetPending(mockRequest, { params: Promise.resolve(params) });
        const body = await response.json();
        expect(body.results[0].username).toBe("No username");
    });

     it('should handle user document not existing for an applicant', async () => {
        const appNoUserDocData = { ApplicantID: 'userNoDoc', ApplicationDate: Date.now(), BidAmount: 60, CVURL: 'cvNoDoc.pdf', EstimatedTimeline: 6, JobID: mockJidPending, Status: ApplicationStatus.Pending };
        const mockAppDocs = [{ id: 'appNoUser', data: () => appNoUserDocData }];
        (firestore.getDocs as jest.Mock).mockResolvedValueOnce({ docs: mockAppDocs, empty: false, size: 1 });
        (firestore.doc as jest.Mock)
        .mockImplementation((db, collectionName, id) => ({ _type: 'mockDocRef', id, collectionName }));
        (firestore.getDoc as jest.Mock).mockImplementation(async (docRef: any) => {
             if (docRef.collectionName === 'users' && docRef.id === 'userNoDoc') return { exists: () => false }; 
             return { exists: () => false };
        });

        const params = { jid: mockJidPending };
        const response = await getApplicationGetPending(mockRequest, { params: Promise.resolve(params) });
        const body = await response.json();
        expect(body.results[0].username).toBe("No username");
    });


    it('should handle error during getDocs for applications', async () => {
        const firestoreError = new Error('Firestore getDocs failed for applications');
        (firestore.getDocs as jest.Mock).mockRejectedValueOnce(firestoreError);

        const params = { jid: mockJidPending };
        await expect(getApplicationGetPending(mockRequest, { params: Promise.resolve(params) }))
            .rejects.toThrow('Firestore getDocs failed for applications');
    });
  });
});
