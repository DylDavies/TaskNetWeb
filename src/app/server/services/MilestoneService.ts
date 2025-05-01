'use server'

import { doc, setDoc, getDocs,addDoc,collection,updateDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
//import MilestoneStatus from '@/app/enums/MilestoneStatus.enum';
import MilestoneData from '@/app/interfaces/Milestones.interface';


  // Get all milestones for a specific job
async function getMilestones(jobID: string): Promise<MilestoneData[]> {
    try {
      const milestoneCollectionRef = collection(db, "Jobs", jobID, "milestones");
      const milestoneSnapshot = await getDocs(milestoneCollectionRef);
  
      const milestones: MilestoneData[] = [];
      milestoneSnapshot.forEach((doc) => {
        milestones.push(doc.data() as MilestoneData);
      });
  
      return milestones;
    } catch (error) {
      console.error("Error fetching milestones:", error);
      throw error;
    }
  }
  
  // Add a new milestone to a specific job
  async function addMilestone(jobID: string, milestoneData: MilestoneData): Promise<string> {
    try {
      const milestoneCollectionRef = collection(db, "Jobs", jobID, "milestones");
      const milestoneDocRef = await addDoc(milestoneCollectionRef, milestoneData);
  
      return milestoneDocRef.id;
    } catch (error) {
      console.error("Error adding milestone:", error);
      throw error;
    }
  }
  
  // Update a specific milestone's completion (status)
  async function updateMilestoneStatus(jobID: string, milestoneID: string, status: number) {
    try {
      const milestoneDocRef = doc(db, "Jobs", jobID, "milestones", milestoneID);
      await updateDoc(milestoneDocRef, {
        status: status,
      });
  
    } catch (error) {
      console.error("Error updating milestone status:", error);
      throw error;
    }
  }
  
  // Set (overwrite) a milestone if needed (optional, not always needed)
  async function setMilestone(jobID: string, milestoneID: string, milestoneData: MilestoneData) {
    try {
      const milestoneDocRef = doc(db, "Jobs", jobID, "milestones", milestoneID);
      await setDoc(milestoneDocRef, milestoneData);
  
    } catch (error) {
      console.error("Error setting milestone:", error);
      throw error;
    }
  }

  
  export { getMilestones, addMilestone, updateMilestoneStatus, setMilestone };

