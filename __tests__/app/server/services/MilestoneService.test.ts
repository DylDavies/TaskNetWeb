// __tests__/app/server/services/MilestoneService.test.ts
import {
  getMilestones,
  addMilestone,
  updateMilestoneStatus,
  setMilestone,
  addReportURL,
  updateMilestonePaymentStatus,
} from '@/app/server/services/MilestoneService';
import MilestoneData from '@/app/interfaces/Milestones.interface';
import PaymentStatus from '@/app/enums/PaymentStatus.enum';
import MilestoneStatus from '@/app/enums/MilestoneStatus.enum';

// Mock the global fetch
global.fetch = jest.fn();

// Mock console.error to spy on its calls
let consoleErrorMock: jest.SpyInstance;

describe('MilestoneService', () => {
  const mockJobId = 'jobTest123';
  const mockMilestoneId = 'milestoneTest456';

  beforeEach(() => {
    // Reset mocks before each test
    (global.fetch as jest.Mock).mockClear();
    consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error mock
    consoleErrorMock.mockRestore();
  });

  // --- getMilestones ---
  describe('getMilestones', () => {
    const mockMilestoneDataArray: MilestoneData[] = [
      { id: 'm1', title: 'Milestone 1', description: 'First one', status: MilestoneStatus.OnHalt, deadline: 20250101, payment: 100, reportURL: '', paymentStatus: PaymentStatus.Unpaid }, // Changed Upcoming to OnHalt
      { id: 'm2', title: 'Milestone 2', description: 'Second one', status: MilestoneStatus.InProgress, deadline: 20250201, payment: 200, reportURL: 'url', paymentStatus: PaymentStatus.Escrow },
    ];

    it('should fetch and return milestones on successful API call', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ results: mockMilestoneDataArray }),
      });

      const result = await getMilestones(mockJobId);

      expect(global.fetch).toHaveBeenCalledWith(`/api/milestones/get/${mockJobId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockMilestoneDataArray);
      expect(consoleErrorMock).not.toHaveBeenCalled();
    });

    it('should return an empty array if API call is successful but results are empty', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => ({ results: [] }),
        });
  
        const result = await getMilestones(mockJobId);
        expect(result).toEqual([]);
        expect(consoleErrorMock).not.toHaveBeenCalled();
      });

    it('should call console.error and return undefined for results on API error (500)', async () => {
      const errorResponse = { message: 'Error fetching milestones', error: { detail: 'DB down' } };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => errorResponse,
      });

      const result = await getMilestones(mockJobId);

      expect(global.fetch).toHaveBeenCalledWith(`/api/milestones/get/${mockJobId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      expect(consoleErrorMock).toHaveBeenCalledWith(errorResponse);
      expect(result).toBeUndefined(); 
    });

    it('should propagate error on fetch network failure', async () => {
      const networkError = new Error('Network failure');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      await expect(getMilestones(mockJobId)).rejects.toThrow(networkError);
      expect(consoleErrorMock).not.toHaveBeenCalled();
    });
  });

  // --- addMilestone ---
  describe('addMilestone', () => {
    const milestonePayload: MilestoneData = { id: 'newId', title: 'New M', description: 'New D', status: MilestoneStatus.OnHalt, deadline: 20250301, payment: 150, reportURL: '', paymentStatus: PaymentStatus.Unpaid };
    const mockNewMilestoneId = 'newMilestoneGeneratedId';

    it('should add a new milestone and return its ID on successful API call', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ result: mockNewMilestoneId }),
      });

      const result = await addMilestone(mockJobId, milestonePayload);

      expect(global.fetch).toHaveBeenCalledWith('/api/milestones/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobID: mockJobId, milestoneData: milestonePayload }),
      });
      expect(result).toBe(mockNewMilestoneId);
      expect(consoleErrorMock).not.toHaveBeenCalled();
    });

    it('should call console.error and return undefined for result on API error (500)', async () => {
      const errorResponse = { message: 'Error adding milestone', error: {} };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => errorResponse,
      });

      const result = await addMilestone(mockJobId, milestonePayload);

      expect(global.fetch).toHaveBeenCalledWith('/api/milestones/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobID: mockJobId, milestoneData: milestonePayload }),
      });
      expect(consoleErrorMock).toHaveBeenCalledWith(errorResponse);
      expect(result).toBeUndefined(); 
    });

    it('should propagate error on fetch network failure', async () => {
      const networkError = new Error('Network failure');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      await expect(addMilestone(mockJobId, milestonePayload)).rejects.toThrow(networkError);
      expect(consoleErrorMock).not.toHaveBeenCalled();
    });
  });

  // --- updateMilestoneStatus ---
  describe('updateMilestoneStatus', () => {
    const newStatus = MilestoneStatus.Completed;

    it('should update milestone status on successful API call', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}), 
      });

      await updateMilestoneStatus(mockJobId, mockMilestoneId, newStatus);

      expect(global.fetch).toHaveBeenCalledWith('/api/milestones/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobID: mockJobId, milestoneID: mockMilestoneId, status: newStatus }),
      });
      expect(consoleErrorMock).not.toHaveBeenCalled();
    });

    it('should call console.error on API error (500)', async () => {
      const errorResponse = { message: 'Error updating milestone status', error: {} };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => errorResponse,
      });

      await updateMilestoneStatus(mockJobId, mockMilestoneId, newStatus);

      expect(global.fetch).toHaveBeenCalledWith('/api/milestones/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobID: mockJobId, milestoneID: mockMilestoneId, status: newStatus }),
      });
      expect(consoleErrorMock).toHaveBeenCalledWith(errorResponse);
    });

    it('should propagate error on fetch network failure', async () => {
      const networkError = new Error('Network failure');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      await expect(updateMilestoneStatus(mockJobId, mockMilestoneId, newStatus)).rejects.toThrow(networkError);
      expect(consoleErrorMock).not.toHaveBeenCalled();
    });
  });

  // --- setMilestone ---
  describe('setMilestone', () => {
    const milestoneDataToSet: MilestoneData = { id: mockMilestoneId, title: 'Set M', description: 'Set D', status: MilestoneStatus.OnHalt, deadline: 20250401, payment: 300, reportURL: 'set.url', paymentStatus: PaymentStatus.Escrow };

    it('should set milestone data on successful API call', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      await setMilestone(mockJobId, mockMilestoneId, milestoneDataToSet);

      expect(global.fetch).toHaveBeenCalledWith('/api/milestones/set', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobID: mockJobId, milestoneID: mockMilestoneId, milestoneData: milestoneDataToSet }),
      });
      expect(consoleErrorMock).not.toHaveBeenCalled();
    });

    it('should call console.error on API error (500)', async () => {
      const errorResponse = { message: 'Error setting milestone', error: {} };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => errorResponse,
      });

      await setMilestone(mockJobId, mockMilestoneId, milestoneDataToSet);
      expect(consoleErrorMock).toHaveBeenCalledWith(errorResponse);
    });

    it('should propagate error on fetch network failure', async () => {
      const networkError = new Error('Network failure');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      await expect(setMilestone(mockJobId, mockMilestoneId, milestoneDataToSet)).rejects.toThrow(networkError);
      expect(consoleErrorMock).not.toHaveBeenCalled();
    });
  });

  // --- addReportURL ---
  describe('addReportURL', () => {
    const reportUrl = 'http://example.com/new_report.pdf';

    it('should add report URL on successful API call', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      await addReportURL(mockJobId, mockMilestoneId, reportUrl);

      expect(global.fetch).toHaveBeenCalledWith('/api/milestones/report/add', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobID: mockJobId, milestoneID: mockMilestoneId, reportURL: reportUrl }),
      });
      expect(consoleErrorMock).not.toHaveBeenCalled();
    });

    it('should call console.error on API error (500)', async () => {
      const errorResponse = { message: 'Error adding milestone report url', error: {} };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => errorResponse,
      });

      await addReportURL(mockJobId, mockMilestoneId, reportUrl);
      expect(consoleErrorMock).toHaveBeenCalledWith(errorResponse);
    });

    it('should propagate error on fetch network failure', async () => {
      const networkError = new Error('Network failure');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      await expect(addReportURL(mockJobId, mockMilestoneId, reportUrl)).rejects.toThrow(networkError);
      expect(consoleErrorMock).not.toHaveBeenCalled();
    });
  });

  // --- updateMilestonePaymentStatus ---
  describe('updateMilestonePaymentStatus', () => {
    const newPaymentStatus = PaymentStatus.Paid;

    it('should update milestone payment status on successful API call', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      await updateMilestonePaymentStatus(mockJobId, mockMilestoneId, newPaymentStatus);

      expect(global.fetch).toHaveBeenCalledWith('/api/milestones/payment', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobID: mockJobId, milestoneID: mockMilestoneId, status: newPaymentStatus }),
      });
      expect(consoleErrorMock).not.toHaveBeenCalled();
    });

    it('should call console.error on API error (500)', async () => {
      const errorResponse = { message: 'Error setting milestone payment status', error: {} }; // Matched API error message
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => errorResponse,
      });

      await updateMilestonePaymentStatus(mockJobId, mockMilestoneId, newPaymentStatus);
      // The service code for updateMilestonePaymentStatus actually logs "Error setting milestone:" on 500
      // If the actual error message from the API is "Error setting milestone payment status"
      // then the consoleErrorMock should be checked against that.
      // The API route src/app/api/milestones/payment/route.ts does return:
      // NextResponse.json({message: "Error setting milestone payment status", error}, {status: 500});
      expect(consoleErrorMock).toHaveBeenCalledWith(errorResponse);
    });

    it('should propagate error on fetch network failure', async () => {
      const networkError = new Error('Network failure');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      await expect(updateMilestonePaymentStatus(mockJobId, mockMilestoneId, newPaymentStatus)).rejects.toThrow(networkError);
      expect(consoleErrorMock).not.toHaveBeenCalled();
    });
  });
});