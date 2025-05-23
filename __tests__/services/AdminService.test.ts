
import { getJobsBydate } from "@/app/server/services/JobDatabaseService";
import {
  getCompletionStatsPerJob,
  getPaymentStatsPerJob,
} from "../../src/app/server/services/adminService";

import { getMilestones } from "../../src/app/server/services/MilestoneService";
import MilestoneStatus from "@/app/enums/MilestoneStatus.enum";
import PaymentStatus from "@/app/enums/PaymentStatus.enum";


// Mock Firebase and other dependencies
jest.mock("../../src/app/firebase", () => ({
  db: {},
}));

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  setDoc: jest.fn(),
  where: jest.fn(),
  arrayUnion: jest.fn(),
}));

jest.mock("../../src/app/server/formatters/FormatDates", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation((date) => {
    // Return a fixed number for testing
    return 20230101;
  }),
}));

jest.mock("../../src/app/server/services/DatabaseService", () => ({
  getUsername: jest.fn(),
}));

jest.mock("../../src/app/server/services/MilestoneService", () => ({
  getMilestones: jest.fn(),
}));

jest.mock("../../src/app/server/services/JobDatabaseService", () => ({
  getJob: jest.fn(),
  getJobsBydate: jest.fn()
}));

//what the test will be called
describe("StatsDatabaseService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });


  //Tests for get Completion Stats per job
  describe("getCompletionStatsPerJob", () => {
    it("should return completion stats for a given Job ID", async () => {
      const JobID = "job123";
      (getMilestones as jest.Mock).mockResolvedValue([
        { status: MilestoneStatus.Completed },
        { status: MilestoneStatus.InProgress },
        { status: MilestoneStatus.Completed },
        { status: MilestoneStatus.OnHalt },
      ]);

      const result = await getCompletionStatsPerJob(JobID);

      expect(getMilestones).toHaveBeenCalledWith(JobID);
      expect(result).toEqual({
        TotalMilestones: 4,
        CompletedMilestones: 2,
        PercentageComplete: 50,
      });
    });

    it("should handle the case with no milestones", async () => {
      const JobID = "job456";
      (getMilestones as jest.Mock).mockResolvedValue([]);

      const result = await getCompletionStatsPerJob(JobID);

      expect(getMilestones).toHaveBeenCalledWith(JobID);
      expect(result).toEqual({
        TotalMilestones: 0,
        CompletedMilestones: 0,
        PercentageComplete: 0,
      });
    });
  });

  //Tests for get payment stats per job
  describe("getPaymentStatsPerJob", () => {
    it("should return payment stats for a given Job ID", async () => {
      const JobID = "job789";
      (getMilestones as jest.Mock).mockResolvedValue([
        { paymentStatus: PaymentStatus.Paid, payment: 100 },
        { paymentStatus: PaymentStatus.Escrow, payment: 50 },
        { paymentStatus: PaymentStatus.Paid, payment: 75 },
        { paymentStatus: undefined, payment: 25 },
      ]);

      const result = await getPaymentStatsPerJob(JobID);

      expect(getMilestones).toHaveBeenCalledWith(JobID);
      expect(result).toEqual({
        totalESCROW: 50,
        totalPaid: 175,
        totalUnpaid: 25,
      });
    });

    it("should handle the case with no milestones or payment statuses", async () => {
      const JobID = "job101";
      (getMilestones as jest.Mock).mockResolvedValue([]);

      const result = await getPaymentStatsPerJob(JobID);

      expect(getMilestones).toHaveBeenCalledWith(JobID);
      expect(result).toEqual({
        totalESCROW: 0,
        totalPaid: 0,
        totalUnpaid: 0,
      });
    });

    it("should handle milestones with null paymentStatus", async () => {
      const JobID = "job112";
      (getMilestones as jest.Mock).mockResolvedValue([
        { paymentStatus: null, payment: 30 },
      ]);

      const result = await getPaymentStatsPerJob(JobID);

      expect(getMilestones).toHaveBeenCalledWith(JobID);
      expect(result).toEqual({
        totalESCROW: 0,
        totalPaid: 0,
        totalUnpaid: 30,
      });
    });
  });
});