import {
  getApplicant,
  getPendingApplicants,
  acceptApplicant,
  rejectApplicant,
} from '@/app/server/services/ApplicationDatabaseServices';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/app/firebase'; // For type context
import { getUsername } from '@/app/server/services/DatabaseService'; // For type context
import ApplicationStatus from '@/app/enums/ApplicationStatus.enum';
import ApplicantData from '@/app/interfaces/ApplicationData.interface';

// --- Mocks ---
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
}));

// Corrected path based on user feedback
jest.mock('../../../../src/app/firebase.ts', () => ({
  db: {}, // Mock db instance, can be simple object
}));

// Corrected path based on user feedback
jest.mock('../../../../src/app/server/services/DatabaseService.ts', () => ({
  getUsername: jest.fn(),
}));
// --- End Mocks ---

describe('ApplicationDatabaseServices', () => {
  const mockApplicantId = 'applicant123';
  const mockJobId = 'job456';
  const mockApplicationId = 'app789';
  const mockDocRef = { id: 'mockDocRef' }; // Generic mock doc ref

  // Typed mocks
  const mockedDoc = doc as jest.Mock;
  const mockedGetDoc = getDoc as jest.Mock;
  const mockedCollection = collection as jest.Mock;
  const mockedQuery = query as jest.Mock;
  const mockedWhere = where as jest.Mock;
  const mockedGetDocs = getDocs as jest.Mock;
  const mockedUpdateDoc = updateDoc as jest.Mock;
  const mockedGetUsernameFunc = getUsername as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Default implementations for mocks
    mockedDoc.mockReturnValue(mockDocRef); // doc() returns our generic mockDocRef
    mockedCollection.mockReturnValue({ id: 'mockCollRef' }); // collection() returns a mock collection ref
    mockedQuery.mockReturnValue({ id: 'mockQueryRef' });    // query() returns a mock query ref
    mockedWhere.mockImplementation((field, op, value) => ({ // where() returns a simplified constraint object
        type: 'whereConstraint', field, op, value 
    }));
    mockedUpdateDoc.mockResolvedValue(undefined); // Default: updateDoc succeeds
    mockedGetDoc.mockResolvedValue({ exists: () => false, data: () => undefined }); // Default: doc not found
    mockedGetDocs.mockResolvedValue({ docs: [] }); // Default: no docs found
    mockedGetUsernameFunc.mockResolvedValue('mocked-username'); // Default for getUsername
  });

  describe('getApplicant', () => {
    it('should return applicant data if document exists', async () => {
      const fakeData = { ApplicantID: mockApplicantId, JobID: mockJobId, Status: ApplicationStatus.Pending } as ApplicantData;
      mockedGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => fakeData,
      });

      const result = await getApplicant(mockApplicationId);

      expect(mockedDoc).toHaveBeenCalledWith(db, 'applications', mockApplicationId);
      expect(mockedGetDoc).toHaveBeenCalledWith(mockDocRef);
      expect(result).toEqual(fakeData);
    });

    it('should return null if document does not exist', async () => {
      mockedGetDoc.mockResolvedValue({
        exists: () => false,
        data: () => undefined,
      });
      const result = await getApplicant(mockApplicationId);
      expect(result).toBeNull();
    });
  });

  describe('getPendingApplicants', () => {
    // THIS TEST ASSUMES THE SOURCE CODE OF getPendingApplicants HAS BEEN FIXED
    // TO USE Promise.all and await getUsername for each applicant.
    it('should return pending applicants for a job with resolved usernames', async () => {
      const appData1 = { ApplicantID: 'app1', JobID: mockJobId, Status: ApplicationStatus.Pending, ApplicationDate: '2023-01-01', BidAmount: 100, CVURL: 'cv1.pdf', EstimatedTimeline: '1 week' };
      const appData2 = { ApplicantID: 'app2', JobID: mockJobId, Status: ApplicationStatus.Pending, ApplicationDate: '2023-01-02', BidAmount: 150, CVURL: 'cv2.pdf', EstimatedTimeline: '2 weeks' };
      const mockDocsArray = [
        { id: 'docId1', data: () => appData1 },
        { id: 'docId2', data: () => appData2 },
      ];
      mockedGetDocs.mockResolvedValue({ docs: mockDocsArray });

      // Mock getUsername to return specific resolved usernames
      mockedGetUsernameFunc
        .mockImplementation(async (id: string) => `username-for-${id}`);

      const result = await getPendingApplicants(mockJobId);

      expect(mockedCollection).toHaveBeenCalledWith(db, 'applications');
      const whereConstraint1 = expect.objectContaining({ field: 'Status', op: '==', value: ApplicationStatus.Pending });
      const whereConstraint2 = expect.objectContaining({ field: 'JobID', op: '==', value: mockJobId });
      expect(mockedWhere).toHaveBeenCalledWith('Status', '==', ApplicationStatus.Pending);
      expect(mockedWhere).toHaveBeenCalledWith('JobID', '==', mockJobId);
      expect(mockedQuery).toHaveBeenCalledWith(expect.anything(), whereConstraint1, whereConstraint2);
      expect(mockedGetDocs).toHaveBeenCalledWith(expect.anything());

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ ...appData1, ApplicationID: 'docId1', username: 'username-for-app1' });
      expect(result[1]).toEqual({ ...appData2, ApplicationID: 'docId2', username: 'username-for-app2' });
      expect(mockedGetUsernameFunc).toHaveBeenCalledWith('app1');
      expect(mockedGetUsernameFunc).toHaveBeenCalledWith('app2');
    });

    it('should return an empty array if no pending applicants found', async () => {
      mockedGetDocs.mockResolvedValue({ docs: [] }); // No documents
      const result = await getPendingApplicants(mockJobId);
      expect(result).toEqual([]);
      expect(mockedGetUsernameFunc).not.toHaveBeenCalled();
    });
  });

  describe('acceptApplicant', () => {
    it('should update applicant status to Approved', async () => {
      await acceptApplicant(mockApplicationId);
      expect(mockedDoc).toHaveBeenCalledWith(db, 'applications', mockApplicationId);
      expect(mockedUpdateDoc).toHaveBeenCalledWith(mockDocRef, { Status: ApplicationStatus.Approved });
    });

    it('should propagate error if updateDoc fails for acceptApplicant', async () => {
      const specificError = new Error("Accepting Update Failed");
      mockedUpdateDoc.mockRejectedValue(specificError);
      // mockedDoc is already set in beforeEach to return mockDocRef

      await expect(acceptApplicant(mockApplicationId)).rejects.toThrow("Accepting Update Failed");
    });
  });

  describe('rejectApplicant', () => {
    it('should update applicant status to Denied', async () => {
      await rejectApplicant(mockApplicationId);
      expect(mockedDoc).toHaveBeenCalledWith(db, 'applications', mockApplicationId);
      expect(mockedUpdateDoc).toHaveBeenCalledWith(mockDocRef, { Status: ApplicationStatus.Denied });
    });

    it('should propagate error if updateDoc fails for rejectApplicant', async () => {
      const specificError = new Error("Rejecting Update Failed");
      mockedUpdateDoc.mockRejectedValue(specificError);
      // mockedDoc is already set in beforeEach to return mockDocRef

      await expect(rejectApplicant(mockApplicationId)).rejects.toThrow("Rejecting Update Failed");
    });
  });
});