import { getCompletionStats, getPaymentStats } from "../../src/app/services/statsService";
import JobStatus from "@/app/enums/JobStatus.enum";
import { getJobsBydate } from "../../src/app/server/services/JobDatabaseService"; 
import { getUsername } from "../../src/app/server/services/DatabaseService";
import { getCompletionStatsPerJob, getPaymentStatsPerJob } from "../../src/app/server/services/adminService";

// Mock Firebase and other dependencies
jest.mock("../../src/app/firebase", () => ({
  db: {}, 
}));

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
}));

jest.mock("../../src/app/server/formatters/FormatDates", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation((date) => {
    if (date instanceof Date) {
        return parseInt(`${date.getFullYear()}${("0" + (date.getMonth() + 1)).slice(-2)}${("0" + date.getDate()).slice(-2)}`);
    }
    return 20230101; 
  }),
}));

jest.mock("../../src/app/server/services/JobDatabaseService", () => ({
  getJob: jest.fn(), 
  getJobsBydate: jest.fn() 
}));

jest.mock("../../src/app/server/services/DatabaseService", () => ({
  getUsername: jest.fn(),
}));

jest.mock("../../src/app/server/services/adminService", () => ({
  getCompletionStatsPerJob: jest.fn(),
  getPaymentStatsPerJob: jest.fn(),
}));

