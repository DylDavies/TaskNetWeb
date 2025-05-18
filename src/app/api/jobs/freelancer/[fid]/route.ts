import { db } from "@/app/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";
import ActiveJob from "@/app/interfaces/ActiveJob.interface";
import JobData from "@/app/interfaces/JobData.interface";

export async function GET(req: NextRequest, { params }: { params: Promise<{ fid: string }> }) {
  try {
    const Query = query(collection(db, "Jobs"), where("hiredUId", "==", (await params).fid));
    const jobDocs = await getDocs(Query);

    const jobs: ActiveJob[] = [];
    jobDocs.forEach((doc) => {
      jobs.push({
        jobId: doc.id,
        jobData: doc.data() as JobData
      });
    });

    return NextResponse.json({ results: jobs }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error getting jobs by freelancer ID", error }, { status: 500 });
  }
}