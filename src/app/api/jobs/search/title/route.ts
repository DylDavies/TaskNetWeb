import { db } from "@/app/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";
import JobData from "@/app/interfaces/JobData.interface";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title");
    
    if (!title) return NextResponse.json({ results: [] }, { status: 200 });

    const Query = query(collection(db, "Jobs"), where("title", "==", title));
    const jobDocs = await getDocs(Query);

    const jobs: JobData[] = [];
    jobDocs.forEach((doc) => jobs.push(doc.data() as JobData));

    return NextResponse.json({ results: jobs }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error searching jobs by title", error }, { status: 500 });
  }
}