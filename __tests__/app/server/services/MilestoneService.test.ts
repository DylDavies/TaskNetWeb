import {
    getMilestones,
    addMilestone,
    updateMilestoneStatus,
    setMilestone,
    addReportURL,
    updateMilestonePaymentStatus,
  } from '@/app/server/services/MilestoneService';
  import {
    doc,
    setDoc,
    getDocs,
    addDoc,
    collection,
    updateDoc,
  } from 'firebase/firestore';
  import { db } from '@/app/firebase'; // For type context
  import MilestoneData from '@/app/interfaces/Milestones.interface';
  import PaymentStatus from '@/app/enums/PaymentStatus.enum';
  import MilestoneStatus from '@/app/enums/MilestoneStatus.enum';
  
  // --- Mocks ---
  jest.mock('firebase/firestore', () => ({
    doc: jest.fn(),
    setDoc: jest.fn(),
    getDocs: jest.fn(),
    addDoc: jest.fn(),
    collection: jest.fn(),
    updateDoc: jest.fn(),
  }));
  
  // Relative path for mocking @/app/firebase
  jest.mock('../../../../src/app/firebase.ts', () => ({
    db: {}, // Mock db instance
  }));
  // --- End Mocks ---
  
  describe('MilestoneService', () => {
    const mockJobId = 'jobTest123';
    const mockMilestoneId = 'milestoneTest456';
    const mockGenericDocRef = { id: 'mockDocRef' };
    const mockGenericCollRef = { id: 'mockCollRef' };
  
    // Typed mocks
    const mockedDoc = doc as jest.Mock;
    const mockedSetDoc = setDoc as jest.Mock;
    const mockedGetDocs = getDocs as jest.Mock;
    const mockedAddDoc = addDoc as jest.Mock;
    const mockedCollection = collection as jest.Mock;
    const mockedUpdateDoc = updateDoc as jest.Mock;
  
    let consoleErrorMock: jest.SpyInstance;
  
    beforeEach(() => {
      jest.clearAllMocks();
      consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
  
      // Default mock implementations
      mockedDoc.mockReturnValue(mockGenericDocRef);
      mockedCollection.mockReturnValue(mockGenericCollRef);
  
      // Corrected default mock for getDocs
      mockedGetDocs.mockResolvedValue({
        docs: [], // Default to empty array of docs
        forEach: function(callback: (doc: any) => void) {
          // Ensure 'this.docs' refers to the 'docs' array in this object
          (this.docs as any[]).forEach(callback);
        }
      });
  
      mockedAddDoc.mockResolvedValue({ id: mockMilestoneId });
      mockedUpdateDoc.mockResolvedValue(undefined);
      mockedSetDoc.mockResolvedValue(undefined);
    });
  
    afterEach(() => {
      consoleErrorMock.mockRestore();
    });
  
    describe('getMilestones', () => {
      it('should fetch and return milestones for a jobID', async () => {
        const milestoneData1: Omit<MilestoneData, "id"> = { title: 'M1', description: 'D1', status: MilestoneStatus.InProgress, deadline: 20250101, payment: 100, reportURL: '', paymentStatus: PaymentStatus.Unpaid };
        const milestoneData2: Omit<MilestoneData, "id"> = { title: 'M2', description: 'D2', status: MilestoneStatus.Completed, deadline: 20250201, payment: 200, reportURL: 'url', paymentStatus: PaymentStatus.Paid };
        const mockDocsArray = [
          { id: 'id1', data: () => milestoneData1 },
          { id: 'id2', data: () => milestoneData2 },
        ];
        
        // Specific mock for getDocs for this test case
        mockedGetDocs.mockResolvedValue({
          docs: mockDocsArray,
          forEach: function(callback: (doc: any) => void) {
            (this.docs as any[]).forEach(callback);
          }
        });
  
        const result = await getMilestones(mockJobId);
  
        expect(mockedCollection).toHaveBeenCalledWith(db, "Jobs", mockJobId, "milestones");
        expect(mockedGetDocs).toHaveBeenCalledWith(mockGenericCollRef);
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({ id: 'id1', ...milestoneData1 });
        expect(result[1]).toEqual({ id: 'id2', ...milestoneData2 });
        expect(consoleErrorMock).not.toHaveBeenCalled();
      });
  
      it('should return an empty array if no milestones are found', async () => {
        // beforeEach already sets up getDocs to resolve with an empty docs array
        // and a working forEach.
        mockedGetDocs.mockResolvedValue({
          docs: [],
          forEach: function(callback: (doc: any) => void) {
            (this.docs as any[]).forEach(callback);
          }
        });
        const result = await getMilestones(mockJobId);
        expect(result).toEqual([]);
        expect(consoleErrorMock).not.toHaveBeenCalled();
      });
  
      it('should throw error and log if getDocs fails', async () => {
        const mockError = new Error('Failed to fetch milestones');
        mockedGetDocs.mockRejectedValue(mockError); // This mock doesn't need the forEach structure
  
        await expect(getMilestones(mockJobId)).rejects.toThrow(mockError);
        expect(consoleErrorMock).toHaveBeenCalledWith("Error fetching milestones:", mockError);
      });
    });
  
    describe('addMilestone', () => {
      const milestonePayload: MilestoneData = { id: 'newId', title: 'New M', description: 'New D', status: MilestoneStatus.OnHalt, deadline: 20250301, payment: 150, reportURL: '', paymentStatus: PaymentStatus.Unpaid };
  
      it('should add a new milestone and return its ID', async () => {
        const newId = 'generatedId123';
        mockedAddDoc.mockResolvedValue({ id: newId });
  
        const result = await addMilestone(mockJobId, milestonePayload);
  
        expect(mockedCollection).toHaveBeenCalledWith(db, "Jobs", mockJobId, "milestones");
        expect(mockedAddDoc).toHaveBeenCalledWith(mockGenericCollRef, milestonePayload);
        expect(result).toBe(newId);
        expect(consoleErrorMock).not.toHaveBeenCalled();
      });
  
      it('should throw error and log if addDoc fails', async () => {
        const mockError = new Error('Failed to add milestone');
        mockedAddDoc.mockRejectedValue(mockError);
  
        await expect(addMilestone(mockJobId, milestonePayload)).rejects.toThrow(mockError);
        expect(consoleErrorMock).toHaveBeenCalledWith("Error adding milestone:", mockError);
      });
    });
  
    describe('updateMilestoneStatus', () => {
      const newStatus = MilestoneStatus.Completed; // Assuming status is a number as per function signature
  
      it('should update the status of a specific milestone', async () => {
        await updateMilestoneStatus(mockJobId, mockMilestoneId, newStatus);
  
        expect(mockedDoc).toHaveBeenCalledWith(db, "Jobs", mockJobId, "milestones", mockMilestoneId);
        expect(mockedUpdateDoc).toHaveBeenCalledWith(mockGenericDocRef, { status: newStatus });
        expect(consoleErrorMock).not.toHaveBeenCalled();
      });
  
      it('should throw error and log if updateDoc fails', async () => {
        const mockError = new Error('Failed to update status');
        mockedUpdateDoc.mockRejectedValue(mockError);
  
        await expect(updateMilestoneStatus(mockJobId, mockMilestoneId, newStatus)).rejects.toThrow(mockError);
        expect(consoleErrorMock).toHaveBeenCalledWith("Error updating milestone status:", mockError);
      });
    });
  
    describe('setMilestone', () => {
      const milestoneDataToSet: MilestoneData = { id: mockMilestoneId, title: 'Set M', description: 'Set D', status: MilestoneStatus.OnHalt, deadline: 20250401, payment: 300, reportURL: 'set.url', paymentStatus: PaymentStatus.Escrow };
  
      it('should set (overwrite) a specific milestone', async () => {
        await setMilestone(mockJobId, mockMilestoneId, milestoneDataToSet);
  
        expect(mockedDoc).toHaveBeenCalledWith(db, "Jobs", mockJobId, "milestones", mockMilestoneId);
        expect(mockedSetDoc).toHaveBeenCalledWith(mockGenericDocRef, milestoneDataToSet);
        expect(consoleErrorMock).not.toHaveBeenCalled();
      });
  
      it('should throw error and log if setDoc fails', async () => {
        const mockError = new Error('Failed to set milestone');
        mockedSetDoc.mockRejectedValue(mockError);
  
        await expect(setMilestone(mockJobId, mockMilestoneId, milestoneDataToSet)).rejects.toThrow(mockError);
        expect(consoleErrorMock).toHaveBeenCalledWith("Error setting milestone:", mockError);
      });
    });
  
    describe('addReportURL', () => {
      const reportUrl = 'http://example.com/new_report.pdf';
  
      it('should update the reportURL of a specific milestone', async () => {
        await addReportURL(mockJobId, mockMilestoneId, reportUrl);
  
        expect(mockedDoc).toHaveBeenCalledWith(db, "Jobs", mockJobId, "milestones", mockMilestoneId);
        expect(mockedUpdateDoc).toHaveBeenCalledWith(mockGenericDocRef, { reportURL: reportUrl });
        expect(consoleErrorMock).not.toHaveBeenCalled();
      });
  
      it('should throw error and log if updateDoc fails', async () => {
        const mockError = new Error('Failed to add report URL');
        mockedUpdateDoc.mockRejectedValue(mockError);
  
        await expect(addReportURL(mockJobId, mockMilestoneId, reportUrl)).rejects.toThrow(mockError);
        expect(consoleErrorMock).toHaveBeenCalledWith("Error adding milestone report url:", mockError);
      });
    });
  
    describe('updateMilestonePaymentStatus', () => {
      const newPaymentStatus = PaymentStatus.Paid;
  
      it('should update the paymentStatus of a specific milestone', async () => {
        await updateMilestonePaymentStatus(mockJobId, mockMilestoneId, newPaymentStatus);
  
        expect(mockedDoc).toHaveBeenCalledWith(db, "Jobs", mockJobId, "milestones", mockMilestoneId);
        expect(mockedUpdateDoc).toHaveBeenCalledWith(mockGenericDocRef, { paymentStatus: newPaymentStatus });
        expect(consoleErrorMock).not.toHaveBeenCalled();
      });
  
      it('should throw error and log if updateDoc fails', async () => {
        const mockError = new Error('Failed to update payment status');
        mockedUpdateDoc.mockRejectedValue(mockError);
  
        await expect(updateMilestonePaymentStatus(mockJobId, mockMilestoneId, newPaymentStatus)).rejects.toThrow(mockError);
        expect(consoleErrorMock).toHaveBeenCalledWith("Error setting milestone:", mockError);
      });
    });
  });