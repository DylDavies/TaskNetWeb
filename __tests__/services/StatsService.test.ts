import { getCompletionStats, getPaymentStats } from "../../src/app/server/services/statsService";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../src/app/firebase";
import formatDateAsNumber from "../../src/app/server/formatters/FormatDates";
import JobStatus from "@/app/enums/JobStatus.enum";
import { getJob } from "../../src/app/server/services/JobDatabaseService";
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
    return 20230101;
  }),
}));

jest.mock("../../src/app/server/services/JobDatabaseService", () => ({
  getJob: jest.fn(),
}));

jest.mock("../../src/app/server/services/DatabaseService", () => ({
  getUsername: jest.fn(),
}));

jest.mock("../../src/app/server/services/adminService", () => ({
  getCompletionStatsPerJob: jest.fn(),
  getPaymentStatsPerJob: jest.fn(),
}));

describe("AdminService - Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCompletionStats", () => {
    it("should return correct completion stats for a given date range", async () => {
      const StartDate = new Date("2025-05-01");
      const EndDate = new Date("2025-05-15");
      const mockSnapshot = {
        docs: [
          { id: "job1", data: () => ({ status: JobStatus.Completed, createdAt: StartDate.getTime() }) },
          { id: "job2", data: () => ({ status: JobStatus.Employed, createdAt: new Date("2025-05-10").getTime() }) },
          { id: "job3", data: () => ({ status: JobStatus.Posted, createdAt: EndDate.getTime() }) },
          { id: "job4", data: () => ({ status: JobStatus.Deleted, createdAt: StartDate.getTime() }) },
        ],
      };
      (collection as jest.Mock).mockReturnValue({});
      (query as jest.Mock).mockReturnValue({});
      (where as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);
      (getCompletionStatsPerJob as jest.Mock)
        .mockResolvedValueOnce({ TotalMilestones: 2, CompletedMilestones: 2 })
        .mockResolvedValueOnce({ TotalMilestones: 3, CompletedMilestones: 1 });

      const result = await getCompletionStats(StartDate, EndDate);

      expect(formatDateAsNumber).toHaveBeenCalledWith(StartDate);
      expect(formatDateAsNumber).toHaveBeenCalledWith(EndDate);
      expect(collection).toHaveBeenCalledWith(db, "Jobs");
      expect(query).toHaveBeenCalledWith({},
        where('createdAt', '>=', 20230101),
        where('createdAt', '<=', 20230101)
      );
      expect(getDocs).toHaveBeenCalledWith({});
      expect(getCompletionStatsPerJob).toHaveBeenCalledWith("job1");
      expect(getCompletionStatsPerJob).toHaveBeenCalledWith("job2");
      expect(result).toEqual({
        totalMilestones: 5,
        CompletedMilestones: 3,
        hiredProjects: 1,
        totalProjects: 3,
        completedProjects: 1,
        completionRate: "33.33%",
      });
    });

    it("should handle the case with no projects in the specified date range", async () => {
      const StartDate = new Date("2025-05-01");
      const EndDate = new Date("2025-05-15");
      const mockSnapshot = { docs: [] };
      (collection as jest.Mock).mockReturnValue({});
      (query as jest.Mock).mockReturnValue({});
      (where as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await getCompletionStats(StartDate, EndDate);

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
      const mockSnapshot = {
        docs: [
          { id: "job1", data: () => ({ status: JobStatus.Employed, createdAt: StartDate.getTime(), clientUId: "client1", hiredUId: "freelancer1", title: "Project A" }) },
          { id: "job2", data: () => ({ status: JobStatus.Completed, createdAt: new Date("2025-05-10").getTime(), clientUId: "client2", hiredUId: "freelancer2", title: "Project B" }) },
          { id: "job3", data: () => ({ status: JobStatus.Posted, createdAt: EndDate.getTime() }) },
        ],
      };
      (collection as jest.Mock).mockReturnValue({});
      (query as jest.Mock).mockReturnValue({});
      (where as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);
      (getPaymentStatsPerJob as jest.Mock)
        .mockResolvedValueOnce({ totalPaid: 100, totalUnpaid: 20, totalESCROW: 30 })
        .mockResolvedValueOnce({ totalPaid: 50, totalUnpaid: 10, totalESCROW: 15 });
      (getJob as jest.Mock)
        .mockResolvedValueOnce({ clientUId: "client1", hiredUId: "freelancer1", title: "Project A" })
        .mockResolvedValueOnce({ clientUId: "client2", hiredUId: "freelancer2", title: "Project B" });
      (getUsername as jest.Mock)
        .mockResolvedValueOnce("Client One")
        .mockResolvedValueOnce("Freelancer One")
        .mockResolvedValueOnce("Client Two")
        .mockResolvedValueOnce("Freelancer Two");

      const result = await getPaymentStats(StartDate, EndDate);

      expect(formatDateAsNumber).toHaveBeenCalledWith(StartDate);
      expect(formatDateAsNumber).toHaveBeenCalledWith(EndDate);
      expect(collection).toHaveBeenCalledWith(db, "Jobs");
      expect(query).toHaveBeenCalledWith({},
        where('createdAt', '>=', 20230101),
        where('createdAt', '<=', 20230101)
      );
      expect(getDocs).toHaveBeenCalledWith({});
      expect(getPaymentStatsPerJob).toHaveBeenCalledTimes(2);
      expect(getPaymentStatsPerJob).toHaveBeenCalledWith("job1");
      expect(getPaymentStatsPerJob).toHaveBeenCalledWith("job2");
      expect(getJob).toHaveBeenCalledTimes(2);
      expect(getUsername).toHaveBeenCalledTimes(4);
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
      const mockSnapshot = {
        docs: [
          { id: "job3", data: () => ({ status: JobStatus.Posted, createdAt: EndDate.getTime() }) },
          { id: "job4", data: () => ({ status: JobStatus.Deleted, createdAt: StartDate.getTime() }) },
        ],
      };
      (collection as jest.Mock).mockReturnValue({});
      (query as jest.Mock).mockReturnValue({});
      (where as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await getPaymentStats(StartDate, EndDate);

      expect(result).toEqual({
        tabelInfo: [],
        totalESCROW: 0,
        totalPayed: 0,
        totalUnpaid: 0,
      });
    });

    it("should handle the case where getJob returns null", async () => {
      const StartDate = new Date("2025-05-01");
      const EndDate = new Date("2025-05-15");
      const mockSnapshot = {
        docs: [
          { id: "job1", data: () => ({ status: JobStatus.Employed, createdAt: StartDate.getTime(), clientUId: "client1", hiredUId: "freelancer1", title: "Project A" }) },
        ],
      };
      (collection as jest.Mock).mockReturnValue({});
      (query as jest.Mock).mockReturnValue({});
      (where as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);
      (getPaymentStatsPerJob as jest.Mock).mockResolvedValue({ totalPaid: 100, totalUnpaid: 20, totalESCROW: 30 });
      (getJob as jest.Mock).mockResolvedValue(null);
      (getUsername as jest.Mock)
        .mockResolvedValueOnce("Client One")
        .mockResolvedValueOnce("Freelancer One");

      const result = await getPaymentStats(StartDate, EndDate);

      expect(result).toEqual({
        tabelInfo: [],
        totalESCROW: 30,
        totalPayed: 100,
        totalUnpaid: 20,
      });
    });
  });
});