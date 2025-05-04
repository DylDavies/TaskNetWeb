'use server';

import { arrayUnion, collection, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore"; 
import { db } from "../../firebase";
import formatDateAsNumber from "../formatters/FormatDates";
import { getMilestones } from "./MilestoneService";
import MilestoneStatus from "@/app/enums/MilestoneStatus.enum";
import JobStatus from "@/app/enums/JobStatus.enum";

async function AddSkill(SkillArea: string, skillName: string) {
    await setDoc(doc(db, "skills", SkillArea), {
        SkillArea: SkillArea,
        name: arrayUnion(skillName)
      });    
};

async function getSkillByID(SkillArea: string){
  const skillDoc = await getDoc(doc(db, "skills", SkillArea));

  if (!skillDoc.exists()) return null; 

  return skillDoc.data() as []; // Is there an interface to return this as??
}


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

    const JobStats = await getCompletionStatsPerJob(doc.id)
   
    totalMilestones = totalMilestones + JobStats.TotalMilestones;
    CompletedMilestones = CompletedMilestones + JobStats.CompletedMilestones;
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

async function getCompletionStatsPerJob(JobID:string) {
  const milestones = await getMilestones(JobID);
  const TotalMilestones = milestones.length;
  const CompletedMilestones = milestones.filter(item => item.status === MilestoneStatus.Completed).length;
  const PercentageComplete = CompletedMilestones / TotalMilestones  * 100; 

  return{
    TotalMilestones,
    CompletedMilestones,
    PercentageComplete
  }
}

export {AddSkill, getSkillByID, getCompletionStatsPerJob, getCompletionStats};