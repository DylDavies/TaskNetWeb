import { doc, getDoc, setDoc } from 'firebase/firestore';
import ApplicationStatus from '@/app/enums/ApplicationStatus.enum'; // Adjust the path if needed
import { AddApplication, makeApplicationID, uploadCV, hasApplied } from '../../src/app/server/services/ApplicationService'; // Adjust the path
import { uploadFile } from '../../src/app/server/services/DatabaseService'; // Adjust the path
import { getCurrentDateAsNumber } from '../../src/app/server/formatters/FormatDates';
// Mock Firebase and other dependencies
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
}));
jest.mock('../../src/app/firebase', () => ({ // Corrected path
  db: {},
}));
jest.mock('../../src/app/server/services/DatabaseService', () => ({ // Corrected path
  uploadFile: jest.fn(),
}));
jest.mock('../../src/app/server/formatters/FormatDates', () => ({
  getCurrentDateAsNumber: jest.fn(),
}));

describe('ApplicationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadCV', () => {
    it('should upload a PDF file and return the URL', async () => {
      const mockFile = { type: 'application/pdf' } as File;
      const ApplicationID = 'app123';
      const mockCVUrl = 'mock-cv-url';
      (uploadFile as jest.Mock).mockResolvedValue(mockCVUrl);

      const result = await uploadCV(mockFile, ApplicationID);

      expect(uploadFile).toHaveBeenCalledWith(mockFile, 'CV', 'app123CV');
      expect(result).toBe(mockCVUrl);
    });

    it('should alert and return an empty string if the file is not a PDF', async () => {
      const mockFile = { type: 'image/jpeg' } as File; // Simulate a non-PDF file
      const ApplicationID = 'app123';
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      const result = await uploadCV(mockFile, ApplicationID);

      expect(alertSpy).toHaveBeenCalledWith('Please submit a pdf only');
      expect(result).toBe(' ');
      alertSpy.mockRestore();
    });
  });

  describe('AddApplication', () => {
    it('should add a new application to the database', async () => {
      const ApplicantID = 'user456';
      const BidAmount = 100;
      const CVURL = 'cv-url';
      const EstimatedTimeline = 7;
      const JobID = 'job789';
      const ApplicantionID = 'job789user456'; // Expected Application ID
      const mockSetDoc = jest.fn().mockResolvedValue(undefined);
      (setDoc as jest.Mock).mockImplementation(mockSetDoc);
      (doc as jest.Mock).mockReturnValue({}); // Mock doc return

      // Mock getCurrentDateAsNumber directly
      const mockApplicationDate = 1678886400; // Example timestamp (March 15, 2023)
      (getCurrentDateAsNumber as jest.Mock).mockReturnValue(mockApplicationDate);

      await AddApplication(ApplicantID, BidAmount, CVURL, EstimatedTimeline, JobID);

      expect(setDoc).toHaveBeenCalledWith(
        {}, // Mocked doc reference
        {
          ApplicantID: ApplicantID,
          ApplicationDate: mockApplicationDate,
          BidAmount: BidAmount,
          CVURL: CVURL,
          EstimatedTimeline: EstimatedTimeline,
          JobID: JobID,
          Status: ApplicationStatus.Pending,
        }
      );
      expect(getCurrentDateAsNumber).toHaveBeenCalled();
    });
  });

  describe('hasApplied', () => {
    it('should return true if the application exists', async () => {
      const AID = 'user111';
      const JobID = 'job222';
      (getDoc as jest.Mock).mockResolvedValue({ exists: () => true });
      (doc as jest.Mock).mockReturnValue({});

      const result = await hasApplied(AID, JobID);

      expect(getDoc).toHaveBeenCalledWith({});
      expect(result).toBe(true);
    });

    it('should return false if the application does not exist', async () => {
      const AID = 'user111';
      const JobID = 'job222';
      (getDoc as jest.Mock).mockResolvedValue({ exists: () => false });
      (doc as jest.Mock).mockReturnValue({});

      const result = await hasApplied(AID, JobID);

      expect(getDoc).toHaveBeenCalledWith({});
      expect(result).toBe(false);
    });
  });

  describe('makeApplicationID', () => {
    it('should concatenate JobID and ApplicantID', () => {
      const jid = 'job123';
      const uid = 'user456';
      const result = makeApplicationID(jid, uid);
      expect(result).toBe('job123user456');
    });
  });
});