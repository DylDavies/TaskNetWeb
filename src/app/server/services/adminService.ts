'use server';

import { arrayUnion, collection, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore"; 
import { db } from "../../firebase";
import formatDateAsNumber from "../formatters/FormatDates";
import { getMilestones } from "./MilestoneService";
import MilestoneStatus from "@/app/enums/MilestoneStatus.enum";
import JobStatus from "@/app/enums/JobStatus.enum";
import PaymentStatus from "@/app/enums/PaymentStatus.enum";
import { getJob } from "./JobDatabaseService";
import { getUsername } from "./DatabaseService";

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

async function getPaymentStatsPerJob(JobID: string){
  const milestones = await getMilestones(JobID);
  let totalPaid = 0;
  let totalUnpaid = 0;
  let totalESCROW = 0;

  milestones.forEach((item)=> {
    if(item.paymentStatus){
      if (item.paymentStatus == PaymentStatus.Paid){
        totalPaid += item.payment;
      }
      else if(item.paymentStatus === PaymentStatus.Escrow){
        totalESCROW += item.payment;
      }  
      else {
        totalESCROW += item.payment;;
      }  
    }
    else{
      totalUnpaid += item.payment;
    }
    
  })

  return{

   totalESCROW,
   totalPaid,
   totalUnpaid
  }
}


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

async function getSkillStatsPerJob(JobID: string){
  const milestones = await getMilestones(JobID);
  let totalPaid = 0;
  let totalUnpaid = 0;
  let totalESCROW = 0;

  //const jobData = await getJob(JobID);
  //const skills = jobData?.skills;
  

  milestones.forEach((item)=> {
    if(item.paymentStatus){
      if (item.paymentStatus == PaymentStatus.Paid){
        totalPaid += item.payment;
      }
      else if(item.paymentStatus === PaymentStatus.Escrow){
        totalESCROW += item.payment;
      }  
      else {
        totalESCROW += item.payment;;
      }  
    }
    else{
      totalUnpaid += item.payment;
    }
    
  })

  return{

   totalESCROW,
   totalPaid,
   totalUnpaid
  }
}


export {AddSkill, getSkillByID, getCompletionStatsPerJob, getCompletionStats, getPaymentStats,getSkillStatsPerJob };