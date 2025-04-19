'use server';

import { arrayUnion, doc, setDoc } from "firebase/firestore"; 
import { collection, getDocs } from 'firebase/firestore';
import { db } from "../../firebase";


async function AddSkill(SkillArea: string, skillName: string) {
    await setDoc(doc(db, "skills", SkillArea), {
        SkillArea: SkillArea,
        name: arrayUnion(skillName)
      });    
};

//This function will return an array of maps each containing the skill area id and an array of skills that fall into that category
async function getSkillArray(){
    const snapshot = await getDocs(collection(db, 'skills'));
    const skillAreas = snapshot.docs.map(doc => ({
        id: doc.id,
        names: doc.data()
      }));
      return skillAreas;
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
    return [];
  }
}



export {AddSkill, getSkillArray, getAllSkillIDs};