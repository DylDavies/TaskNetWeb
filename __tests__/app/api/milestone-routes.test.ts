// __tests__/app/api/milestone-routes.test.ts
import { NextRequest } from 'next/server';
import { db } from '../../../src/app/firebase'; // Actual db import for types, will be mocked
import * as firestore from 'firebase/firestore';
import MilestoneData from '../../../src/app/interfaces/Milestones.interface';
import PaymentStatus from '../../../src/app/enums/PaymentStatus.enum';
import MilestoneStatus from '../../../src/app/enums/MilestoneStatus.enum';

// Import route handlers
import { POST as postMilestoneAdd } from '@/app/api/milestones/add/route';
import { GET as getMilestoneGetJid } from '@/app/api/milestones/get/[jid]/route';
import { PATCH as patchMilestonePayment } from '@/app/api/milestones/payment/route';
import { PATCH as patchMilestoneReportAdd } from '@/app/api/milestones/report/add/route';
import { PUT as putMilestoneSet } from '@/app/api/milestones/set/route';
import { PATCH as patchMilestoneStatus } from '@/app/api/milestones/status/route';

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

const mockDbObject = { type: 'mocked-db-instance-milestones' }; 
jest.mock('../../../src/app/firebase', () => ({
  db: { type: 'mocked-db-instance-milestones' }, 
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
    addDoc: jest.fn(), // Specifically for postMilestoneAdd
    // query, where, and, writeBatch are not used by these milestone routes based on provided files
  };
});


