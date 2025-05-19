import { db } from "@/app/firebase";
import JobData from "@/app/interfaces/JobData.interface";
import { addDoc, collection } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
    try{
        const jobData: JobData = await req.json();
        const docRef = await addDoc(collection(db, "Jobs"), jobData);

        return NextResponse.json({ id: docRef.id }, { status:200 });
    }
    catch(error){
        return NextResponse.json({ message: "Error creating job",error }, { status: 500 });
    }
}