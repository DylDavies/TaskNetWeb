// ./src/app/api/jobs/contracted/route.ts
import { db } from "@/app/firebase";
import { collection, query, where, getDocs, and, or } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";
import ActiveJob from "@/app/interfaces/ActiveJob.interface";
import JobStatus from "@/app/enums/JobStatus.enum";
import JobData from "@/app/interfaces/JobData.interface";
import UserType from "@/app/enums/UserType.enum";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userID = searchParams.get("userId");
    const userType = Number(searchParams.get("userType")) as UserType;

    if (!userID) return NextResponse.json({ results: [] }, { status: 200 });

    let Query;
    if (userType === UserType.Client) {
      Query = query(
        collection(db, "Jobs"),
        and(
          where("clientUId", "==", userID),
          or(
            where("status", "==", JobStatus.Employed),
            where("status", "==", JobStatus.Completed)
          )
        )
      );
    } else if (userType === UserType.Freelancer) {
      Query = query(
        collection(db, "Jobs"),
        and(
          where("hiredUId", "==", userID),
          or(
            where("status", "==", JobStatus.Employed),
            where("status", "==", JobStatus.Completed)
          )
        )
      );
    } else if (userType === UserType.Admin) {
      // Logic for Admin user type - adjust as needed
      Query = query(
        collection(db, "Jobs"),
        or(
          and(
            where("clientUId", "==", userID),
            or(
              where("status", "==", JobStatus.Employed),
              where("status", "==", JobStatus.Completed)
            )
          ),
          and(
            where("hiredUId", "==", userID),
            or(
              where("status", "==", JobStatus.Employed),
              where("status", "==", JobStatus.Completed)
            )
          )
        )
      );
    }

    const jobs: ActiveJob[] = [];
    if (Query) {
      const jobDocs = await getDocs(Query);
      jobDocs.forEach((doc) => {
        jobs.push({
          jobId: doc.id,
          jobData: doc.data() as JobData
        });
      });
    }

    return NextResponse.json({ results: jobs }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error getting contracted jobs", error }, { status: 500 });
  }
}
