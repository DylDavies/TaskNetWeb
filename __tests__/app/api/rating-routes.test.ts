import { NextRequest } from 'next/server';
import * as firestore from 'firebase/firestore';

// Import route handlers
import { PATCH as patchAddRating } from '../../../src/app/api/rating/add/route'; 
import { PATCH as patchUpdateAverage } from '../../../src/app/api/rating/average/route'; 
import { PATCH as patchClientRated } from '../../../src/app/api/rating/client/route'; 
import { PATCH as patchUpdateCount } from '../../../src/app/api/rating/count/route'; 
import { PATCH as patchFreelancerRated } from '../../../src/app/api/rating/freelancer/route'; 

// --- Mocks ---
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

// Mock the db import used in the route files
jest.mock('../../../src/app/firebase', () => ({ 
  db: { type: 'mocked-db-instance-rating-system' },
}));

jest.mock('firebase/firestore', () => {
    const originalFirestore = jest.requireActual('firebase/firestore');
    return {
        ...originalFirestore,
        doc: jest.fn(),
        getDoc: jest.fn(),
        updateDoc: jest.fn(),
    };
});

describe('API Routes: Rating System', () => {
  let mockRequest: NextRequest;
  const { NextResponse: MockNextResponse } = jest.requireMock('next/server');
  let consoleErrorSpy: jest.SpyInstance;

  const createMockRequest = (method: string = 'PATCH', searchParams?: URLSearchParams, basePath: string = '/api/rating/test') => {
    const url = `http://localhost${basePath}${searchParams ? `?${searchParams.toString()}` : ''}`;
    const newMockRequest = {
      json: jest.fn(),
      nextUrl: { searchParams: searchParams || new URLSearchParams(), pathname: basePath } as unknown as URL,
      headers: new Headers(),
      url: url,
      method: method,
      clone: jest.fn(() => newMockRequest), // Ensure clone returns the same mock object
      signal: new AbortController().signal,
      cookies: { get: jest.fn(), getAll: jest.fn(), has: jest.fn(), set: jest.fn(), delete: jest.fn(), clear: jest.fn() } as any,
      body: null,
      geo: undefined,
      ip: undefined,
    } as unknown as NextRequest;
    return newMockRequest;
  };


  beforeEach(() => {
    jest.clearAllMocks();
    (MockNextResponse.json as jest.Mock).mockClear();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Reset specific firestore mocks before each test
    (firestore.getDoc as jest.Mock).mockReset();
    (firestore.updateDoc as jest.Mock).mockReset();

    // Default mock for doc, can be overridden in specific tests if needed
    (firestore.doc as jest.Mock).mockImplementation((db, collectionName, id) => ({
        id,
        path: `${collectionName}/${id}`,
        withConverter: jest.fn().mockReturnThis(), // if you use converters
    }));
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  // Tests for /api/rating/add 
  describe('PATCH /api/rating/add', () => {
    const basePath = '/api/rating/add';
    it('should add a rating successfully when ratings array exists', async () => {
      const userID = 'testUser123';
      const rating = 4;
      const searchParams = new URLSearchParams({ userID, rating: String(rating) });
      mockRequest = createMockRequest('PATCH', searchParams, basePath);

      (firestore.getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ ratings: [3, 5] }),
      });
      (firestore.updateDoc as jest.Mock).mockResolvedValue(undefined);

      const response = await patchAddRating(mockRequest);
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({});
      expect(firestore.doc).toHaveBeenCalledWith(expect.anything(), "users", userID);
      expect(firestore.getDoc).toHaveBeenCalled();
      expect(firestore.updateDoc).toHaveBeenCalledWith(expect.anything(), { ratings: [3, 5, rating] });
    });

    it('should add a rating successfully when ratings array does not exist', async () => {
      const userID = 'testUser456';
      const rating = 5;
      const searchParams = new URLSearchParams({ userID, rating: String(rating) });
      mockRequest = createMockRequest('PATCH', searchParams, basePath);

      (firestore.getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({}), // No ratings array
      });
      (firestore.updateDoc as jest.Mock).mockResolvedValue(undefined);

      const response = await patchAddRating(mockRequest);
      expect(response.status).toBe(200);
      expect(firestore.updateDoc).toHaveBeenCalledWith(expect.anything(), { ratings: [rating] });
    });

    it('should return 500 if userID is missing for add rating', async () => {
      const searchParams = new URLSearchParams({ rating: "5" }); // Missing userID
      mockRequest = createMockRequest('PATCH', searchParams, basePath);

      const response = await patchAddRating(mockRequest);
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.message).toBe("Error adding rating: no user ID");
    });

    it('should return 500 if getDoc fails for add rating', async () => {
      const userID = 'testUserFailGet';
      const rating = 2;
      const searchParams = new URLSearchParams({ userID, rating: String(rating) });
      mockRequest = createMockRequest('PATCH', searchParams, basePath);
      const firestoreError = new Error('Firestore getDoc failed');
      (firestore.getDoc as jest.Mock).mockRejectedValue(firestoreError);

      const response = await patchAddRating(mockRequest);
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.message).toBe("Error adding rating");
      expect(body.error).toEqual(firestoreError);
    });

    it('should return 500 if updateDoc fails for add rating', async () => {
      const userID = 'testUserFailUpdate';
      const rating = 3;
      const searchParams = new URLSearchParams({ userID, rating: String(rating) });
      mockRequest = createMockRequest('PATCH', searchParams, basePath);

      (firestore.getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ ratings: [1] }),
      });
      const firestoreError = new Error('Firestore updateDoc failed');
      (firestore.updateDoc as jest.Mock).mockRejectedValue(firestoreError);

      const response = await patchAddRating(mockRequest);
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.message).toBe("Error adding rating");
      expect(body.error).toEqual(firestoreError);
    });
  });

  // Tests for /api/rating/average
  describe('PATCH /api/rating/average', () => {
    const basePath = '/api/rating/average';
    it('should update rating average successfully', async () => {
      const userID = 'testUserAvg123';
      const Avg = "4.5";
      const searchParams = new URLSearchParams({ userID, Avg });
      mockRequest = createMockRequest('PATCH', searchParams, basePath);

      (firestore.updateDoc as jest.Mock).mockResolvedValue(undefined);

      const response = await patchUpdateAverage(mockRequest);
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({});
      expect(firestore.doc).toHaveBeenCalledWith(expect.anything(), "users", userID);
      expect(firestore.updateDoc).toHaveBeenCalledWith(expect.anything(), { ratingAverage: Avg });
    });

    it('should return 500 if userID is missing for update average', async () => {
      const searchParams = new URLSearchParams({ Avg: "4.0" }); // Missing userID
      mockRequest = createMockRequest('PATCH', searchParams, basePath);

      const response = await patchUpdateAverage(mockRequest);
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.message).toBe("Error updating Average");
    });

    it('should update with null if Avg is missing (as per current route logic)', async () => {
        const userID = 'testUserNoAvg';
        const searchParams = new URLSearchParams({ userID }); // Missing Avg
        mockRequest = createMockRequest('PATCH', searchParams, basePath);
        (firestore.updateDoc as jest.Mock).mockResolvedValue(undefined);

        const response = await patchUpdateAverage(mockRequest);
        expect(response.status).toBe(200);
        expect(firestore.updateDoc).toHaveBeenCalledWith(expect.anything(), { ratingAverage: null });
    });

    it('should return 500 if updateDoc fails for update average', async () => {
      const userID = 'testUserAvgFail';
      const Avg = "3.2";
      const searchParams = new URLSearchParams({ userID, Avg });
      mockRequest = createMockRequest('PATCH', searchParams, basePath);

      const firestoreError = new Error('Firestore updateDoc failed');
      (firestore.updateDoc as jest.Mock).mockRejectedValue(firestoreError);

      const response = await patchUpdateAverage(mockRequest);
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.message).toBe("Error updating Average");
      expect(body.error).toEqual(firestoreError);
    });
  });

  // Tests for /api/rating/client
  describe('PATCH /api/rating/client', () => {
    const basePath = '/api/rating/client';
    it('should update hasClientRated successfully', async () => {
      const JobID = 'jobClient123';
      const searchParams = new URLSearchParams({ JobID });
      mockRequest = createMockRequest('PATCH', searchParams, basePath);

      (firestore.updateDoc as jest.Mock).mockResolvedValue(undefined);

      const response = await patchClientRated(mockRequest);
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({});
      expect(firestore.doc).toHaveBeenCalledWith(expect.anything(), "Jobs", JobID);
      expect(firestore.updateDoc).toHaveBeenCalledWith(expect.anything(), { hasClientRated: true });
    });

    it('should return 500 if JobID is missing for client rated', async () => {
      const searchParams = new URLSearchParams(); // Missing JobID
      mockRequest = createMockRequest('PATCH', searchParams, basePath);

      const response = await patchClientRated(mockRequest);
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.message).toBe("Error updating client rated, no job ID");
    });

    it('should return 500 if updateDoc fails for client rated', async () => {
      const JobID = 'jobClientFail';
      const searchParams = new URLSearchParams({ JobID });
      mockRequest = createMockRequest('PATCH', searchParams, basePath);

      const firestoreError = new Error('Firestore updateDoc failed');
      (firestore.updateDoc as jest.Mock).mockRejectedValue(firestoreError);

      const response = await patchClientRated(mockRequest);
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.message).toBe("Error client rated");
      expect(body.error).toEqual(firestoreError);
    });
  });

  // --- Tests for /api/rating/count ---
  describe('PATCH /api/rating/count', () => {
    const basePath = '/api/rating/count';
    it('should update rating count successfully', async () => {
      const userID = 'testUserCount123';
      const count = "10";
      const searchParams = new URLSearchParams({ userID, count });
      mockRequest = createMockRequest('PATCH', searchParams, basePath);

      (firestore.updateDoc as jest.Mock).mockResolvedValue(undefined);

      const response = await patchUpdateCount(mockRequest);
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({});
      expect(firestore.doc).toHaveBeenCalledWith(expect.anything(), "users", userID);
      expect(firestore.updateDoc).toHaveBeenCalledWith(expect.anything(), { ratingCount: count });
    });

    it('should return 500 if userID is missing for update count', async () => {
      const searchParams = new URLSearchParams({ count: "5" }); // Missing userID
      mockRequest = createMockRequest('PATCH', searchParams, basePath);

      const response = await patchUpdateCount(mockRequest);
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.message).toBe("Error updating Count");
    });

    it('should update with null if count is missing (as per current route logic)', async () => {
        const userID = 'testUserNoCount';
        const searchParams = new URLSearchParams({ userID }); // Missing count
        mockRequest = createMockRequest('PATCH', searchParams, basePath);
        (firestore.updateDoc as jest.Mock).mockResolvedValue(undefined);

        const response = await patchUpdateCount(mockRequest);
        expect(response.status).toBe(200);
        expect(firestore.updateDoc).toHaveBeenCalledWith(expect.anything(), { ratingCount: null });
    });

    it('should return 500 if updateDoc fails for update count', async () => {
      const userID = 'testUserCountFail';
      const count = "7";
      const searchParams = new URLSearchParams({ userID, count });
      mockRequest = createMockRequest('PATCH', searchParams, basePath);

      const firestoreError = new Error('Firestore updateDoc failed');
      (firestore.updateDoc as jest.Mock).mockRejectedValue(firestoreError);

      const response = await patchUpdateCount(mockRequest);
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.message).toBe("Error updating Count");
      expect(body.error).toEqual(firestoreError);
    });
  });

  // --- Tests for /api/rating/freelancer ---
  describe('PATCH /api/rating/freelancer', () => {
    const basePath = '/api/rating/freelancer';
    it('should update hasFreelancerRated successfully', async () => {
      const JobID = 'jobFreelancer123';
      const searchParams = new URLSearchParams({ JobID });
      mockRequest = createMockRequest('PATCH', searchParams, basePath);

      (firestore.updateDoc as jest.Mock).mockResolvedValue(undefined);

      const response = await patchFreelancerRated(mockRequest);
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({});
      expect(firestore.doc).toHaveBeenCalledWith(expect.anything(), "Jobs", JobID);
      expect(firestore.updateDoc).toHaveBeenCalledWith(expect.anything(), { hasFreelancerRated: true });
    });

    it('should return 500 if JobID is missing for freelancer rated', async () => {
      const searchParams = new URLSearchParams(); // Missing JobID
      mockRequest = createMockRequest('PATCH', searchParams, basePath);

      const response = await patchFreelancerRated(mockRequest);
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.message).toBe("Error updating freelancer rated, no job ID");
    });

    it('should return 500 if updateDoc fails for freelancer rated', async () => {
      const JobID = 'jobFreelancerFail';
      const searchParams = new URLSearchParams({ JobID });
      mockRequest = createMockRequest('PATCH', searchParams, basePath);

      const firestoreError = new Error('Firestore updateDoc failed');
      (firestore.updateDoc as jest.Mock).mockRejectedValue(firestoreError);

      const response = await patchFreelancerRated(mockRequest);
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.message).toBe("Error updating freelancer rated");
      expect(body.error).toEqual(firestoreError);
    });
  });
});