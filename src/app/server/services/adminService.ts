'use server';

import { arrayUnion, doc, getDoc, setDoc } from "firebase/firestore"; 
import { db } from "../../firebase";
import { getMilestones } from "./MilestoneService";
import MilestoneStatus from "@/app/enums/MilestoneStatus.enum";
import PaymentStatus from "@/app/enums/PaymentStatus.enum";

//adds a skill to an area
async function AddSkill(SkillArea: string, skillName: string) {
    await setDoc(doc(db, "skills", SkillArea), {
        SkillArea: SkillArea,
        name: arrayUnion(skillName)
      });    
};

//return skills in a skill area
async function getSkillByID(SkillArea: string){
  const skillDoc = await getDoc(doc(db, "skills", SkillArea));

  if (!skillDoc.exists()) return null; 

  return skillDoc.data() as []; 
}

//This funciton will return the completion stats for a given job
async function getCompletionStatsPerJob(JobID:string) {
  const milestones = await getMilestones(JobID);
  const TotalMilestones = milestones.length;
  const CompletedMilestones = milestones.filter(item => item.status === MilestoneStatus.Completed).length;
  
  let PercentageComplete = 0
  if(TotalMilestones > 0){
    PercentageComplete = CompletedMilestones / TotalMilestones  * 100;
  }

  return{
    TotalMilestones,
    CompletedMilestones,
    PercentageComplete
  }
}

//This funciton will return payment stats for the given job id
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




export {AddSkill, getSkillByID, getCompletionStatsPerJob, getPaymentStatsPerJob };