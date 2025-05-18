'use server';

import { collection, getDocs, query,  where } from "firebase/firestore"; 
import { db } from "../../firebase";
import formatDateAsNumber from "../formatters/FormatDates";
import JobStatus from "@/app/enums/JobStatus.enum";
import { getJob } from "./JobDatabaseService";
import { getUsername } from "./DatabaseService";
import { getCompletionStatsPerJob, getPaymentStatsPerJob } from "./adminService";
import SkillAreaAnalysis from "@/app/interfaces/SkillAreaAnalysis.interface";

//This function will return the completion stats for the given date range
async function getCompletionStats(StartDate: Date, EndDate: Date) {
  // Calculate date range
  const startDateNum = formatDateAsNumber(StartDate);
  const endDateNum = formatDateAsNumber(EndDate);

  // Query projects
  const dbRef = collection(db,'Jobs');
  const InTimeFrame = query(dbRef,where('createdAt', '>=',startDateNum), where('createdAt', '<=',endDateNum));
  const snapshot = await getDocs(InTimeFrame);

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

    //Completion stats for each job
    const JobStats = await getCompletionStatsPerJob(doc.id)
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
  // Calculate date range
  const startDateNum = formatDateAsNumber(StartDate);
  const endDateNum = formatDateAsNumber(EndDate);

  // Query projects
  const dbRef = collection(db,'Jobs');
  const InTimeFrame = query(dbRef,where('createdAt', '>=',startDateNum), where('createdAt', '<=',endDateNum));
  const snapshot = await getDocs(InTimeFrame);

  let totalPayed = 0;
  let totalESCROW = 0;
  let totalUnpaid = 0;
  const tabelInfo: string[][]= [];
  
  //Getting paymetn stats for each job in the db
  for(const doc of snapshot.docs){
    if (doc.data().status === JobStatus.Employed || doc.data().status === JobStatus.Completed ){

    const JobStats = await getPaymentStatsPerJob(doc.id);
      
    totalPayed += JobStats.totalPaid;
    totalESCROW += JobStats.totalESCROW;
    totalUnpaid += JobStats.totalUnpaid;
    

    const JobData = await getJob(doc.id) ;
    const totalAmount = JobStats.totalESCROW + JobStats.totalPaid + JobStats.totalUnpaid;
    if(JobData){
      const ClientName = await getUsername(JobData.clientUId);
      const FreelanceName = await getUsername(JobData.hiredUId);
      tabelInfo.push([doc.id, JobData.title, ClientName, FreelanceName, JobData.clientUId, totalAmount.toString(), JobStats.totalPaid.toString(), JobStats.totalUnpaid.toString(), JobStats.totalESCROW.toString()])
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
  // Calculate date range
  const startDateNum = formatDateAsNumber(StartDate);
  const endDateNum = formatDateAsNumber(EndDate);

  // Query projects
  const dbRef = collection(db,'Jobs');
  const InTimeFrame = query(dbRef,where('createdAt', '>=',startDateNum), where('createdAt', '<=',endDateNum));
  const snapshot = await getDocs(InTimeFrame);

  const skillAreaMap: { [skillArea: string]: SkillAreaAnalysis } = {};
  
  for(const doc of snapshot.docs){
    const job = doc.data();
    for (const skillArea in job.skills) {
            if (job.skills.hasOwnProperty(skillArea)) {
                // Initialize skill area data if it doesn't exist
                if (!skillAreaMap[skillArea]) {
                    skillAreaMap[skillArea] = {
                        skillArea: skillArea,
                        totalProjects: 0,
                        hiredProjects: 0,
                        completedProjects: 0,
                        mostInDemandSkills: [],
                    };
                }

                // Increment total projects for the skill area
                skillAreaMap[skillArea].totalProjects++;

                // Increment hired projects if the job is hired
                if (job.status === JobStatus.Employed ) {
                    skillAreaMap[skillArea].hiredProjects++;
                }

                if (job.status === JobStatus.Completed ) {
                    skillAreaMap[skillArea].completedProjects++;
                }

                // Count skill occurrences for most in demand
                const skills = job.skills[skillArea];
                const skillCounts: { [skill: string]: number } = {};
                for (const skill of skills) {
                    skillCounts[skill] = (skillCounts[skill] || 0) + 1;
                }

                // Convert skill counts to sorted array for most in demand
                const sortedSkills = Object.entries(skillCounts)
                    .map(([skill, count]) => ({ skill, count }))
                    .sort((a, b) => b.count - a.count);  
                skillAreaMap[skillArea].mostInDemandSkills = sortedSkills;
            }
        }
}
  
  return Object.values(skillAreaMap);
}

export {getPaymentStats, getCompletionStats, getSkillStats}