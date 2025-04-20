import { 
    getJob, createJob, getAllJobs, updateJobStatus, 
    searchByTitle, searchJobsBySkills, getJobsByClientID, 
    updateHiredUId
  } from "../../src/app/server/services/JobDatabaseService";
  import { collection, doc, getDoc, addDoc, getDocs, query, where, updateDoc } from "firebase/firestore";
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

      it("should return job", async () => {
        (getDoc as jest.Mock).mockResolvedValue({ exists: () => true, data: () => "data" });
        const result = await getJob("mockUId");
        expect(result).toBe("data");
      })
    });
  
    describe("createJob", () => {
      it("should create new job with generated ID", async () => {
        (addDoc as jest.Mock).mockResolvedValue({ id: "job123" });
        const result = await createJob(mockJobData);
        expect(result).toBe("job123");
      });

      it("should handle error creating job", async () => {
        const err = new Error("error");
        (addDoc as jest.Mock).mockRejectedValue(err);

        await expect(createJob(mockJobData)).rejects.toThrow("Failed to create job");
      })
    });
  
    describe("getAllJobs", () => {
      it("should return jobs with IDs", async () => {
        const mockJobs: string[] = ["1", "2"];
        const forEach = jest.fn((cb) => {
          for (let j of mockJobs) {
            cb({data: () => j, id: j});
          }
        });
        (getDocs as jest.Mock).mockResolvedValue({ forEach });
        
        const result = await getAllJobs();
        expect(result).toHaveLength(2);
      });

      it("should handle errors", async () => {
        (getDocs as jest.Mock).mockRejectedValue(new Error("error"));

        await expect(getAllJobs()).rejects.toThrow("Failed to get jobs");
      })
    });

    describe("updateJobStatus", () => {
      it("should call update doc with status", async () => {
        (doc as jest.Mock).mockReturnValue("doc");

        await updateJobStatus("mockid", JobStatus.Completed);

        expect(updateDoc).toHaveBeenCalledWith("doc", {status: JobStatus.Completed});
      });

      it("should handle errors", async () => {
        (updateDoc as jest.Mock).mockRejectedValue(new Error("error"));

        const consoleSpy = jest.spyOn(console, "error").mockImplementation();

        await updateJobStatus("mockid", JobStatus.Completed);

        expect(consoleSpy).toHaveBeenCalled();
      })
    });

    describe("updateHiredUId", () => {
      it("should call update doc with hiredUId", async () => {
        (doc as jest.Mock).mockReturnValue("doc");

        await updateHiredUId("mockid", "mockUId");

        expect(updateDoc).toHaveBeenCalledWith("doc", {hiredUId: "mockUId"});
      });

      it("should handle errors", async () => {
        (updateDoc as jest.Mock).mockRejectedValue(new Error("error"));

        const consoleSpy = jest.spyOn(console, "error").mockImplementation();

        await updateHiredUId("mockid", "mockUId");

        expect(consoleSpy).toHaveBeenCalled();
      })
    });

    describe("searchJobsByTitle", () => {
      it("should find matching jobs", async () => {
        const forEach = jest.fn((cb) => cb({data: jest.fn().mockReturnValue("job")}));
        (getDocs as jest.Mock).mockResolvedValue({ forEach });
        
        const result = await searchByTitle("mockTitle");
        expect(result).toHaveLength(1);
      });

      it("should handle error", async () => {
        (getDocs as jest.Mock).mockRejectedValue(new Error("mock error"));

        await expect(searchByTitle("mockTitle")).rejects.toThrow("mock error");
      });
    });
  
    describe("searchJobsBySkills", () => {
      it("should find matching jobs", async () => {
        const forEach = jest.fn((cb) => cb({data: jest.fn().mockReturnValue({skills: []})}));
        (getDocs as jest.Mock).mockResolvedValue({ forEach });
        
        const result = await searchJobsBySkills(["TypeScript"], ["programming"]);
        expect(result).toHaveLength(0);
      });

      it("should handle no skills or no skillids", async () => {
        await expect(searchJobsBySkills([], [])).rejects.toThrow("Skills and skillIds must be provided");
      });

      it("should handle error", async () => {
        (getDocs as jest.Mock).mockRejectedValue(new Error("mock error"));

        await expect(searchJobsBySkills(["TypeScript"], ["programming"])).rejects.toThrow("mock error");
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