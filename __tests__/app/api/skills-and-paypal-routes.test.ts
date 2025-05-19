// __tests__/app/api/skills-and-paypal-routes.test.ts
import { NextRequest } from 'next/server';
import { db } from '../../../src/app/firebase'; 
import * as firestore from 'firebase/firestore';
import SkillData from '../../../src/app/interfaces/SkillData.interface';

import { POST as postSkillsMap } from '@/app/api/skills/map/route';
import { GET as getSkillsIds } from '@/app/api/skills/ids/route';
import { GET as getSkillsAll } from '@/app/api/skills/all/route';
import { POST as postSkillsAdd } from '@/app/api/skills/add/route';
import { POST as postPaypalPayout } from '@/app/api/paypal/payout/route';
import { POST as postPaypalCreateOrder } from '@/app/api/paypal/create-order/route';
import { POST as postPaypalCaptureOrder } from '@/app/api/paypal/capture-order/route';

// --- Mocks ---
jest.mock('next/server', () => {
  const actualNextServer = jest.requireActual('next/server');
  return {
    ...actualNextServer,
    NextResponse: {
      ...actualNextServer.NextResponse,
      json: jest.fn((body, init) => {
        return {
          json: async () => body,
          text: async () => JSON.stringify(body),
          status: init?.status || 200,
          ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300,
          headers: new Headers(init?.headers),
        };
      }),
    },
  };
});

jest.mock('../../../src/app/firebase', () => ({
  db: jest.fn(), 
}));

jest.mock('firebase/firestore', () => {
  const originalModule = jest.requireActual('firebase/firestore');
  return {
    ...originalModule,
    collection: jest.fn(),
    getDocs: jest.fn(),
    doc: jest.fn(),
    setDoc: jest.fn(),
    arrayUnion: jest.fn((...args) => originalModule.arrayUnion(...args)),
  };
});

jest.mock('../../../src/app/paypalClient', () => ({
  getAccessToken: jest.fn(),
  paypalClient: jest.fn().mockReturnValue({
    execute: jest.fn(),
  }),
}));

jest.mock('@paypal/checkout-server-sdk', () => ({
  orders: {
    OrdersCreateRequest: jest.fn().mockImplementation(() => ({
        prefer: jest.fn(),
        requestBody: jest.fn(),
    })),
    OrdersCaptureRequest: jest.fn().mockImplementation((orderId) => ({
        prefer: jest.fn(),
        requestBody: jest.fn(),
        orderID: orderId, 
    })),
  },
}));

global.fetch = jest.fn();
let consoleErrorSpy: jest.SpyInstance;

