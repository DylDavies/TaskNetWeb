import { getCompletionStats, getPaymentStats, getSkillStats } from "../../src/app/services/statsService"; 
import JobStatus from "@/app/enums/JobStatus.enum";
import { getJobsBydate } from "../../src/app/server/services/JobDatabaseService";
import { getUsername } from "../../src/app/server/services/DatabaseService";
import { getCompletionStatsPerJob, getPaymentStatsPerJob } from "../../src/app/server/services/adminService";
import SkillAreaAnalysis from "@/app/interfaces/SkillAreaAnalysis.interface";

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
  const StartDate = new Date("2025-05-01");
  const EndDate = new Date("2025-05-15");
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });


  //testing getCompletionStats function
  describe("getCompletionStats", () => {
    it("should return correct completion stats for a given date range", async () => {
      const mockJobs = [
        { jobId: "job1", jobData: { status: JobStatus.Completed, createdAt: StartDate.getTime() } },
        { jobId: "job2", jobData: { status: JobStatus.Employed, createdAt: new Date("2025-05-10").getTime() } },
        { jobId: "job3", jobData: { status: JobStatus.Posted, createdAt: EndDate.getTime() } }, // Corrected from 'Open' to 'Posted' as per original function
        { jobId: "job4", jobData: { status: JobStatus.Deleted, createdAt: StartDate.getTime() } },
      ];
      (getJobsBydate as jest.Mock).mockResolvedValue(mockJobs);

      (getCompletionStatsPerJob as jest.Mock)
        .mockResolvedValueOnce({ TotalMilestones: 2, CompletedMilestones: 2 }) // For job1
        .mockResolvedValueOnce({ TotalMilestones: 3, CompletedMilestones: 1 }) // For job2
        .mockResolvedValueOnce({ TotalMilestones: 1, CompletedMilestones: 0 }); // For job3 (Posted)

      const result = await getCompletionStats(StartDate, EndDate);

      expect(getJobsBydate).toHaveBeenCalledWith(StartDate, EndDate);
      expect(getCompletionStatsPerJob).toHaveBeenCalledTimes(3); // Called for job1, job2, job3
      expect(getCompletionStatsPerJob).toHaveBeenCalledWith("job1");
      expect(getCompletionStatsPerJob).toHaveBeenCalledWith("job2");
      expect(getCompletionStatsPerJob).toHaveBeenCalledWith("job3");
      expect(getCompletionStatsPerJob).not.toHaveBeenCalledWith("job4");

      expect(result).toEqual({
        totalMilestones: 6, // 2 (job1) + 3 (job2) + 1 (job3)
        CompletedMilestones: 3, // 2 (job1) + 1 (job2) + 0 (job3)
        hiredProjects: 1, // job2
        totalProjects: 3, // job1, job2, job3 (non-deleted)
        completedProjects: 1, // job1
        completionRate: "33.33%", // 1/3
      });
    });

    it("should handle the case with no projects in the specified date range", async () => {
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

    it("should handle null from getCompletionStatsPerJob for a job", async () => {
        const mockJobs = [
            { jobId: "job1", jobData: { status: JobStatus.Completed, createdAt: StartDate.getTime() } },
            { jobId: "job2", jobData: { status: JobStatus.Employed, createdAt: new Date("2025-05-10").getTime() } },
        ];
        (getJobsBydate as jest.Mock).mockResolvedValue(mockJobs);
        (getCompletionStatsPerJob as jest.Mock)
            .mockResolvedValueOnce({ TotalMilestones: 5, CompletedMilestones: 4 }) // job1
            .mockResolvedValueOnce(null); // job2 returns null

        const result = await getCompletionStats(StartDate, EndDate);
        expect(result.totalProjects).toBe(2);
        expect(result.completedProjects).toBe(1);
        expect(result.hiredProjects).toBe(1);
        expect(result.totalMilestones).toBe(5); // Only from job1
        expect(result.CompletedMilestones).toBe(4); // Only from job1
        expect(result.completionRate).toBe("50.00%");
    });
  });
  // --------------------------------------------------------------------------
  describe("getPaymentStats", () => {
    it("should return correct payment stats and table info for a given date range", async () => {
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
        if (uid === undefined) return null; // Simulate getUsername returning null for undefined UID
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
          // Ensure 'null' is used as per the function's behavior if getUsername returns null
          ["job1", "Project With Missing Freelancer UID", "Client One", null, "client1", expectedTotalAmount, "100", "20", "30"],
        ],
        totalESCROW: 30,
        totalPayed: 100,
        totalUnpaid: 20,
      });
    });
  });
  //The following is tests for get skill stats
  // --------------------------------------------------------------------------
  describe("getSkillStats", () => {
    it("should return an empty array if no jobs are found", async () => {
      (getJobsBydate as jest.Mock).mockResolvedValue([]);
      const result = await getSkillStats(StartDate, EndDate);
      expect(result).toEqual([]);
    });

    it("should correctly aggregate skill statistics for various job data and statuses", async () => {
      const mockJobs = [
        { jobId: "job1", jobData: { status: JobStatus.Completed, skills: { "WebDev": ["React ", " Node.js\n"], "Design": "Photoshop" } } },
        { jobId: "job2", jobData: { status: JobStatus.Employed, skills: { "WebDev": ["Angular", "Node.js"], "MobileDev": ["Swift "] } } },
        { jobId: "job3", jobData: { status: JobStatus.Posted, skills: { "WebDev": ["React"] } } },
        { jobId: "job4", jobData: { skills: { "Design": ["Illustrator ", "Photoshop"] } } }, // No status
        { jobId: "job5", jobData: { status: JobStatus.Completed, skills: { "WebDev": "React" } } },
        { jobId: "job6", jobData: { status: JobStatus.Completed, skills: { "WebDev": [null, "Vue", undefined, "  "] as any } } }, // Mixed valid/invalid skills
      ];
      (getJobsBydate as jest.Mock).mockResolvedValue(mockJobs);

      const result = await getSkillStats(StartDate, EndDate);

      expect(result).toHaveLength(3); // WebDev, Design, MobileDev

      const webDevStats = result.find(s => s.skillArea === "WebDev");
      expect(webDevStats).toBeDefined();
      if (webDevStats) {
        expect(webDevStats.totalProjects).toBe(5); // job1, job2, job3, job5, job6
        expect(webDevStats.hiredProjects).toBe(1); // job2
        expect(webDevStats.completedProjects).toBe(3); // job1, job5, job6
        expect(webDevStats.mostInDemandSkills).toEqual([
          { skill: "React", count: 3 },
          { skill: "Node.js", count: 2 },
          { skill: "Angular", count: 1 },
          { skill: "Vue", count: 1 },
        ]);
      }

      const designStats = result.find(s => s.skillArea === "Design");
      expect(designStats).toBeDefined();
      if (designStats) {
        expect(designStats.totalProjects).toBe(2); // job1, job4
        expect(designStats.hiredProjects).toBe(0);
        // Job4 has no status, so it won't be counted as completed.
        // Job1 is completed.
        expect(designStats.completedProjects).toBe(1);
        expect(designStats.mostInDemandSkills).toEqual([
          { skill: "Photoshop", count: 2 },
          { skill: "Illustrator", count: 1 },
        ]);
      }

      const mobileDevStats = result.find(s => s.skillArea === "MobileDev");
      expect(mobileDevStats).toBeDefined();
      if (mobileDevStats) {
        expect(mobileDevStats.totalProjects).toBe(1); // job2
        expect(mobileDevStats.hiredProjects).toBe(1); // job2
        expect(mobileDevStats.completedProjects).toBe(0);
        expect(mobileDevStats.mostInDemandSkills).toEqual([{ skill: "Swift", count: 1 }]);
      }
    });

    it("should skip jobs with missing jobData or skills property and log a warning", async () => {
      const mockJobs = [
        { jobId: "jobValid", jobData: { status: JobStatus.Posted, skills: { "TestArea": "SkillA" } } },
        { jobId: "jobMissingSkills", jobData: { status: JobStatus.Posted } }, // No skills property
        { jobId: "jobMissingJobData" }, // No jobData property
        { jobId: "jobNullSkills", jobData: { status: JobStatus.Posted, skills: null as any } },
      ];
      (getJobsBydate as jest.Mock).mockResolvedValue(mockJobs);

      const result = await getSkillStats(StartDate, EndDate);

      expect(result).toHaveLength(1);
      expect(result[0].skillArea).toBe("TestArea");
      expect(result[0].totalProjects).toBe(1);

      expect(consoleWarnSpy).toHaveBeenCalledWith('Skipping job due to missing jobData or skills:', { jobId: 'jobMissingSkills', jobData: { status: JobStatus.Posted } });
      expect(consoleWarnSpy).toHaveBeenCalledWith('Skipping job due to missing jobData or skills:', { jobId: 'jobMissingJobData' });
      expect(consoleWarnSpy).toHaveBeenCalledWith('Skipping job due to missing jobData or skills:', { jobId: 'jobNullSkills', jobData: { status: JobStatus.Posted, skills: null } });
    });

    it("should handle unexpected skills data type with a warning and continue processing", async () => {
        const mockJobs = [
            { jobId: "job1", jobData: { status: JobStatus.Posted, skills: { "ValidArea": "SkillV" } } },
            { jobId: "job2", jobData: { status: JobStatus.Posted, skills: { "InvalidArea": { skill: "Oops" } as any } } }, // skills[skillArea] is an object
            { jobId: "job3", jobData: { status: JobStatus.Posted, skills: { "AnotherValid": ["SkillX ", " SkillY"] } } },
        ];
        (getJobsBydate as jest.Mock).mockResolvedValue(mockJobs);

        const result = await getSkillStats(StartDate, EndDate);

        expect(result).toHaveLength(3); // ValidArea, InvalidArea, AnotherValid

        const validAreaStats = result.find(s => s.skillArea === "ValidArea");
        expect(validAreaStats?.totalProjects).toBe(1);
        expect(validAreaStats?.mostInDemandSkills).toEqual([{ skill: "SkillV", count: 1 }]);

        const invalidAreaStats = result.find(s => s.skillArea === "InvalidArea");
        expect(invalidAreaStats?.totalProjects).toBe(1); // Project is counted for the area
        expect(invalidAreaStats?.mostInDemandSkills).toEqual([]); // No valid skills processed from it

        const anotherValidStats = result.find(s => s.skillArea === "AnotherValid");
        expect(anotherValidStats?.totalProjects).toBe(1);
        expect(anotherValidStats?.mostInDemandSkills).toEqual([
            { skill: "SkillX", count: 1 },
            { skill: "SkillY", count: 1 },
        ]);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
            `Unexpected skills data type for job's skillArea "InvalidArea". Expected string or array, got: object`,
            { skill: "Oops" }
        );
    });

    it("should correctly trim skill names and ignore empty or whitespace-only skills", async () => {
        const mockJobs = [
            { jobId: "job1", jobData: { status: JobStatus.Posted, skills: { "Formatting": ["  SkillA  ", "\nSkillB\t", "   ", ""] } } }
        ];
        (getJobsBydate as jest.Mock).mockResolvedValue(mockJobs);
        const result = await getSkillStats(StartDate, EndDate);

        expect(result).toHaveLength(1);
        const formattingStats = result.find(s => s.skillArea === "Formatting");
        expect(formattingStats).toBeDefined();
        if (formattingStats) {
            expect(formattingStats.totalProjects).toBe(1);
            expect(formattingStats.mostInDemandSkills).toEqual([
                { skill: "SkillA", count: 1 },
                { skill: "SkillB", count: 1 },
            ]);
        }
    });
  });
});