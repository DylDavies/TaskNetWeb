import { sanitizeMilestoneData } from '@/app/server/formatters/MilestoneDataSanitization';
import MilestoneStatus from '@/app/enums/MilestoneStatus.enum';
import PaymentStatus from '@/app/enums/PaymentStatus.enum';
import MilestoneData from '@/app/interfaces/Milestones.interface';

let consoleErrorMock: jest.SpyInstance;
let consoleLogMock: jest.SpyInstance;

describe('sanitizeMilestoneData Formatter', () => {
  beforeEach(() => {
    consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorMock.mockRestore();
    consoleLogMock.mockRestore();
  });

  const validBaseData: Partial<MilestoneData> = {
    id: 'milestone123',
    title: 'Valid Title',
    description: 'Valid description for the milestone.',
    deadline: 20250101,
    payment: 100,
    reportURL: 'http://example.com/report.pdf',
    paymentStatus: PaymentStatus.Unpaid,
  };

  // ... (other tests remain the same) ...

  // Test the behavior when id, reportURL, paymentStatus are missing from input
  it('should NOT throw error and return object with undefined for id, reportURL, paymentStatus if they are missing from input', () => {
    const incompleteInput: Partial<MilestoneData> = {
      // Only provide fields that have explicit error checks if missing/invalid
      title: 'Valid Title Only',
      description: 'Valid Description Only',
      deadline: 20250303,
      payment: 200,
      // id, reportURL, paymentStatus are deliberately missing
    };

    let result: MilestoneData | undefined;
    let didThrow = false;

    try {
      // Pass `incompleteInput`. The `as any` is not strictly needed here if Partial is used,
      // but makes it clear we are testing missing optional properties against a function
      // that uses `!` in its return statement.
      result = sanitizeMilestoneData(incompleteInput);
    } catch (e) {
      didThrow = true;
    }

    expect(didThrow).toBe(false); // Assert that the function does NOT throw
    expect(consoleErrorMock).not.toHaveBeenCalled(); // No errors should be logged for these missing fields
    expect(consoleLogMock).toHaveBeenCalledWith("Data is safe to send to the DB!"); // This should be called

    // Check the properties of the returned object
    // The function will assign `undefined` to these because of how `MilestoneData.id!` etc. works
    // when `MilestoneData.id` is undefined on the input `Partial<MilestoneData>`.
    expect(result?.id).toBeUndefined();
    expect(result?.reportURL).toBeUndefined();
    expect(result?.paymentStatus).toBeUndefined();

    // Check that other properties are set as expected
    expect(result?.title).toBe('Valid Title Only');
    expect(result?.status).toBe(MilestoneStatus.OnHalt); // Default status
  });
});