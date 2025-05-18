import { db } from "@/app/firebase";
import SkillData from "@/app/interfaces/SkillData.interface";
import { collection, getDocs } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(){
    try{
        const snapShot = await getDocs(collection(db, "skills"));
        const skills = snapShot.docs.map(doc =>{
            const data = doc.data();
            return{
                id: doc.id,
                skills: data.names || []
            } as SkillData;
        });

        return NextResponse.json({ results: skills }, { status: 200 });
    }
    catch(error){
        return NextResponse.json(
            { message: "Error fetching skills",error},
            { status: 500 }
        );
    }
}