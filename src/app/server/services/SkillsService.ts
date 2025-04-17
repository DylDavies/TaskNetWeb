'use server';

import { arrayUnion, doc, setDoc } from "firebase/firestore"; 
import { collection, getDocs } from 'firebase/firestore';
import { db } from "../../firebase";
import SkillData from "@/app/interfaces/SkillData.interface";


async function AddSkill(SkillArea: string, skillName: string) {
    await setDoc(doc(db, "skills", SkillArea), {
        SkillArea: SkillArea,
        name: arrayUnion(skillName)
      });    
};

//This function will return an array of maps each containing the skill area id and an array of skills that fall into that category
async function getSkillArray(): Promise<SkillData[]>{
  const snapShot = await getDocs(collection(db,"skills"));
  return snapShot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      skills: data.names || []  // assuming 'skills' exists in document
    };
  });
}

// Helper to get all skills 
async function getAllSkills(): Promise<string[]> {
  const skillArray = await getSkillArray();
  const skills = skillArray.flatMap((area) => area.skills)
  const uniqueSkills = Array.from(new Set(skills));
  return uniqueSkills;
}

// Endpoint to get all Ids
async function getAllSkillIDs(): Promise<string[]> {
  try {
    const skillDoc = await getDocs(collection(db, "skills"));
    const skillIDs: string[] = [];
    
    skillDoc.forEach((doc) => {
      skillIDs.push(doc.id); // Only store the document ID
    });
    
    return skillIDs;
  } catch (error) {
    console.error("Error fetching job IDs:", error);
    throw error;
  }
}



export {AddSkill, getSkillArray, getAllSkillIDs, getAllSkills};