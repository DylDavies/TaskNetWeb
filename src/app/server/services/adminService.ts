'use server';

import { arrayUnion, doc, setDoc } from "firebase/firestore"; 
import { db } from "../../firebase";

const skillDocID = "lStQgPqgByM0ytnHNrpm"
async function AddSkill(skillName: string) {
    await setDoc(doc(db, "skills", skillDocID), {
        name: arrayUnion(skillName)
      });    
};

export {AddSkill};