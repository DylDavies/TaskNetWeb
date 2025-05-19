// __tests__/app/server/services/ApplicationDatabaseServices.test.ts
import {
  getApplicant,
  getPendingApplicants,
  acceptApplicant,
  rejectApplicant,
} from '@/app/server/services/ApplicationDatabaseServices';
import ApplicantData from '@/app/interfaces/ApplicationData.interface';
import ApplicationStatus from '@/app/enums/ApplicationStatus.enum';

// Mock the global fetch
global.fetch = jest.fn();

// Mock console.error to spy on its calls
let consoleErrorMock: jest.SpyInstance;

describe('ApplicationDatabaseServices', () => {
  const mockApplicantUserId = 'applicantUser123'; // Renamed to avoid confusion with application ID
  const mockJobId = 'job456';
  const mockApplicationId = 'app789'; 

  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
    consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorMock.mockRestore();
  });

  // --- getApplicant ---
  describe('getApplicant', () => {
    const mockApplicantData: ApplicantData = {
      ApplicationID: mockApplicationId, 
      ApplicantID: mockApplicantUserId, 
      JobID: mockJobId,
      Status: ApplicationStatus.Pending,
      ApplicationDate: new Date('2024-01-15T00:00:00.000Z').getTime(), // Corrected to number (timestamp)
      BidAmount: 1000,
      CVURL: 'cv.pdf',
      EstimatedTimeline: 14, // Corrected to number (e.g., days)
      username: 'applicantUser', 
    };

    it('should fetch and return applicant data on successful API call', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ result: mockApplicantData }),
      });

      const result = await getApplicant(mockApplicationId);

      expect(global.fetch).toHaveBeenCalledWith(`/api/application/get/${mockApplicationId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockApplicantData);
      expect(consoleErrorMock).not.toHaveBeenCalled();
    });

    it('should return null if API call is successful but applicant not found (result is null)', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ result: null }),
      });

      const result = await getApplicant(mockApplicationId);
      expect(result).toBeNull();
      expect(consoleErrorMock).not.toHaveBeenCalled();
    });
    
    it('should return undefined for result if API returns non-OK status and response.json().result is undefined (service has no 500 check)', async () => {
        const errorFromApiRoute = { message: 'Internal Server Error from API' }; 
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: false,
          status: 500, 
          json: async () => (errorFromApiRoute), 
        });
  
        const result = await getApplicant(mockApplicationId);
        // getApplicant service does NOT have `if (response.status == 500) console.error(...)`
        expect(consoleErrorMock).not.toHaveBeenCalled();
        expect(result).toBeUndefined(); // because errorFromApiRoute.result is undefined
      });


    it('should propagate error on fetch network failure', async () => {
      const networkError = new Error('Network failure');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      await expect(getApplicant(mockApplicationId)).rejects.toThrow(networkError);
      expect(consoleErrorMock).not.toHaveBeenCalled();
    });
  });

  // --- getPendingApplicants ---
  describe('getPendingApplicants', () => {
    const mockPendingApplicantDataArray: ApplicantData[] = [ 
      { ApplicationID: 'app1', ApplicantID: 'user1', JobID: mockJobId, Status: ApplicationStatus.Pending, ApplicationDate: new Date('2024-01-10T00:00:00.000Z').getTime(), BidAmount: 500, CVURL: 'cv1.pdf', EstimatedTimeline: 7, username: 'userOne' },
      { ApplicationID: 'app2', ApplicantID: 'user2', JobID: mockJobId, Status: ApplicationStatus.Pending, ApplicationDate: new Date('2024-01-12T00:00:00.000Z').getTime(), BidAmount: 600, CVURL: 'cv2.pdf', EstimatedTimeline: 14, username: 'userTwo' },
    ];

    it('should fetch and return pending applicants on successful API call', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ results: mockPendingApplicantDataArray }),
      });

      const result = await getPendingApplicants(mockJobId);

      expect(global.fetch).toHaveBeenCalledWith(`/api/application/get/pending/${mockJobId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockPendingApplicantDataArray);
      expect(consoleErrorMock).not.toHaveBeenCalled();
    });
    
    it('should return empty array if API call is successful but results are empty', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => ({ results: [] }),
        });
  
        const result = await getPendingApplicants(mockJobId);
        expect(result).toEqual([]);
        expect(consoleErrorMock).not.toHaveBeenCalled();
      });

    it('should return undefined for results if API returns non-OK status and response.json().results is undefined (service has no 500 check)', async () => {
        const errorFromApiRoute = { message: 'Internal Server Error from API' };
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: false,
          status: 500,
          json: async () => (errorFromApiRoute),
        });
  
        const result = await getPendingApplicants(mockJobId);
        // getPendingApplicants service does NOT have `if (response.status == 500) console.error(...)`
        expect(consoleErrorMock).not.toHaveBeenCalled();
        expect(result).toBeUndefined(); 
      });

    it('should propagate error on fetch network failure', async () => {
      const networkError = new Error('Network failure');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      await expect(getPendingApplicants(mockJobId)).rejects.toThrow(networkError);
      expect(consoleErrorMock).not.toHaveBeenCalled();
    });
  });

  // --- acceptApplicant ---
  describe('acceptApplicant', () => {
    it('should accept applicant on successful API call', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}), 
      });

      await acceptApplicant(mockApplicationId);

      expect(global.fetch).toHaveBeenCalledWith(`/api/application/accept/${mockApplicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      expect(consoleErrorMock).not.toHaveBeenCalled();
    });

    it('should call console.error on API error (500)', async () => {
      const errorResponse = { message: 'Error accepting applicant', error: {} };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => errorResponse,
      });

      await acceptApplicant(mockApplicationId);
      expect(global.fetch).toHaveBeenCalledWith(`/api/application/accept/${mockApplicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      expect(consoleErrorMock).toHaveBeenCalledWith(errorResponse);
    });

    it('should propagate error on fetch network failure', async () => {
      const networkError = new Error('Network failure');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      await expect(acceptApplicant(mockApplicationId)).rejects.toThrow(networkError);
      expect(consoleErrorMock).not.toHaveBeenCalled();
    });
  });

  // --- rejectApplicant ---
  describe('rejectApplicant', () => {
    it('should reject applicant on successful API call', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      await rejectApplicant(mockApplicationId);

      expect(global.fetch).toHaveBeenCalledWith(`/api/application/deny/${mockApplicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      expect(consoleErrorMock).not.toHaveBeenCalled();
    });

    it('should call console.error on API error (500)', async () => {
      // The API route /api/application/deny/[aid]/route.ts has a slight copy-paste in its error message:
      // it returns {message: "Error accepting applicant", error}
      // The test should reflect what the API *actually* returns for the service to log.
      const errorResponseFromApi = { message: 'Error accepting applicant', error: {} }; 
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => errorResponseFromApi,
      });

      await rejectApplicant(mockApplicationId);
      expect(global.fetch).toHaveBeenCalledWith(`/api/application/deny/${mockApplicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      expect(consoleErrorMock).toHaveBeenCalledWith(errorResponseFromApi);
    });

    it('should propagate error on fetch network failure', async () => {
      const networkError = new Error('Network failure');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      await expect(rejectApplicant(mockApplicationId)).rejects.toThrow(networkError);
      expect(consoleErrorMock).not.toHaveBeenCalled();
    });
  });
});