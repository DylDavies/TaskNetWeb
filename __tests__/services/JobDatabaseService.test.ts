// __tests__/services/JobDatabaseService.test.ts
import {
    getJob, createJob, getAllJobs, updateJobStatus,
    searchByTitle, searchJobsBySkills, getJobsByClientID,
    updateHiredUId, getJobByClientIdAndHiredId, getContracted,
    getJobsByFreelancerID
} from "../../src/app/server/services/JobDatabaseService";
import JobData from "@/app/interfaces/JobData.interface";
import JobStatus from "@/app/enums/JobStatus.enum";
import UserType from "@/app/enums/UserType.enum";

jest.mock("node-fetch");
const fetch = require("node-fetch");

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
            fetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ result: null }),
            });
            const result = await getJob("invalid");
            expect(result).toBeNull();
            expect(fetch).toHaveBeenCalledWith("/api/jobs/invalid", {
                method: "GET",
                headers: { 'Content-Type': 'application/json' }
            });
        });

        it("should return job data", async () => {
            const mockData = { id: "mockId", title: "Test Job" };
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ result: mockData }),
            });
            const result = await getJob("mockUId");
            expect(result).toEqual(mockData);
            expect(fetch).toHaveBeenCalledWith("/api/jobs/mockUId", {
                method: "GET",
                headers: { 'Content-Type': 'application/json' }
            });
        });

        it("should log error if fetch fails", async () => {
            fetch.mockResolvedValueOnce({ ok: false, status: 404, json: async () => ({ message: "Job not found" }) });
            const consoleSpy = jest.spyOn(console, "error").mockImplementation();
            await getJob("nonExistentId");
            expect(consoleSpy).toHaveBeenCalledWith("Failed to get job");
            expect(fetch).toHaveBeenCalledWith("/api/jobs/nonExistentId", {
                method: "GET",
                headers: { 'Content-Type': 'application/json' }
            });
            consoleSpy.mockRestore();
        });

    });

    describe("createJob", () => {
        it("should create new job with generated ID", async () => {
            fetch.mockResolvedValueOnce({
                status: 200,
                json: async () => ({ id: "job123" }),
            });
            const result = await createJob(mockJobData);
            expect(result).toBe("job123");
            expect(fetch).toHaveBeenCalledWith("/api/jobs/create", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mockJobData)
            });
        });

        it("should handle error creating job", async () => {
            const mockError = { message: "Failed to create job on the server" };
            fetch.mockResolvedValueOnce({
                status: 500,
                json: async () => (mockError),
            });
            const consoleSpy = jest.spyOn(console, "error").mockImplementation();
            await createJob(mockJobData);
            expect(consoleSpy).toHaveBeenCalledWith(mockError);
            expect(fetch).toHaveBeenCalledWith("/api/jobs/create", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mockJobData)
            });
            consoleSpy.mockRestore(); // Clean up the spy
        });
    });

    describe("getAllJobs", () => {
        it("should return jobs with IDs", async () => {
            const mockJobs = [{ id: "1", title: "Job 1" }, { id: "2", title: "Job 2" }];
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ results: mockJobs }),
            });
            const result = await getAllJobs();
            expect(result).toEqual(mockJobs);
            expect(fetch).toHaveBeenCalledWith("/api/jobs/all", {
                method: "GET",
                headers: { 'Content-Type': 'application/json' },
            });
        });

        it("should handle errors", async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: "Failed to get all jobs from server" }),
            });
            const consoleSpy = jest.spyOn(console, "error").mockImplementation();
            await getAllJobs();
            expect(consoleSpy).toHaveBeenCalledWith("Failed to get all jobs");
            expect(fetch).toHaveBeenCalledWith("/api/jobs/all", {
                method: "GET",
                headers: { 'Content-Type': 'application/json' },
            });
            consoleSpy.mockRestore();
        });
    });

    describe("updateJobStatus", () => {
        it("should call fetch with correct parameters", async () => {
            fetch.mockResolvedValueOnce({ ok: true });
            await updateJobStatus("mockid", JobStatus.Completed);
            expect(fetch).toHaveBeenCalledWith("/api/jobs/status", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jobID: "mockid", status: JobStatus.Completed })
            });
        });

        it("should handle errors", async () => {
            fetch.mockResolvedValueOnce({ ok: false });
            const consoleSpy = jest.spyOn(console, "error").mockImplementation();
            await updateJobStatus("mockid", JobStatus.Completed);
            expect(consoleSpy).toHaveBeenCalledWith("Failed to update the job status");
            expect(fetch).toHaveBeenCalledWith("/api/jobs/status", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jobID: "mockid", status: JobStatus.Completed })
            });
            consoleSpy.mockRestore();
        });

    });

    describe("updateHiredUId", () => {
        it("should call fetch with correct parameters", async () => {
            fetch.mockResolvedValueOnce({ ok: true });
            await updateHiredUId("mockid", "mockUId");
            expect(fetch).toHaveBeenCalledWith("/api/jobs/hired", {
                method: "PATCH",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobID: "mockid", hiredUId: "mockUId" })
            });
        });

        it("should handle errors", async () => {
            fetch.mockResolvedValueOnce({ ok: false });
            const consoleSpy = jest.spyOn(console, "error").mockImplementation();
            await updateHiredUId("mockid", "mockUId");
            expect(consoleSpy).toHaveBeenCalledWith("Failed to update hiredUId");
            expect(fetch).toHaveBeenCalledWith("/api/jobs/hired", {
                method: "PATCH",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobID: "mockid", hiredUId: "mockUId" })
            });
            consoleSpy.mockRestore();
        });
    });

    describe("searchJobsByTitle", () => {
        it("should find matching jobs", async () => {
            const mockResults = [{ id: "3", title: "MockTitle Job" }];
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ results: mockResults }),
            });
            const result = await searchByTitle("mockTitle");
            expect(result).toEqual(mockResults);
            expect(fetch).toHaveBeenCalledWith("/api/jobs/search/title?title=mockTitle", {
                method: "GET",
                headers: { 'Content-Type': 'application/json' }
            });
        });

        it("should handle error", async () => {
            fetch.mockRejectedValueOnce(new Error("Failed to search jobs by title on server"));
            await expect(searchByTitle("mockTitle")).rejects.toThrow("Failed to search jobs by title");
            expect(fetch).toHaveBeenCalledWith("/api/jobs/search/title?title=mockTitle", {
                method: "GET",
                headers: { 'Content-Type': 'application/json' }
            });
        });
    });

    describe("searchJobsBySkills", () => {
        it("should find matching jobs", async () => {
            const mockResults = [{ id: "4", title: "Skilled Job", skills: { programming: ["TypeScript"] } }];
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ results: mockResults }),
            });
            const result = await searchJobsBySkills(["TypeScript"], ["programming"]);
            expect(result).toEqual(mockResults);
            expect(fetch).toHaveBeenCalledWith("/api/jobs/search/skills", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ skills: ["TypeScript"], skillIds: ["programming"] })
            });
        });

        it("should handle error", async () => {
            fetch.mockRejectedValueOnce(new Error("Failed to search jobs by skills on server"));
            await expect(searchJobsBySkills(["TypeScript"], ["programming"])).rejects.toThrow("Failed to search jobs by skills");
            expect(fetch).toHaveBeenCalledWith("/api/jobs/search/skills", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ skills: ["TypeScript"], skillIds: ["programming"] })
            });
        });

        it("should return empty array if no matching jobs", async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ results: [] }),
        });
        const result = await searchJobsBySkills(["NonExistentSkill"], []);
        expect(result).toEqual([]);
        expect(fetch).toHaveBeenCalledWith("/api/jobs/search/skills", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skills: ["NonExistentSkill"], skillIds: [] })
        });
      });

    });

    describe("getJobsByClientID", () => {
        it("should query client-specific jobs", async () => {
            const mockResults = [{ id: "5", title: "Client Job" }];
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ results: mockResults }),
            });
            const result = await getJobsByClientID("client123");
            expect(result).toEqual(mockResults);
            expect(fetch).toHaveBeenCalledWith("/api/jobs/client/client123", {
                method: "GET",
                headers: { 'Content-Type': 'application/json' }
            });
        });

        it("should handle error", async () => {
            fetch.mockRejectedValueOnce(new Error("Failed to get jobs by client ID on server"));
            await expect(getJobsByClientID("client123")).rejects.toThrow("Failed to get jobs by client ID");
            expect(fetch).toHaveBeenCalledWith("/api/jobs/client/client123", {
                method: "GET",
                headers: { 'Content-Type': 'application/json' }
            });
        });
    });

    describe("getJobByClientIdAndHiredId", () => {
        it("should fetch jobs by client and hired ID", async () => {
            const mockResults = [{ id: "6", title: "Matched Job" }];
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ results: mockResults }),
            });
            const result = await getJobByClientIdAndHiredId("client123", "hired456");
            expect(result).toEqual(mockResults);
            expect(fetch).toHaveBeenCalledWith("/api/jobs/client/client123?hiredId=hired456", {
                method: "GET",
                headers: { 'Content-Type': 'application/json' }
            });
        });

        it("should handle error", async () => {
            fetch.mockRejectedValueOnce(new Error("Failed to get jobs by client and hired ID on server"));
            await expect(getJobByClientIdAndHiredId("client123", "hired456")).rejects.toThrow("Failed to get jobs by client and hired ID");
            expect(fetch).toHaveBeenCalledWith("/api/jobs/client/client123?hiredId=hired456", {
                method: "GET",
                headers: { 'Content-Type': 'application/json' }
            });
        });
    });

    describe("getContracted", () => {
        it("should fetch contracted jobs for a client", async () => {
            const mockResults = [{ id: "7", title: "Contracted Job" }];
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ results: mockResults }),
            });
            const result = await getContracted("user789", UserType.Client);
            expect(result).toEqual(mockResults);
            expect(fetch).toHaveBeenCalledWith("/api/jobs/contracted?userId=user789&userType=2", {
                method: "GET",
                headers: { 'Content-Type': 'application/json' }
            });
        });

        it("should handle error", async () => {
            fetch.mockRejectedValueOnce(new Error("Failed to get contracted jobs on server"));
            await expect(getContracted("user789", UserType.Client)).rejects.toThrow("Failed to get contracted jobs");
            expect(fetch).toHaveBeenCalledWith("/api/jobs/contracted?userId=user789&userType=2", {
                method: "GET",
                headers: { 'Content-Type': 'application/json' }
            });
        });
    });

    describe("getJobsByFreelancerID", () => {
        it("should fetch jobs by freelancer ID", async () => {
            const mockResults = [{ id: "8", title: "Freelancer's Job" }];
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ results: mockResults }),
            });
            const result = await getJobsByFreelancerID("freelancer101");
            expect(result).toEqual(mockResults);
            expect(fetch).toHaveBeenCalledWith("/api/jobs/freelancer/freelancer101", {
                method: "GET",
                headers: { 'Content-Type': 'application/json' }
            });
        });

        it("should handle error", async () => {
            fetch.mockRejectedValueOnce(new Error("Failed to get jobs by freelancer ID on server"));
            await expect(getJobsByFreelancerID("freelancer101")).rejects.toThrow("Failed to get jobs by freelancer ID");
            expect(fetch).toHaveBeenCalledWith("/api/jobs/freelancer/freelancer101", {
                method: "GET",
                headers: { 'Content-Type': 'application/json' }
            });
        });
    });
});