//Name for the testsuite
describe("Statistic service tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  //testing getCompletionStats function
  describe("getCompletionStats", () => {
    it("should return correct completion stats for a given date range", async () => {
      const StartDate = new Date("2025-05-01");
      const EndDate = new Date("2025-05-15");

      const mockJobs = [
        { jobId: "job1", jobData: { status: JobStatus.Completed, createdAt: StartDate.getTime() } },
        { jobId: "job2", jobData: { status: JobStatus.Employed, createdAt: new Date("2025-05-10").getTime() } },
        { jobId: "job3", jobData: { status: JobStatus.Posted, createdAt: EndDate.getTime() } },
        { jobId: "job4", jobData: { status: JobStatus.Deleted, createdAt: StartDate.getTime() } },
      ];
      (getJobsBydate as jest.Mock).mockResolvedValue(mockJobs);

      (getCompletionStatsPerJob as jest.Mock)
        .mockResolvedValueOnce({ TotalMilestones: 2, CompletedMilestones: 2 }) // For job1
        .mockResolvedValueOnce({ TotalMilestones: 3, CompletedMilestones: 1 }) // For job2
        .mockResolvedValueOnce(null); // For job3 (Posted), assume it returns null or {TM:0, CM:0} if JobStats can be null

      const result = await getCompletionStats(StartDate, EndDate);

      expect(getJobsBydate).toHaveBeenCalledWith(StartDate, EndDate);
      expect(getCompletionStatsPerJob).toHaveBeenCalledTimes(3); // Called for job1, job2, job3
      expect(getCompletionStatsPerJob).toHaveBeenCalledWith("job1");
      expect(getCompletionStatsPerJob).toHaveBeenCalledWith("job2");
      expect(getCompletionStatsPerJob).toHaveBeenCalledWith("job3");
      expect(getCompletionStatsPerJob).not.toHaveBeenCalledWith("job4");

      expect(result).toEqual({
        totalMilestones: 5, // 2 (job1) + 3 (job2) + 0 (job3 )
        CompletedMilestones: 3, // 2 (job1) + 1 (job2) + 0 (job3)
        hiredProjects: 1, // job2
        totalProjects: 3, // job1, job2, job3 (non-deleted)
        completedProjects: 1, // job1
        completionRate: "33.33%", // 1/3
      });
    });

    it("should handle the case with no projects in the specified date range", async () => {
      const StartDate = new Date("2025-05-01");
      const EndDate = new Date("2025-05-15");
      (getJobsBydate as jest.Mock).mockResolvedValue([]); // No jobs returned

      const result = await getCompletionStats(StartDate, EndDate);

      expect(getJobsBydate).toHaveBeenCalledWith(StartDate, EndDate);
      expect(getCompletionStatsPerJob).not.toHaveBeenCalled();
      expect(result).toEqual({
        totalMilestones: 0,
        CompletedMilestones: 0,
        hiredProjects: 0,
        totalProjects: 0,
        completedProjects: 0,
        completionRate: "0.00%",
      });
    });
  });

  describe("getPaymentStats", () => {
    it("should return correct payment stats and table info for a given date range", async () => {
      const StartDate = new Date("2025-05-01");
      const EndDate = new Date("2025-05-15");

      const mockJobs = [
        { jobId: "job1", jobData: { status: JobStatus.Employed, createdAt: StartDate.getTime(), clientUId: "client1", hiredUId: "freelancer1", title: "Project A" } },
        { jobId: "job2", jobData: { status: JobStatus.Completed, createdAt: new Date("2025-05-10").getTime(), clientUId: "client2", hiredUId: "freelancer2", title: "Project B" } },
        { jobId: "job3", jobData: { status: JobStatus.Posted, createdAt: EndDate.getTime(), clientUId: "client3", hiredUId: "freelancer3", title: "Project C" } },
      ];
      (getJobsBydate as jest.Mock).mockResolvedValue(mockJobs);

      (getPaymentStatsPerJob as jest.Mock)
        .mockResolvedValueOnce({ totalPaid: 100, totalUnpaid: 20, totalESCROW: 30 }) // For job1
        .mockResolvedValueOnce({ totalPaid: 50, totalUnpaid: 10, totalESCROW: 15 });  // For job2

      (getUsername as jest.Mock)
        .mockResolvedValueOnce("Client One")     // job1 client
        .mockResolvedValueOnce("Freelancer One") // job1 freelancer
        .mockResolvedValueOnce("Client Two")     // job2 client
        .mockResolvedValueOnce("Freelancer Two"); // job2 freelancer

      const result = await getPaymentStats(StartDate, EndDate);

      expect(getJobsBydate).toHaveBeenCalledWith(StartDate, EndDate);
      expect(getPaymentStatsPerJob).toHaveBeenCalledTimes(2); // Only for Employed/Completed jobs
      expect(getPaymentStatsPerJob).toHaveBeenCalledWith("job1");
      expect(getPaymentStatsPerJob).toHaveBeenCalledWith("job2");
      expect(getUsername).toHaveBeenCalledTimes(4);
      expect(getUsername).toHaveBeenCalledWith("client1");
      expect(getUsername).toHaveBeenCalledWith("freelancer1");
      expect(getUsername).toHaveBeenCalledWith("client2");
      expect(getUsername).toHaveBeenCalledWith("freelancer2");

      expect(result).toEqual({
        tabelInfo: [
          ["job1", "Project A", "Client One", "Freelancer One", "client1", "150", "100", "20", "30"],
          ["job2", "Project B", "Client Two", "Freelancer Two", "client2", "75", "50", "10", "15"],
        ],
        totalESCROW: 45,
        totalPayed: 150,
        totalUnpaid: 30,
      });
    });

    it("should handle the case with no employed or completed projects in the specified date range", async () => {
      const StartDate = new Date("2025-05-01");
      const EndDate = new Date("2025-05-15");
      const mockJobs = [
        { jobId: "job3", jobData: { status: JobStatus.Posted, createdAt: EndDate.getTime() } },
        { jobId: "job4", jobData: { status: JobStatus.Deleted, createdAt: StartDate.getTime() } },
      ];
      (getJobsBydate as jest.Mock).mockResolvedValue(mockJobs);

      const result = await getPaymentStats(StartDate, EndDate);

      expect(getJobsBydate).toHaveBeenCalledWith(StartDate, EndDate);
      expect(getPaymentStatsPerJob).not.toHaveBeenCalled();
      expect(getUsername).not.toHaveBeenCalled();
      expect(result).toEqual({
        tabelInfo: [],
        totalESCROW: 0,
        totalPayed: 0,
        totalUnpaid: 0,
      });
    });

    it("should correctly sum payment stats but create table row with placeholders if user details are incomplete", async () => {
      const StartDate = new Date("2025-05-01");
      const EndDate = new Date("2025-05-15");
      const mockJobs = [
        { 
          jobId: "job1", 
          jobData: { 
            status: JobStatus.Employed, 
            createdAt: StartDate.getTime(), 
            clientUId: "client1", 
            hiredUId: undefined, // Freelancer UID is missing
            title: "Project With Missing Freelancer UID" 
          } 
        },
      ];
      (getJobsBydate as jest.Mock).mockResolvedValue(mockJobs);
      (getPaymentStatsPerJob as jest.Mock).mockResolvedValue({ totalPaid: 100, totalUnpaid: 20, totalESCROW: 30 });
      
      (getUsername as jest.Mock).mockImplementation(async (uid) => {
        if (uid === "client1") return "Client One";
        if (uid === undefined) return null; 
        return "Unknown User";
      });

      const result = await getPaymentStats(StartDate, EndDate);
      
      expect(getJobsBydate).toHaveBeenCalledWith(StartDate, EndDate);
      expect(getPaymentStatsPerJob).toHaveBeenCalledWith("job1");
      expect(getPaymentStatsPerJob).toHaveBeenCalledTimes(1);
      expect(getUsername).toHaveBeenCalledWith("client1");
      expect(getUsername).toHaveBeenCalledWith(undefined); 
      expect(getUsername).toHaveBeenCalledTimes(2);

      const expectedTotalAmount = (100 + 20 + 30).toString();
      expect(result).toEqual({
        tabelInfo: [
          ["job1", "Project With Missing Freelancer UID", "Client One", null, "client1", expectedTotalAmount, "100", "20", "30"],
        ],
        totalESCROW: 30,
        totalPayed: 100,
        totalUnpaid: 20,
      });
    });
  });
});