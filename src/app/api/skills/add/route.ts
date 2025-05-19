import { db } from "@/app/firebase";
import { arrayUnion, doc, setDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
    try{
        const { SkillArea, skillName }: { SkillArea: string; skillName: string } = await req.json();
        
        await setDoc(doc(db, "skills", SkillArea), {
            SkillArea: SkillArea,
            names: arrayUnion(skillName)
        }, { merge: true });   

        return NextResponse.json({ success: true }, { status: 200 });
    }
    catch(error){
        return NextResponse.json(
            { message: "Error adding skill", error },
            { status: 500 }
        );
    }
}