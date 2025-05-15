import { db } from "@/app/firebase";
import { collection, getDocs } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";
import JobData from "@/app/interfaces/JobData.interface";

export async function POST(req: NextRequest) {
  try {
    const { skills, skillIds }: { skills: string[]; skillIds: string[] } = await req.json();
    
    if (!skills || !skillIds) {
      return NextResponse.json({ results: [] }, { status: 200 });
    }

    const jobDocs = await getDocs(collection(db, "Jobs"));
    const matchingJobs: JobData[] = [];

    jobDocs.forEach((doc) => {
      const job = doc.data() as JobData;
      const jobSkillsMap = job.skills || {};
      const relevantSkillArrays = skillIds
        .filter((id) => jobSkillsMap[id])
        .map((id) => jobSkillsMap[id]);
      const relevantSkills = relevantSkillArrays.flat();
      const hasMatch = skills.some(skill => relevantSkills.includes(skill));
      if (hasMatch) matchingJobs.push(job);
    });

    return NextResponse.json({ results: matchingJobs }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error searching jobs by skills", error }, { status: 500 });
  }
}