import {
  SetRatingAverage,
  SetRatingCount,
  AddRating,
  setFreelancerHasRated,
  setClientHasRated,
} from '@/app/server/services/RatingServices';

// global.fetch mock
const mockFetchPromise = Promise.resolve({
  ok: true,
  status: 200,
  json: () => Promise.resolve({}),
});
global.fetch = jest.fn(() => mockFetchPromise) as jest.Mock;

let consoleErrorMock: jest.SpyInstance;

describe('RatingServices', () => {
  const mockUid = 'test-user-123';
  const mockJobId = 'test-job-456';

  beforeEach(() => {
    jest.clearAllMocks(); // Clears all mocks, including global.fetch
    consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorMock.mockRestore();
  });

  describe('SetRatingAverage', () => {
    it('should call the average rating API endpoint with the correct parameters', async () => {
      const newAverage = 4.5;
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ message: 'Success' }),
      });

      await SetRatingAverage(mockUid, newAverage);

      expect(fetch).toHaveBeenCalledWith(
        `/api/rating/average?userID=${mockUid}&Avg=${newAverage}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      expect(consoleErrorMock).not.toHaveBeenCalled();
    });

    it('should call the API with null if newAverage is null', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ message: 'Success' }),
      });

      await SetRatingAverage(mockUid, null);

      expect(fetch).toHaveBeenCalledWith(
        `/api/rating/average?userID=${mockUid}&Avg=null`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      expect(consoleErrorMock).not.toHaveBeenCalled();
    });

    it('should log an error if the API call fails (status 500)', async () => {
      const newAverage = 3.8;
      const mockErrorResponse = { error: 'Server error occurred' };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve(mockErrorResponse),
      });

      await SetRatingAverage(mockUid, newAverage);

      expect(fetch).toHaveBeenCalledWith(
        `/api/rating/average?userID=${mockUid}&Avg=${newAverage}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      expect(consoleErrorMock).toHaveBeenCalledWith(mockErrorResponse);
    });
  });

  describe('SetRatingCount', () => {
    it('should call the rating count API endpoint with the new rating count', async () => {
      const newCount = 15;
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ message: 'Success' }),
      });

      await SetRatingCount(mockUid, newCount);

      expect(fetch).toHaveBeenCalledWith(
        `/api/rating/count?userID=${mockUid}&count=${newCount}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      expect(consoleErrorMock).not.toHaveBeenCalled();
    });

    it('should call the API with null if newRatingCount is null', async () => {
       (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ message: 'Success' }),
      });

      await SetRatingCount(mockUid, null);

      expect(fetch).toHaveBeenCalledWith(
        `/api/rating/count?userID=${mockUid}&count=null`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      expect(consoleErrorMock).not.toHaveBeenCalled();
    });

    it('should log an error if the API call fails (status 500)', async () => {
      const newCount = 10;
      const mockErrorResponse = { error: 'Failed to set count' };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve(mockErrorResponse),
      });

      await SetRatingCount(mockUid, newCount);

      expect(fetch).toHaveBeenCalledWith(
        `/api/rating/count?userID=${mockUid}&count=${newCount}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      expect(consoleErrorMock).toHaveBeenCalledWith(mockErrorResponse);
    });
  });

  describe('AddRating', () => {
    it('should call the add rating API endpoint with the new rating', async () => {
      const newRating = 5;
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ message: 'Rating added' }),
      });

      await AddRating(mockUid, newRating);

      expect(fetch).toHaveBeenCalledWith(
        `/api/rating/add?userID=${mockUid}&rating=${newRating}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      expect(consoleErrorMock).not.toHaveBeenCalled();
    });

    it('should log an error if the API call fails (status 500)', async () => {
      const newRating = 4;
      const mockErrorResponse = { error: 'Failed to add rating' };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve(mockErrorResponse),
      });

      await AddRating(mockUid, newRating);

      expect(fetch).toHaveBeenCalledWith(
        `/api/rating/add?userID=${mockUid}&rating=${newRating}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      expect(consoleErrorMock).toHaveBeenCalledWith(mockErrorResponse);
    });
  });

  describe('setFreelancerHasRated', () => {
    it('should call the set freelancer has rated API endpoint with the correct JobID', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ message: 'Freelancer rating status updated' }),
      });

      await setFreelancerHasRated(mockJobId);

      expect(fetch).toHaveBeenCalledWith(
        `/api/rating/freelancer?JobID=${mockJobId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      expect(consoleErrorMock).not.toHaveBeenCalled();
    });

    it('should log an error if the API call fails (status 500)', async () => {
      const mockErrorResponse = { error: 'Failed to set freelancer rating status' };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve(mockErrorResponse),
      });

      await setFreelancerHasRated(mockJobId);

      expect(fetch).toHaveBeenCalledWith(
        `/api/rating/freelancer?JobID=${mockJobId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      expect(consoleErrorMock).toHaveBeenCalledWith(mockErrorResponse);
    });
  });

  describe('setClientHasRated', () => {
    it('should call the set client has rated API endpoint with the correct JobID', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ message: 'Client rating status updated' }),
      });

      await setClientHasRated(mockJobId);

      expect(fetch).toHaveBeenCalledWith(
        `/api/rating/client?JobID=${mockJobId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      expect(consoleErrorMock).not.toHaveBeenCalled();
    });

    it('should log an error if the API call fails (status 500)', async () => {
      const mockErrorResponse = { error: 'Failed to set client rating status' };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve(mockErrorResponse),
      });

      await setClientHasRated(mockJobId);

      expect(fetch).toHaveBeenCalledWith(
        `/api/rating/client?JobID=${mockJobId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      expect(consoleErrorMock).toHaveBeenCalledWith(mockErrorResponse);
    });
  });
});