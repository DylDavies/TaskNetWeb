import {
    SetRatingAverage,
    SetRatingCount,
    AddRating,
  } from '@/app/server/services/RatingServices'; // Main import for functions under test
  import { doc, updateDoc, getDoc } from 'firebase/firestore'; // Original imports for type safety and jest.mock target
  import { db } from '@/app/firebase'; // Original import for type safety and jest.mock target
  
  // Mock Firestore functions from 'firebase/firestore'
  // This mock will be used by Jest for any import of 'firebase/firestore'
  jest.mock('firebase/firestore', () => ({
    doc: jest.fn(),
    updateDoc: jest.fn(),
    getDoc: jest.fn(),
  }));
  
  // Mock the db export from your @/app/firebase module using a relative path
  // The path is relative from THIS test file to src/app/firebase.ts
  jest.mock('../../../../src/app/firebase', () => ({ // <<< CORRECTED RELATIVE PATH
    db: jest.fn(() => ({})), // Mock db as a function or a plain object as needed
  }));
  
  let consoleErrorMock: jest.SpyInstance;
  
  describe('RatingServices', () => {
    const mockUid = 'test-user-123';
    // Use the mocked versions of doc, updateDoc, getDoc for type casting if needed later
    const mockedDoc = doc as jest.Mock;
    const mockedUpdateDoc = updateDoc as jest.Mock;
    const mockedGetDoc = getDoc as jest.Mock;
    // We don't need to mock 'db' here again, it's handled by jest.mock above.
    // The actual 'db' instance used by RatingServices will be the mocked one.
  
    const mockDocRef = { id: mockUid, path: `users/${mockUid}` }; // Simplified mock doc ref
  
    beforeEach(() => {
      jest.clearAllMocks();
      consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
  
      // Setup default mock implementations for firestore functions
      mockedDoc.mockReturnValue(mockDocRef);
      mockedUpdateDoc.mockResolvedValue(undefined);
      mockedGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ ratings: [] }),
      });
    });
  
    afterEach(() => {
      consoleErrorMock.mockRestore();
    });
  
    describe('SetRatingAverage', () => {
      it('should update the user document with the new rating average', async () => {
        const newAverage = 4.5;
        // db from @/app/firebase is automatically mocked here due to jest.mock above
        await SetRatingAverage(mockUid, newAverage);
  
        expect(mockedDoc).toHaveBeenCalledWith(db, 'users', mockUid); // db here will be the mocked instance
        expect(mockedUpdateDoc).toHaveBeenCalledWith(mockDocRef, { ratingAverage: newAverage });
        expect(consoleErrorMock).not.toHaveBeenCalled();
      });
  
      it('should update with null if newAverage is null', async () => {
        await SetRatingAverage(mockUid, null);
        expect(mockedDoc).toHaveBeenCalledWith(db, 'users', mockUid);
        expect(mockedUpdateDoc).toHaveBeenCalledWith(mockDocRef, { ratingAverage: null });
        expect(consoleErrorMock).not.toHaveBeenCalled();
      });
  
      it('should log an error if updateDoc fails', async () => {
        const newAverage = 3.8;
        const mockError = new Error('Firestore update failed');
        mockedUpdateDoc.mockRejectedValue(mockError);
  
        await SetRatingAverage(mockUid, newAverage);
        expect(mockedDoc).toHaveBeenCalledWith(db, 'users', mockUid);
        expect(mockedUpdateDoc).toHaveBeenCalledWith(mockDocRef, { ratingAverage: newAverage });
        expect(consoleErrorMock).toHaveBeenCalledWith("Could not set new rating", mockError);
      });
    });
  
    describe('SetRatingCount', () => {
      it('should update the user document with the new rating count', async () => {
        const newCount = 15;
        await SetRatingCount(mockUid, newCount);
        expect(mockedDoc).toHaveBeenCalledWith(db, 'users', mockUid);
        expect(mockedUpdateDoc).toHaveBeenCalledWith(mockDocRef, { ratingCount: newCount });
        expect(consoleErrorMock).not.toHaveBeenCalled();
      });
  
      it('should update with null if newRatingCount is null', async () => {
        await SetRatingCount(mockUid, null);
        expect(mockedDoc).toHaveBeenCalledWith(db, 'users', mockUid);
        expect(mockedUpdateDoc).toHaveBeenCalledWith(mockDocRef, { ratingCount: null });
        expect(consoleErrorMock).not.toHaveBeenCalled();
      });
  
      it('should log an error if updateDoc fails', async () => {
        const newCount = 10;
        const mockError = new Error('Firestore update failed');
        mockedUpdateDoc.mockRejectedValue(mockError);
  
        await SetRatingCount(mockUid, newCount);
        expect(mockedDoc).toHaveBeenCalledWith(db, 'users', mockUid);
        expect(mockedUpdateDoc).toHaveBeenCalledWith(mockDocRef, { ratingCount: newCount });
        expect(consoleErrorMock).toHaveBeenCalledWith("Could not set a new total number of ratings", mockError);
      });
    });
  
    describe('AddRating', () => {
      it('should add a new rating to an existing ratings array', async () => {
        const existingRatings = [3, 4];
        const newRating = 5;
        mockedGetDoc.mockResolvedValue({
          exists: () => true,
          data: () => ({ ratings: existingRatings }),
        });
  
        await AddRating(mockUid, newRating);
        expect(mockedDoc).toHaveBeenCalledWith(db, 'users', mockUid);
        expect(mockedGetDoc).toHaveBeenCalledWith(mockDocRef);
        expect(mockedUpdateDoc).toHaveBeenCalledWith(mockDocRef, { ratings: [...existingRatings, newRating] });
        expect(consoleErrorMock).not.toHaveBeenCalled();
      });
  
      it('should create a new ratings array if one does not exist (ratings field missing)', async () => {
        const newRating = 4;
        mockedGetDoc.mockResolvedValue({
          exists: () => true,
          data: () => ({ otherField: 'value' }), // No 'ratings' field
        });
  
        await AddRating(mockUid, newRating);
        expect(mockedGetDoc).toHaveBeenCalledWith(mockDocRef);
        expect(mockedUpdateDoc).toHaveBeenCalledWith(mockDocRef, { ratings: [newRating] });
        expect(consoleErrorMock).not.toHaveBeenCalled();
      });
      
      it('should create a new ratings array if userSnap.data() returns undefined', async () => {
        const newRating = 4.2;
        mockedGetDoc.mockResolvedValue({
          exists: () => true,
          data: () => undefined, 
        });
  
        await AddRating(mockUid, newRating);
        expect(mockedUpdateDoc).toHaveBeenCalledWith(mockDocRef, { ratings: [newRating] });
      });
  
      it('should log an error if getDoc fails', async () => {
        const newRating = 5;
        const mockError = new Error('Firestore getDoc failed');
        mockedGetDoc.mockRejectedValue(mockError);
  
        await AddRating(mockUid, newRating);
        expect(mockedDoc).toHaveBeenCalledWith(db, 'users', mockUid);
        expect(mockedGetDoc).toHaveBeenCalledWith(mockDocRef);
        expect(mockedUpdateDoc).not.toHaveBeenCalled();
        expect(consoleErrorMock).toHaveBeenCalledWith("Failed to add rating:", mockError);
      });
  
      it('should log an error if updateDoc fails after getDoc succeeds', async () => {
        const newRating = 2;
        const mockUpdateError = new Error('Firestore updateDoc failed');
        mockedGetDoc.mockResolvedValue({ 
          exists: () => true,
          data: () => ({ ratings: [1] }),
        });
        mockedUpdateDoc.mockRejectedValue(mockUpdateError);
  
        await AddRating(mockUid, newRating);
        expect(mockedDoc).toHaveBeenCalledWith(db, 'users', mockUid);
        expect(mockedGetDoc).toHaveBeenCalledWith(mockDocRef);
        expect(mockedUpdateDoc).toHaveBeenCalledWith(mockDocRef, { ratings: [1, newRating] });
        expect(consoleErrorMock).toHaveBeenCalledWith("Failed to add rating:", mockUpdateError);
      });
  
      it('should attempt update and log error if document does not exist (updateDoc fails)', async () => {
        const newRating = 3.5;
        mockedGetDoc.mockResolvedValue({
          exists: () => false, 
          data: () => undefined,
        });
        const mockUpdateError = new Error('Document missing or update failed');
        mockedUpdateDoc.mockRejectedValue(mockUpdateError);
  
        await AddRating(mockUid, newRating);
        expect(mockedUpdateDoc).toHaveBeenCalledWith(mockDocRef, { ratings: [newRating] });
        expect(consoleErrorMock).toHaveBeenCalledWith("Failed to add rating:", mockUpdateError);
      });
    });
  });