describe('API Routes: Milestones', () => {
  let mockRequest: NextRequest;
  const { NextResponse: MockNextResponse } = jest.requireMock('next/server');

  beforeEach(() => {
    jest.clearAllMocks();
    (MockNextResponse.json as jest.Mock).mockClear();

    mockRequest = {
      json: jest.fn(),
      nextUrl: { searchParams: new URLSearchParams() }, // For routes that might use query params
      headers: new Headers(),
    } as unknown as NextRequest;
  });

  // --- /api/milestones/add ---
  describe('/api/milestones/add (POST)', () => {
    const mockCollectionRef = { _id: 'milestonesCollectionRefAdd' };
    const mockAddedDocRef = { id: 'newMilestoneId123' };
    const mockMilestonePayload: MilestoneData = { 
        // Assuming MilestoneData includes an id, but addDoc typically generates it.
        // The route takes milestoneData which is then passed to addDoc.
        // The type in route is MilestoneData, but it's used in addDoc.
        // Let's assume the payload sent to the API doesn't have an ID yet.
        id: 'placeholder-id-payload', // This might be ignored by addDoc
        title: 'New Milestone',
        description: 'A test milestone',
        status: MilestoneStatus.InProgress,
        deadline: 20250101,
        payment: 100,
        reportURL: '',
        paymentStatus: PaymentStatus.Unpaid,
     };
    const mockJobId = 'jobWithNewMilestone';

    beforeEach(() => {
      (firestore.collection as jest.Mock).mockReturnValue(mockCollectionRef);
      (firestore.addDoc as jest.Mock).mockResolvedValue(mockAddedDocRef);
    });

    it('should add a new milestone successfully', async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue({ 
        jobID: mockJobId, 
        milestoneData: mockMilestonePayload 
      });

      await postMilestoneAdd(mockRequest);

      expect(mockRequest.json).toHaveBeenCalled();
      expect(firestore.collection).toHaveBeenCalledWith(mockDbObject, "Jobs", mockJobId, "milestones");
      expect(firestore.addDoc).toHaveBeenCalledWith(mockCollectionRef, mockMilestonePayload);

      const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
      expect(mockCallArgs[1]?.status).toBe(200);
      expect(mockCallArgs[0]).toEqual({ result: mockAddedDocRef.id });
    });

    it('should return 500 if addDoc fails', async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue({ 
        jobID: mockJobId, 
        milestoneData: mockMilestonePayload 
      });
      const error = new Error('addDoc failed');
      (firestore.addDoc as jest.Mock).mockRejectedValue(error);

      await postMilestoneAdd(mockRequest);
      const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
      expect(mockCallArgs[1]?.status).toBe(500);
      expect(mockCallArgs[0].message).toBe("Error adding milestone");
      expect(mockCallArgs[0].error).toEqual(error);
    });
  });

  // --- /api/milestones/get/[jid] ---
  describe('/api/milestones/get/[jid] (GET)', () => {
    const mockParams = { jid: 'job123' };
    const mockCollectionRef = { _id: 'milestonesCollectionRefGet' };
    const mockMilestone1Data: Omit<MilestoneData, "id"> = { title: 'M1', description: 'D1', status: MilestoneStatus.Completed, deadline: 20230101, payment: 10, reportURL: 'r1', paymentStatus: PaymentStatus.Paid};
    const mockMilestone2Data: Omit<MilestoneData, "id"> = { title: 'M2', description: 'D2', status: MilestoneStatus.InProgress, deadline: 20230201, payment: 20, reportURL: '', paymentStatus: PaymentStatus.Unpaid};


    beforeEach(() => {
      (firestore.collection as jest.Mock).mockReturnValue(mockCollectionRef);
    });

    it('should return milestones for a job ID', async () => {
      const mockDocs = [
        { id: 'msId1', data: () => mockMilestone1Data },
        { id: 'msId2', data: () => mockMilestone2Data },
      ];
      (firestore.getDocs as jest.Mock).mockResolvedValue({ docs: mockDocs, forEach: (cb: any) => mockDocs.forEach(cb) });

      await getMilestoneGetJid(mockRequest, { params: Promise.resolve(mockParams) });

      expect(firestore.collection).toHaveBeenCalledWith(mockDbObject, "Jobs", mockParams.jid, "milestones");
      expect(firestore.getDocs).toHaveBeenCalledWith(mockCollectionRef);
      
      const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
      expect(mockCallArgs[1]?.status).toBe(200);
      expect(mockCallArgs[0].results).toEqual([
        { id: 'msId1', ...mockMilestone1Data },
        { id: 'msId2', ...mockMilestone2Data },
      ]);
    });

    it('should return empty array if no milestones found', async () => {
        (firestore.getDocs as jest.Mock).mockResolvedValue({ docs: [], forEach: (cb: any) => [].forEach(cb) });
        await getMilestoneGetJid(mockRequest, { params: Promise.resolve(mockParams) });
        const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
        expect(mockCallArgs[0].results).toEqual([]);
        expect(mockCallArgs[1]?.status).toBe(200);
    });
    
    it('should return 500 if getDocs fails', async () => {
        const error = new Error('getDocs failed');
        (firestore.getDocs as jest.Mock).mockRejectedValue(error);
        await getMilestoneGetJid(mockRequest, { params: Promise.resolve(mockParams) });
        const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
        expect(mockCallArgs[1]?.status).toBe(500);
        expect(mockCallArgs[0].message).toBe("Error fetching milestones");
      });
  });

  // --- /api/milestones/payment ---
  describe('/api/milestones/payment (PATCH)', () => {
    const mockDocRef = { _id: 'milestoneDocRefPayment' };
    const mockPayload = { 
        jobID: 'job1', 
        milestoneID: 'ms1', 
        status: PaymentStatus.Paid 
    };

    beforeEach(() => {
        (firestore.doc as jest.Mock).mockReturnValue(mockDocRef);
        (firestore.updateDoc as jest.Mock).mockResolvedValue(undefined);
    });

    it('should update milestone payment status', async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue(mockPayload);
      await patchMilestonePayment(mockRequest);

      expect(firestore.doc).toHaveBeenCalledWith(mockDbObject, "Jobs", mockPayload.jobID, "milestones", mockPayload.milestoneID);
      expect(firestore.updateDoc).toHaveBeenCalledWith(mockDocRef, { paymentStatus: mockPayload.status });
      
      const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
      expect(mockCallArgs[1]?.status).toBe(200);
      expect(mockCallArgs[0]).toEqual({});
    });
    
    it('should return 500 if updateDoc fails', async () => {
        (mockRequest.json as jest.Mock).mockResolvedValue(mockPayload);
        const error = new Error('updateDoc failed for payment');
        (firestore.updateDoc as jest.Mock).mockRejectedValue(error);
        await patchMilestonePayment(mockRequest);
        const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
        expect(mockCallArgs[1]?.status).toBe(500);
        expect(mockCallArgs[0].message).toBe("Error setting milestone payment status");
      });
  });

  // --- /api/milestones/report/add ---
  describe('/api/milestones/report/add (PATCH)', () => {
    const mockDocRef = { _id: 'milestoneDocRefReport' };
    const mockPayload = { 
        jobID: 'job2', 
        milestoneID: 'ms2', 
        reportURL: 'http://example.com/report.pdf' 
    };

    beforeEach(() => {
        (firestore.doc as jest.Mock).mockReturnValue(mockDocRef);
        (firestore.updateDoc as jest.Mock).mockResolvedValue(undefined);
    });

    it('should add report URL to milestone', async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue(mockPayload);
      await patchMilestoneReportAdd(mockRequest);

      expect(firestore.doc).toHaveBeenCalledWith(mockDbObject, "Jobs", mockPayload.jobID, "milestones", mockPayload.milestoneID);
      expect(firestore.updateDoc).toHaveBeenCalledWith(mockDocRef, { reportURL: mockPayload.reportURL });
      
      const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
      expect(mockCallArgs[1]?.status).toBe(200);
      expect(mockCallArgs[0]).toEqual({});
    });

    it('should return 500 if updateDoc fails', async () => {
        (mockRequest.json as jest.Mock).mockResolvedValue(mockPayload);
        const error = new Error('updateDoc failed for report URL');
        (firestore.updateDoc as jest.Mock).mockRejectedValue(error);
        await patchMilestoneReportAdd(mockRequest);
        const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
        expect(mockCallArgs[1]?.status).toBe(500);
        expect(mockCallArgs[0].message).toBe("Error adding milestone report url");
      });
  });

  // --- /api/milestones/set ---
  describe('/api/milestones/set (PUT)', () => {
    const mockDocRef = { _id: 'milestoneDocRefSet' };
    const mockPayload = { 
        jobID: 'job3', 
        milestoneID: 'ms3', 
        milestoneData: { 
            id: 'ms3', title: 'Updated Milestone', description: 'Updated desc', 
            status: MilestoneStatus.Completed, deadline: 20250303, payment: 300,
            reportURL: 'updated.url', paymentStatus: PaymentStatus.Paid 
        } as MilestoneData
    };
    beforeEach(() => {
        (firestore.doc as jest.Mock).mockReturnValue(mockDocRef);
        (firestore.setDoc as jest.Mock).mockResolvedValue(undefined);
    });
    it('should set (overwrite) milestone data', async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue(mockPayload);
      await putMilestoneSet(mockRequest);

      expect(firestore.doc).toHaveBeenCalledWith(mockDbObject, "Jobs", mockPayload.jobID, "milestones", mockPayload.milestoneID);
      expect(firestore.setDoc).toHaveBeenCalledWith(mockDocRef, mockPayload.milestoneData);
      
      const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
      expect(mockCallArgs[1]?.status).toBe(200);
      expect(mockCallArgs[0]).toEqual({});
    });

    it('should return 500 if setDoc fails', async () => {
        (mockRequest.json as jest.Mock).mockResolvedValue(mockPayload);
        const error = new Error('setDoc failed for milestone set');
        (firestore.setDoc as jest.Mock).mockRejectedValue(error);
        await putMilestoneSet(mockRequest);
        const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
        expect(mockCallArgs[1]?.status).toBe(500);
        expect(mockCallArgs[0].message).toBe("Error setting milestone");
      });
  });

  // --- /api/milestones/status ---
  describe('/api/milestones/status (PATCH)', () => {
    const mockDocRef = { _id: 'milestoneDocRefStatus' };
    const mockPayload = { 
        jobID: 'job4', 
        milestoneID: 'ms4', 
        status: MilestoneStatus.Approved 
    };
    beforeEach(() => {
        (firestore.doc as jest.Mock).mockReturnValue(mockDocRef);
        (firestore.updateDoc as jest.Mock).mockResolvedValue(undefined);
    });
    it('should update milestone status', async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue(mockPayload);
      await patchMilestoneStatus(mockRequest);

      expect(firestore.doc).toHaveBeenCalledWith(mockDbObject, "Jobs", mockPayload.jobID, "milestones", mockPayload.milestoneID);
      expect(firestore.updateDoc).toHaveBeenCalledWith(mockDocRef, { status: mockPayload.status });
      
      const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
      expect(mockCallArgs[1]?.status).toBe(200);
      expect(mockCallArgs[0]).toEqual({});
    });

    it('should return 500 if updateDoc fails', async () => {
        (mockRequest.json as jest.Mock).mockResolvedValue(mockPayload);
        const error = new Error('updateDoc failed for milestone status');
        (firestore.updateDoc as jest.Mock).mockRejectedValue(error);
        await patchMilestoneStatus(mockRequest);
        const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
        expect(mockCallArgs[1]?.status).toBe(500);
        expect(mockCallArgs[0].message).toBe("Error updating milestone status");
      });
  });
});