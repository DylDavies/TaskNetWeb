import { 
    getJob, createJob, getAllJobs, updateJobStatus, 
    searchByTitle, searchJobsBySkills, getJobsByClientID 
  } from "../../src/app/server/services/JobDatabaseService";
  import { collection, doc, getDoc, addDoc, getDocs, query, where } from "firebase/firestore";
  import { db } from "@/app/firebase";
import JobData from "@/app/interfaces/JobData.interface";
import JobStatus from "@/app/enums/JobStatus.enum";
  
  jest.mock("firebase/firestore");
  
  const mockJobData: JobData = {
    title: "Developer",
    description: "Job description",
    status: JobStatus.Posted,
    skills: { programming: ["TypeScript"] },
    budgetMax: 100,
    budgetMin: 100,
    clientUId: "mockUid",
    createdAt: 100,
    deadline: 100,
    hiredUId: "mockUid"
  };
  
  describe("JobDatabaseService", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    describe("getJob", () => {
      it("should return null for non-existent job", async () => {
        (getDoc as jest.Mock).mockResolvedValue({ exists: () => false });
        const result = await getJob("invalid");
        expect(result).toBeNull();
      });
    });
  
    describe("createJob", () => {
      it("should create new job with generated ID", async () => {
        (addDoc as jest.Mock).mockResolvedValue({ id: "job123" });
        const result = await createJob(mockJobData);
        expect(result).toBe("job123");
      });
    });
  
    // describe("getAllJobs", () => {
    //   it("should return jobs with IDs", async () => {
    //     const forEach = jest.fn((cb) => cb({data: jest.fn().mockReturnValue({skills: []})}));
    //     (getDocs as jest.Mock).mockResolvedValue({ forEach });
        
    //     const { jobs, jobIDs } = await getAllJobs();
    //     expect(jobs).toHaveLength(1);
    //     expect(jobIDs).toEqual(["1"]);
    //   });
    // });
  
    describe("searchJobsBySkills", () => {
      it("should find matching jobs", async () => {
        const forEach = jest.fn((cb) => cb({data: jest.fn().mockReturnValue({skills: []})}));
        (getDocs as jest.Mock).mockResolvedValue({ forEach });
        
        const result = await searchJobsBySkills(["TypeScript"], ["programming"]);
        expect(result).toHaveLength(0);
      });
    });
  
    describe("getJobsByClientID", () => {
      it("should query client-specific jobs", async () => {
        const forEach = jest.fn((cb) => cb({data: jest.fn()}));
        (getDocs as jest.Mock).mockResolvedValue({ forEach });
        
        await getJobsByClientID("client123");
        expect(query).toHaveBeenCalledWith(
          collection(db, "Jobs"),
          where("clientUId", "==", "client123")
        );
      });
    });
  });