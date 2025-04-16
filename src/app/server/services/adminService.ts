'use server';

import { arrayUnion, doc, setDoc } from "firebase/firestore"; 
import { db } from "../../firebase";


async function AddSkill(SkillArea: string, skillName: string) {
    await setDoc(doc(db, "skills", SkillArea), {
        SkillArea: SkillArea,
        name: arrayUnion(skillName)
      });    
};

export {AddSkill};