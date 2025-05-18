import { db } from "@/app/firebase";
import { collection, getDocs } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
    try{
        const { skillNames }: { skillNames: string[]} = await req.json();
        const snapshot = await getDocs(collection(db, "skills"));
        const skillMap: { [skillArea: string]: string[] } = {};

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const area = data.skillArea;
            const names: string[] = data.names || [];

            const matchedSkills = names.filter(skill => skillNames.includes(skill));
            if (matchedSkills.length > 0) skillMap[area] = matchedSkills;
        });

        return NextResponse.json({ results: skillMap }, { status: 200 });
    } 
    catch(error){
        return NextResponse.json(
            { message: "Error mapping skills to areas", error },
            { status: 500 }
        );
    }
}