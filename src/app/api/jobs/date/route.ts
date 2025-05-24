import { db } from "@/app/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";
import ActiveJob from "@/app/interfaces/ActiveJob.interface";
import JobData from "@/app/interfaces/JobData.interface";


export async function GET(req: NextRequest) {
  try {

    //Getting vars
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");;

    //converting vars to correct datatype 
    const startDateNum = Number(startDate);
    const endDateNum = Number(endDate);

    const dbRef = collection(db,'Jobs');
    const InTimeFrame = query(dbRef,where('createdAt', '>=',startDateNum), where('createdAt', '<=',endDateNum));
    const snapshot = await getDocs(InTimeFrame);

    //getting jobs from database
    const jobs: ActiveJob[] = [];
    snapshot.forEach((doc) => {
        jobs.push({
        jobId: doc.id,
        jobData: doc.data() as JobData
        });
    });

    //successpull responce with jobs
    return NextResponse.json({ results: jobs }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error getting contracted jobs", error }, { status: 500 });
  }
}