describe('API Routes: Skills and PayPal', () => {
  let mockRequest: NextRequest;
  const { NextResponse: MockNextResponse } = jest.requireMock('next/server');

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (MockNextResponse.json as jest.Mock).mockClear();
    mockRequest = {
      json: jest.fn(),
      nextUrl: { searchParams: new URLSearchParams() },
      headers: new Headers(),
    } as unknown as NextRequest;
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  // --- Test Suite for /api/skills/map ---
  describe('/api/skills/map (POST)', () => {
    const mockCollectionRef = { id: 'mockSkillsCollection' };
    beforeEach(() => {
      (firestore.collection as jest.Mock).mockReturnValue(mockCollectionRef);
    });

    it('should map skill names to areas successfully', async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue({ skillNames: ['SkillA', 'SkillC'] });
      const mockDocs = [
        { data: () => ({ skillArea: 'Area1', names: ['SkillA', 'SkillB'] }) },
        { data: () => ({ skillArea: 'Area2', names: ['SkillC', 'SkillD'] }) },
        { data: () => ({ skillArea: 'Area3', names: ['SkillE'] }) },
      ];
      (firestore.getDocs as jest.Mock).mockResolvedValue({ docs: mockDocs, forEach: (cb: any) => mockDocs.forEach(cb) });

      await postSkillsMap(mockRequest);
      const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
      const responseBody = mockCallArgs[0];
      const responseInit = mockCallArgs[1];

      expect(firestore.collection).toHaveBeenCalledWith(db, "skills");
      expect(firestore.getDocs).toHaveBeenCalledWith(mockCollectionRef);
      expect(MockNextResponse.json).toHaveBeenCalledWith(
        { results: { Area1: ['SkillA'], Area2: ['SkillC'] } },
        { status: 200 }
      );
      expect(responseInit.status).toBe(200);
      expect(responseBody.results).toEqual({
        Area1: ['SkillA'],
        Area2: ['SkillC'],
      });
    });

    it('should return empty map if no skills match', async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue({ skillNames: ['SkillX'] });
      const mockDocs = [
        { data: () => ({ skillArea: 'Area1', names: ['SkillA', 'SkillB'] }) },
      ];
      (firestore.getDocs as jest.Mock).mockResolvedValue({ docs: mockDocs, forEach: (cb: any) => mockDocs.forEach(cb) });
      
      await postSkillsMap(mockRequest);
      const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
      const responseBody = mockCallArgs[0];
      const responseInit = mockCallArgs[1];

      expect(responseInit.status).toBe(200);
      expect(responseBody.results).toEqual({});
    });
    
    it('should handle skills documents with missing or empty "names" field gracefully', async () => {
        (mockRequest.json as jest.Mock).mockResolvedValue({ skillNames: ['SkillA'] });
        const mockDocs = [
          { data: () => ({ skillArea: 'Area1', names: ['SkillA'] }) },
          { data: () => ({ skillArea: 'Area2', names: null }) },
          { data: () => ({ skillArea: 'Area3', names: [] }) },
          { data: () => ({ skillArea: 'Area4' }) },
        ];
        (firestore.getDocs as jest.Mock).mockResolvedValue({ docs: mockDocs, forEach: (cb: any) => mockDocs.forEach(cb) });
  
        await postSkillsMap(mockRequest);
        const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
        const responseBody = mockCallArgs[0];
        const responseInit = mockCallArgs[1];

        expect(responseInit.status).toBe(200);
        expect(responseBody.results).toEqual({ Area1: ['SkillA'] });
      });

    it('should return 500 if Firestore operation fails', async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue({ skillNames: ['SkillA'] });
      const error = new Error('Firestore failed');
      (firestore.getDocs as jest.Mock).mockRejectedValue(error);

      await postSkillsMap(mockRequest);
      const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
      const responseBody = mockCallArgs[0];
      const responseInit = mockCallArgs[1];

      expect(responseInit.status).toBe(500);
      expect(responseBody.message).toBe('Error mapping skills to areas');
      expect(responseBody.error).toEqual(error);
    });

    it('should return 500 if request body parsing fails', async () => {
        const jsonError = new Error('Invalid JSON');
        (mockRequest.json as jest.Mock).mockRejectedValue(jsonError);
  
        await postSkillsMap(mockRequest);
        const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
        const responseBody = mockCallArgs[0];
        const responseInit = mockCallArgs[1];
  
        expect(responseInit.status).toBe(500);
        expect(responseBody.message).toBe('Error mapping skills to areas');
        expect(responseBody.error).toEqual(jsonError);
      });
  });

  describe('/api/skills/ids (GET)', () => {
    const mockCollectionRef = { id: 'mockSkillCollection' }; 
     beforeEach(() => {
      (firestore.collection as jest.Mock).mockReturnValue(mockCollectionRef);
    });

    it('should return all skill IDs successfully', async () => {
      const mockDocs = [ { id: 'id1' }, { id: 'id2' } ];
      (firestore.getDocs as jest.Mock).mockResolvedValue({ docs: mockDocs });

      await getSkillsIds();
      const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
      const responseBody = mockCallArgs[0];
      const responseInit = mockCallArgs[1];

      expect(firestore.collection).toHaveBeenCalledWith(db, "skill"); 
      expect(firestore.getDocs).toHaveBeenCalledWith(mockCollectionRef);
      expect(responseInit.status).toBe(200);
      expect(responseBody.results).toEqual(['id1', 'id2']);
    });

    it('should return empty array if no skill IDs found', async () => {
      (firestore.getDocs as jest.Mock).mockResolvedValue({ docs: [] });
      
      await getSkillsIds();
      const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
      const responseBody = mockCallArgs[0];
      const responseInit = mockCallArgs[1];

      expect(responseInit.status).toBe(200);
      expect(responseBody.results).toEqual([]);
    });

    it('should return 500 if Firestore operation fails', async () => {
      const error = new Error('Firestore failed');
      (firestore.getDocs as jest.Mock).mockRejectedValue(error);

      await getSkillsIds();
      const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
      const responseBody = mockCallArgs[0];
      const responseInit = mockCallArgs[1];

      expect(responseInit.status).toBe(500);
      expect(responseBody.message).toBe("Error fetching skill ID's");
      expect(responseBody.error).toEqual(error);
    });
  });

  describe('/api/skills/all (GET)', () => {
    const mockCollectionRef = { id: 'mockSkillsCollection' };
    beforeEach(() => {
      (firestore.collection as jest.Mock).mockReturnValue(mockCollectionRef);
    });

    it('should return all skills successfully', async () => {
      const mockSkillData: SkillData[] = [
        { id: 'area1', skills: ['SkillA', 'SkillB'] },
        { id: 'area2', skills: ['SkillC'] },
      ];
      const mockDocs = [
        { id: 'area1', data: () => ({ names: ['SkillA', 'SkillB'] }) },
        { id: 'area2', data: () => ({ names: ['SkillC'] }) },
      ];
      (firestore.getDocs as jest.Mock).mockResolvedValue({ docs: mockDocs });

      await getSkillsAll();
      const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
      const responseBody = mockCallArgs[0];
      const responseInit = mockCallArgs[1];

      expect(firestore.collection).toHaveBeenCalledWith(db, "skills");
      expect(firestore.getDocs).toHaveBeenCalledWith(mockCollectionRef);
      expect(responseInit.status).toBe(200);
      expect(responseBody.results).toEqual(mockSkillData);
    });

    it('should handle skills with no "names" (default to empty array)', async () => {
      const mockDocs = [
        { id: 'area1', data: () => ({}) }, 
        { id: 'area2', data: () => ({ names: null }) }, 
      ];
      (firestore.getDocs as jest.Mock).mockResolvedValue({ docs: mockDocs });
      
      await getSkillsAll();
      const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
      const responseBody = mockCallArgs[0];
      const responseInit = mockCallArgs[1];

      expect(responseInit.status).toBe(200);
      expect(responseBody.results).toEqual([
        { id: 'area1', skills: [] },
        { id: 'area2', skills: [] },
      ]);
    });
    
    it('should return 500 if Firestore operation fails', async () => {
        const error = new Error('Firestore failed');
        (firestore.getDocs as jest.Mock).mockRejectedValue(error);
  
        await getSkillsAll();
        const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
        const responseBody = mockCallArgs[0];
        const responseInit = mockCallArgs[1];
  
        expect(responseInit.status).toBe(500);
        expect(responseBody.message).toBe("Error fetching skills");
        expect(responseBody.error).toEqual(error);
      });
  });

  describe('/api/skills/add (POST)', () => {
    const mockDocRef = { id: 'mockSkillAreaDoc' };
    beforeEach(() => {
      (firestore.doc as jest.Mock).mockReturnValue(mockDocRef);
      (firestore.setDoc as jest.Mock).mockResolvedValue(undefined);
      (firestore.arrayUnion as jest.Mock).mockImplementation(value => ({ type: 'arrayUnion', value }));
    });

    it('should add a skill successfully', async () => {
      const skillArea = 'NewArea';
      const skillName = 'NewSkill';
      (mockRequest.json as jest.Mock).mockResolvedValue({ SkillArea: skillArea, skillName: skillName });
      
      await postSkillsAdd(mockRequest);
      const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
      const responseBody = mockCallArgs[0];
      const responseInit = mockCallArgs[1];

      expect(mockRequest.json).toHaveBeenCalled();
      expect(firestore.doc).toHaveBeenCalledWith(db, "skills", skillArea);
      expect(firestore.setDoc).toHaveBeenCalledWith(
        mockDocRef,
        { SkillArea: skillArea, name: { type: 'arrayUnion', value: skillName } }, 
        { merge: true }
      );
      expect(firestore.arrayUnion).toHaveBeenCalledWith(skillName);
      expect(responseInit.status).toBe(200);
      expect(responseBody.success).toBe(true);
    });
    
    it('should return 500 if Firestore operation fails', async () => {
        (mockRequest.json as jest.Mock).mockResolvedValue({ SkillArea: 'Test', skillName: 'TestSkill' });
        const error = new Error('Firestore setDoc failed');
        (firestore.setDoc as jest.Mock).mockRejectedValue(error);
  
        await postSkillsAdd(mockRequest);
        const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
        const responseBody = mockCallArgs[0];
        const responseInit = mockCallArgs[1];
  
        expect(responseInit.status).toBe(500);
        expect(responseBody.message).toBe("Error adding skill");
        expect(responseBody.error).toEqual(error);
      });

    it('should return 500 if request body parsing fails', async () => {
        const jsonError = new Error('Invalid JSON');
        (mockRequest.json as jest.Mock).mockRejectedValue(jsonError);
  
        await postSkillsAdd(mockRequest);
        const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
        const responseBody = mockCallArgs[0];
        const responseInit = mockCallArgs[1];

        expect(responseInit.status).toBe(500);
        expect(responseBody.message).toBe("Error adding skill");
        expect(responseBody.error).toEqual(jsonError);
      });
  });

  describe('/api/paypal/payout (POST)', () => {
    const mockPayoutDetails = {
      email: 'receiver@example.com',
      amount: '10.00',
      note: 'Thanks for your work!',
      milestoneId: 'ms123',
    };
    const mockAccessToken = 'mock-paypal-access-token';
    const originalEnv = { ...process.env };
    let getAccessTokenMock: jest.Mock;

    beforeEach(() => {
      (global.fetch as jest.Mock).mockClear();
      consoleErrorSpy.mockClear();
      process.env = { ...originalEnv };
      const paypalClientModule = require('../../../src/app/paypalClient');
      getAccessTokenMock = paypalClientModule.getAccessToken;
      getAccessTokenMock.mockResolvedValue(mockAccessToken);
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it('should process payout successfully with sandbox env', async () => {
      process.env.PAYPAL_ENV = 'sandbox';
      (mockRequest.json as jest.Mock).mockResolvedValue(mockPayoutDetails);
      const mockPaypalResponseData = { batch_header: { payout_batch_id: 'batch123' } };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPaypalResponseData,
      });

      await postPaypalPayout(mockRequest);
      const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
      const responseBody = mockCallArgs[0];
      const responseInit = mockCallArgs[1]; // This will be undefined

      expect(getAccessTokenMock).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api-m.sandbox.paypal.com/v1/payments/payouts',
        expect.objectContaining({
          method: 'POST',
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining(mockPayoutDetails.email),
        })
      );
      // Corrected status check
      const status = responseInit?.status || 200;
      expect(status).toBe(200);
      expect(responseBody.success).toBe(true);
      expect(responseBody.batch).toEqual(mockPaypalResponseData);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
    
    it('should process payout successfully with live env', async () => {
        process.env.PAYPAL_ENV = 'live';
        (mockRequest.json as jest.Mock).mockResolvedValue(mockPayoutDetails);
        const mockPaypalResponseData = { batch_header: { payout_batch_id: 'batchLive123' } };
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: async () => mockPaypalResponseData,
        });
  
        await postPaypalPayout(mockRequest);
        const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
        // const responseBody = mockCallArgs[0]; // Already checked in sandbox
        const responseInit = mockCallArgs[1]; // This will be undefined
          
        expect(global.fetch).toHaveBeenCalledWith(
          'https://api-m.paypal.com/v1/payments/payouts',
          expect.anything()
        );
        // Corrected status check
        const status = responseInit?.status || 200;
        expect(status).toBe(200);
      });

    it('should return 500 and log error if PayPal API call fails', async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue(mockPayoutDetails);
      const mockErrorData = { name: 'PAYPAL_API_ERROR', message: 'Insufficient funds' };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false, 
        json: async () => mockErrorData,
        status: 400 
      });

      await postPaypalPayout(mockRequest);
      const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
      const responseBody = mockCallArgs[0];
      const responseInit = mockCallArgs[1];

      // responseInit will be { status: 500 } as passed by the route
      expect(responseInit.status).toBe(500); 
      expect(responseBody.error).toEqual(mockErrorData);
      expect(consoleErrorSpy).toHaveBeenCalledWith('PayPal payout error', mockErrorData);
    });

    it('should throw error if getAccessToken fails (route has no try-catch for it)', async () => {
        (mockRequest.json as jest.Mock).mockResolvedValue(mockPayoutDetails);
        const accessTokenError = new Error('Failed to get access token');
        getAccessTokenMock.mockRejectedValue(accessTokenError);
        await expect(postPaypalPayout(mockRequest)).rejects.toThrow(accessTokenError);
      });

    it('should throw error if fetch itself throws an error (route has no try-catch for it)', async () => {
        (mockRequest.json as jest.Mock).mockResolvedValue(mockPayoutDetails);
        const fetchError = new Error('Network connection failed');
        (global.fetch as jest.Mock).mockRejectedValue(fetchError);
        await expect(postPaypalPayout(mockRequest)).rejects.toThrow(fetchError);
    });
  });
  
  describe('/api/paypal/create-order (POST)', () => {
    const mockOrderPayload = { amount: '100.00', milestoneId: 'ms001' };
    let mockPaypalClientExecute: jest.Mock;

    beforeEach(()=> {
        const paypalClientModule = require('../../../src/app/paypalClient');
        mockPaypalClientExecute = paypalClientModule.paypalClient().execute;
    });
    
    it('should create a PayPal order successfully', async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue(mockOrderPayload);
      const mockPaypalOrderResponse = { result: { id: 'paypalOrderId123', status: 'CREATED' } };
      mockPaypalClientExecute.mockResolvedValue(mockPaypalOrderResponse);

      await postPaypalCreateOrder(mockRequest);
      const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
      const responseBody = mockCallArgs[0];
      const responseInit = mockCallArgs[1]; // This will be undefined

      expect(mockRequest.json).toHaveBeenCalled();
      expect(mockPaypalClientExecute).toHaveBeenCalled();
      const sdkRequestInstance = mockPaypalClientExecute.mock.calls[0][0];
      expect(sdkRequestInstance.prefer).toHaveBeenCalledWith('return=representation');
      expect(sdkRequestInstance.requestBody).toHaveBeenCalledWith(expect.objectContaining({
        intent: 'CAPTURE',
        purchase_units: expect.arrayContaining([
          expect.objectContaining({
            amount: { currency_code: "USD", value: mockOrderPayload.amount },
            custom_id: mockOrderPayload.milestoneId,
          })
        ])
      }));

      // Corrected status check
      const status = responseInit?.status || 200;
      expect(status).toBe(200);
      expect(responseBody.orderID).toBe('paypalOrderId123');
    });

    it('should throw error if PayPal client execution fails (route has no try-catch)', async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue(mockOrderPayload);
      const error = new Error('PayPal SDK execute failed');
      mockPaypalClientExecute.mockRejectedValue(error);
      await expect(postPaypalCreateOrder(mockRequest)).rejects.toThrow(error);
    });
  });

  describe('/api/paypal/capture-order (POST)', () => {
    const mockCapturePayload = { orderID: 'paypalOrderId123' };
    let mockPaypalClientExecute: jest.Mock;

    beforeEach(()=> {
        const paypalClientModule = require('../../../src/app/paypalClient');
        mockPaypalClientExecute = paypalClientModule.paypalClient().execute;
    });

    it('should capture a PayPal order successfully', async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue(mockCapturePayload);
      const mockPaypalCaptureResponse = { result: { id: 'captureId456', status: 'COMPLETED' } };
      mockPaypalClientExecute.mockResolvedValue(mockPaypalCaptureResponse);
      
      await postPaypalCaptureOrder(mockRequest);
      const mockCallArgs = (MockNextResponse.json as jest.Mock).mock.calls[0];
      const responseBody = mockCallArgs[0];
      const responseInit = mockCallArgs[1]; // This will be undefined

      expect(mockRequest.json).toHaveBeenCalled();
      expect(mockPaypalClientExecute).toHaveBeenCalled();
      const sdkRequestInstance = mockPaypalClientExecute.mock.calls[0][0];
      expect(sdkRequestInstance.orderID).toBe(mockCapturePayload.orderID);
      expect(sdkRequestInstance.prefer).toHaveBeenCalledWith('return=representation');
      expect(sdkRequestInstance.requestBody).toHaveBeenCalledWith({});
      
      // Corrected status check
      const status = responseInit?.status || 200;
      expect(status).toBe(200);
      expect(responseBody.capture).toEqual(mockPaypalCaptureResponse.result);
    });

    it('should throw error if PayPal client execution fails during capture (route has no try-catch)', async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue(mockCapturePayload);
      const error = new Error('PayPal SDK capture execute failed');
      mockPaypalClientExecute.mockRejectedValue(error);
      await expect(postPaypalCaptureOrder(mockRequest)).rejects.toThrow(error);
    });
  });
});