import JobStatus from "@/app/enums/JobStatus.enum";
import { getJobsBydate } from "../server/services/JobDatabaseService";
import { getUsername } from "../server/services/DatabaseService";
import SkillAreaAnalysis from "@/app/interfaces/SkillAreaAnalysis.interface";
import { getCompletionStatsPerJob, getPaymentStatsPerJob } from "../server/services/adminService";

//This function will return the completion stats for the given date range
async function getCompletionStats(StartDate: Date, EndDate: Date) {

  // Query projects for the given timeframe
  const Jobs = await getJobsBydate(StartDate, EndDate);

  let totalProjects = 0;
  let completedProjects = 0;
  let totalMilestones = 0;
  let CompletedMilestones = 0;
  let hiredProjects = 0;
 
  for(const doc of Jobs){
    if (doc.jobData.status != JobStatus.Deleted){

    totalProjects++;
    if(doc.jobData.status == JobStatus.Completed){
      completedProjects++;
    }
    if(doc.jobData.status == JobStatus.Employed){
      hiredProjects++;
      
    }

    //Completion stats for each job
    const JobStats = await getCompletionStatsPerJob(doc.jobId)
    if(JobStats){
        totalMilestones = totalMilestones + JobStats.TotalMilestones;
        CompletedMilestones = CompletedMilestones + JobStats.CompletedMilestones;
    }
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
}

//This funciton will return the payment stats for the given date range
async function getPaymentStats(StartDate: Date, EndDate: Date) {

  //getting the projects in the given timeframe
  const Jobs = await getJobsBydate(StartDate, EndDate);

  let totalPayed = 0;
  let totalESCROW = 0;
  let totalUnpaid = 0;
  const tabelInfo: string[][]= [];
  
  //Getting paymetn stats for each job in the db
  for(const doc of Jobs){
    if (doc.jobData.status === JobStatus.Employed || doc.jobData.status === JobStatus.Completed ){

    const JobStats = await getPaymentStatsPerJob(doc.jobId);
      
    totalPayed += JobStats.totalPaid;
    totalESCROW += JobStats.totalESCROW;
    totalUnpaid += JobStats.totalUnpaid;
    

    const JobData = doc.jobData
    const totalAmount = JobStats.totalESCROW + JobStats.totalPaid + JobStats.totalUnpaid;
    if(JobData){
      const ClientName = await getUsername(JobData.clientUId);
      const FreelanceName = await getUsername(JobData.hiredUId);
      tabelInfo.push([doc.jobId, JobData.title, ClientName, FreelanceName, JobData.clientUId, totalAmount.toString(), JobStats.totalPaid.toString(), JobStats.totalUnpaid.toString(), JobStats.totalESCROW.toString()])
    }
  } 
}
  
  return {
    tabelInfo,
    totalESCROW,
    totalPayed,
    totalUnpaid,
  };
}

//This funciton will return the skill stats for the given date range
async function getSkillStats(StartDate: Date, EndDate: Date) {
 
 //getting the projects in the given timeframe
  const Jobs = await getJobsBydate(StartDate, EndDate);

  type SkillAreaMapEntry = SkillAreaAnalysis & { skillCounts: { [skill: string]: number } };
  const skillAreaMap: { [skillArea: string]: SkillAreaMapEntry } = {};

  for (const doc of Jobs) {
    const job = doc.jobData;
    if (!job || !job.skills) { // Basic check for valid job and skills data
        console.warn('Skipping job due to missing jobData or skills:', doc);
        continue;
    }

    for (const skillArea in job.skills) {
      if (job.skills.hasOwnProperty(skillArea)) {
        // Initialize skill area 
        if (!skillAreaMap[skillArea]) {
          skillAreaMap[skillArea] = {
            skillArea: skillArea,
            totalProjects: 0,
            hiredProjects: 0,
            completedProjects: 0,
            mostInDemandSkills: [],
            skillCounts: {}, 
          };
        }

        // Increment total projects for the skill area
        skillAreaMap[skillArea].totalProjects++;

        // Increment hired projects if the job is hired
        if (job.status === JobStatus.Employed) {
          skillAreaMap[skillArea].hiredProjects++;
        }

        if (job.status === JobStatus.Completed) {
          skillAreaMap[skillArea].completedProjects++;
        }

        // Aggregate skill occurrences for the skill area
        const skillsInput = job.skills[skillArea];
        let skillsToProcess: string[] = [];

        if (typeof skillsInput === 'string') {
          // If it's a single string it is treated as an array with one skill. 
          skillsToProcess = [skillsInput];
        } else if (Array.isArray(skillsInput)) {
          skillsToProcess = skillsInput.filter((s): s is string => typeof s === 'string');
        } else if (skillsInput) { // Check if skillsInput is not null/undefined before logging
            console.warn(`Unexpected skills data type for job's skillArea "${skillArea}". Expected string or array, got: ${typeof skillsInput}`, skillsInput);
        }

        for (const rawSkill of skillsToProcess) {
          const skill = rawSkill.trim(); // Trim unneeded whitespace and newline characters
          if (skill) { 
            skillAreaMap[skillArea].skillCounts[skill] = (skillAreaMap[skillArea].skillCounts[skill] || 0) + 1;
          }
        }
      }
    }
  }

  // calculate mostInDemandSkills for each skillArea 
  for (const skillArea in skillAreaMap) {
    if (skillAreaMap.hasOwnProperty(skillArea)) {
      const skillCounts = skillAreaMap[skillArea].skillCounts;
      const sortedSkills = Object.entries(skillCounts)
        .map(([skill, count]) => ({ skill, count }))
        .sort((a, b) => b.count - a.count);
      skillAreaMap[skillArea].mostInDemandSkills = sortedSkills;
    }
  }

  //Had to disable the lint checker here as it sees skillCounts as unused here in the destructuring
  const result = Object.values(skillAreaMap).map(({ skillCounts, ...rest }) => rest); // This is removing skill counts from skillArea map

  return result;
}

export {getPaymentStats, getCompletionStats, getSkillStats}