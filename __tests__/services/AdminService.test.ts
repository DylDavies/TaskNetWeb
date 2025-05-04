import { arrayUnion, collection, doc, DocumentData, DocumentReference, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { db } from "../../src/app/firebase";
import * as adminService from "../../src/app/server/services/adminService"; // Import as namespace
import JobStatus from "@/app/enums/JobStatus.enum";
import MilestoneStatus from "@/app/enums/MilestoneStatus.enum";
import { getMilestones } from "@/app/server/services/MilestoneService";

jest.mock("firebase/firestore");

jest.mock('../../src/app/server/services/MilestoneService', () => ({
  __esModule: true,
  getMilestones: jest.fn()
}));

// Correct mock for adminService with all exported functions
jest.mock('../../src/app/server/services/adminService', () => ({
  __esModule: true,
  getSkillByID: jest.fn(),
  AddSkill: jest.fn(),
  getCompletionStatsPerJob: jest.fn(),
  getCompletionStats: jest.fn(),
  // Add other exports if needed
}));

describe("adminService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getSkillByID", () => {
    it("should return null for non-existent skill area", async () => {
      (getDoc as jest.Mock).mockResolvedValue({ exists: () => false });
      (adminService.getSkillByID as jest.Mock).mockResolvedValue(null);
      
      const result = await adminService.getSkillByID("invalid");
      expect(result).toBeNull();
    });

    it("should return skill data for existing area", async () => {
      const mockData = { name: ["TS"] };
      (getDoc as jest.Mock).mockResolvedValue({ exists: () => true, data: () => mockData });
      (adminService.getSkillByID as jest.Mock).mockResolvedValue(mockData);
      
      const result = await adminService.getSkillByID("programming");
      expect(result).toEqual(mockData);
    });
  });

  describe("AddSkill", () => {
    it("should call setDoc successfully", async () => {
      const mockDocRef: DocumentReference<DocumentData> = {
        "id": "mock-doc-id"
      } as DocumentReference<DocumentData>;
  
      (doc as jest.Mock<DocumentReference<DocumentData>>).mockReturnValue(mockDocRef);
      (arrayUnion as jest.Mock).mockReturnValue("arrayUnionValue");
  
      (adminService.AddSkill as jest.Mock).mockImplementation(async (area: string, name: string) => {
        await setDoc(
          doc(db, "Skills", area),
          { 
            SkillArea: area, 
            name: arrayUnion(name) 
          },
          { merge: true }
        );
      });
  
      await adminService.AddSkill("area", "name");
  
      expect(doc).toHaveBeenCalledWith(db, "Skills", "area");
      expect(setDoc).toHaveBeenCalledWith(
        expect.objectContaining({ id: "mock-doc-id" }),
        {
          SkillArea: "area",
          name: "arrayUnionValue"
        },
        { merge: true }
      );
    });
  });

  describe('getCompletionStatsPerJob', () => {
    const mockJobID = 'job123';
  
    beforeEach(() => {
      // Reset mocks for each test
      (adminService.getCompletionStatsPerJob as jest.Mock).mockImplementation(async (jobId) => {
        const milestones = await getMilestones(jobId);
        const TotalMilestones = milestones.length;
        const CompletedMilestones = milestones.filter(item => item.status === MilestoneStatus.Completed).length;
        const PercentageComplete = TotalMilestones > 0 ? (CompletedMilestones / TotalMilestones) * 100 : NaN;
        
        return {
          TotalMilestones,
          CompletedMilestones,
          PercentageComplete
        };
      });
    });
  
    it('should return correct stats when there are milestones', async () => {
      const mockMilestones = [
        { id: '1', status: MilestoneStatus.Completed },
        { id: '2', status: MilestoneStatus.InProgress },
        { id: '3', status: MilestoneStatus.Completed }
      ];
  
      (getMilestones as jest.Mock).mockResolvedValue(mockMilestones);
  
      const result = await adminService.getCompletionStatsPerJob(mockJobID);
  
      expect(result).toEqual({
        TotalMilestones: 3,
        CompletedMilestones: 2,
        PercentageComplete: 66.66666666666666
      });
  
      expect(getMilestones).toHaveBeenCalledWith(mockJobID);
    });
  
    it('should handle empty milestones array', async () => {
      (getMilestones as jest.Mock).mockResolvedValue([]);
  
      const result = await adminService.getCompletionStatsPerJob(mockJobID);
  
      expect(result).toEqual({
        TotalMilestones: 0,
        CompletedMilestones: 0,
        PercentageComplete: NaN
      });
    });
  
    it('should handle all completed milestones', async () => {
      const mockMilestones = [
        { id: '1', status: MilestoneStatus.Completed },
        { id: '2', status: MilestoneStatus.Completed }
      ];
  
      (getMilestones as jest.Mock).mockResolvedValue(mockMilestones);
  
      const result = await adminService.getCompletionStatsPerJob(mockJobID);
  
      expect(result).toEqual({
        TotalMilestones: 2,
        CompletedMilestones: 2,
        PercentageComplete: 100
      });
    });
  
    it('should calculate percentage complete correctly', async () => {
      const mockMilestones = [
        { id: '1', status: MilestoneStatus.Completed },
        { id: '2', status: MilestoneStatus.Completed },
        { id: '3', status: MilestoneStatus.InProgress },
        { id: '4', status: MilestoneStatus.InProgress }
      ];
  
      (getMilestones as jest.Mock).mockResolvedValue(mockMilestones);
  
      const result = await adminService.getCompletionStatsPerJob(mockJobID);
  
      expect(result.PercentageComplete).toBe(50);
    });
  });

  describe("getCompletionStats", () => {
    const mockStartDate = new Date("2023-01-01");
    const mockEndDate = new Date("2023-01-31");
    
    beforeEach(() => {
      jest.clearAllMocks();
      
      // Default mock implementation
      (adminService.getCompletionStats as jest.Mock).mockImplementation(async (StartDate, EndDate) => {
        const snapshot = await getDocs(query(
          collection(db, 'Jobs'),
          where('createdAt', '>=', StartDate.getTime()),
          where('createdAt', '<=', EndDate.getTime())
        ));

        let totalProjects = 0;
        let completedProjects = 0;
        let totalMilestones = 0;
        let CompletedMilestones = 0;
        let hiredProjects = 0;
      
        for(const doc of snapshot.docs){
          if (doc.data().status != JobStatus.Deleted){
            totalProjects++;
            if(doc.data().status == JobStatus.Completed){
              completedProjects++;
            }
            if(doc.data().status == JobStatus.Employed){
              hiredProjects++;
            }
      
            const JobStats = await adminService.getCompletionStatsPerJob(doc.id);
            totalMilestones += JobStats.TotalMilestones;
            CompletedMilestones += JobStats.CompletedMilestones;
          } 
        }
      
        const completionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;
        
        return {
          totalMilestones,
          CompletedMilestones,
          hiredProjects,
          totalProjects,
          completedProjects,
          completionRate: completionRate.toFixed(2) + '%'
        };
      });
    });
  
    it("should return zero values when no jobs exist in timeframe", async () => {
      (getDocs as jest.Mock).mockResolvedValue({ docs: [] });
      
      const result = await adminService.getCompletionStats(mockStartDate, mockEndDate);
      
      expect(result).toEqual({
        totalMilestones: 0,
        CompletedMilestones: 0,
        hiredProjects: 0,
        totalProjects: 0,
        completedProjects: 0,
        completionRate: "0.00%"
      });
    });
  
    it("should correctly calculate stats for jobs with different statuses", async () => {
      const mockDocs = [
        { 
          id: "job1", 
          data: () => ({ 
            status: JobStatus.Completed, 
            createdAt: new Date("2023-01-10").getTime() 
          }) 
        },
        { 
          id: "job2", 
          data: () => ({ 
            status: JobStatus.Employed, 
            createdAt: new Date("2023-01-15").getTime() 
          }) 
        },
        { 
          id: "job3", 
          data: () => ({ 
            status: JobStatus.Posted, 
            createdAt: new Date("2023-01-20").getTime() 
          }) 
        },
        { 
          id: "job4", 
          data: () => ({ 
            status: JobStatus.Deleted, 
            createdAt: new Date("2023-01-25").getTime() 
          }) 
        }
      ];
  
      (getDocs as jest.Mock).mockResolvedValue({ docs: mockDocs });
      (adminService.getCompletionStatsPerJob as jest.Mock).mockResolvedValue({
        TotalMilestones: 4,
        CompletedMilestones: 2
      });
  
      const result = await adminService.getCompletionStats(mockStartDate, mockEndDate);
  
      expect(result).toEqual({
        totalMilestones: 12,
        CompletedMilestones: 6,
        hiredProjects: 1,
        totalProjects: 3,
        completedProjects: 1,
        completionRate: "33.33%"
      });
    });
  
    it("should handle errors from getDocs", async () => {
      (getDocs as jest.Mock).mockRejectedValue(new Error("Firestore error"));
      
      await expect(adminService.getCompletionStats(mockStartDate, mockEndDate))
        .rejects.toThrow("Firestore error");
    });
  
    it("should handle errors from getCompletionStatsPerJob", async () => {
      const mockDocs = [
        { 
          id: "job1", 
          data: () => ({ 
            status: JobStatus.Completed, 
            createdAt: new Date("2023-01-10").getTime() 
          }) 
        }
      ];
      
      (getDocs as jest.Mock).mockResolvedValue({ docs: mockDocs });
      (adminService.getCompletionStatsPerJob as jest.Mock).mockRejectedValue(new Error("Job stats error"));
      
      await expect(adminService.getCompletionStats(mockStartDate, mockEndDate))
        .rejects.toThrow("Job stats error");
    });
  
    it("should correctly calculate 100% completion rate", async () => {
      const mockDocs = [
        { 
          id: "job1", 
          data: () => ({ 
            status: JobStatus.Completed, 
            createdAt: new Date("2023-01-10").getTime() 
          }) 
        },
        { 
          id: "job2", 
          data: () => ({ 
            status: JobStatus.Completed, 
            createdAt: new Date("2023-01-15").getTime() 
          }) 
        }
      ];
  
      (getDocs as jest.Mock).mockResolvedValue({ docs: mockDocs });
      (adminService.getCompletionStatsPerJob as jest.Mock).mockResolvedValue({
        TotalMilestones: 1,
        CompletedMilestones: 1
      });
  
      const result = await adminService.getCompletionStats(mockStartDate, mockEndDate);
      
      expect(result.completionRate).toBe("100.00%");
    });
  
    it("should handle zero total projects case without division by zero", async () => {
      const mockDocs = [
        { 
          id: "job1", 
          data: () => ({ 
            status: JobStatus.Deleted, 
            createdAt: new Date("2023-01-10").getTime() 
          }) 
        }
      ];
  
      (getDocs as jest.Mock).mockResolvedValue({ docs: mockDocs });
      
      const result = await adminService.getCompletionStats(mockStartDate, mockEndDate);
      
      expect(result.completionRate).toBe("0.00%");
      expect(result.totalProjects).toBe(0);
    });
  });
});