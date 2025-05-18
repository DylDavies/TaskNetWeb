import { db } from "@/app/firebase";
import { collection, getDocs } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(){
    try{
        const snapshot = await getDocs(collection(db, "skill"));
        const skillIDs = snapshot.docs.map(doc => doc.id);

        return NextResponse.json({ results: skillIDs }, { status: 200 });
    }
    catch(error){
        return NextResponse.json(
            { message: "Error fetching skill ID's", error},
            { status: 500 }
        );
    }
}