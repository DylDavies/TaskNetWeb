'use server';

import { arrayUnion, doc, getDoc, setDoc } from "firebase/firestore"; 
import { db } from "../../firebase";


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


export {AddSkill, getSkillByID};