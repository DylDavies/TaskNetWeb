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
      console.log(skillAreas);
      console.log(skillAreas.at(0));
      return skillAreas;
}



export {AddSkill, getSkillArray};