import { db } from "@/app/firebase";
import { doc, getDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";
import JobData from "@/app/interfaces/JobData.interface";

export async function GET(req: NextRequest, { params }: { params: { jid: string } }) {
  try {
    const jobDoc = await getDoc(doc(db, "Jobs", params.jid));

    if (!jobDoc.exists()) return NextResponse.json({ result: null }, { status: 200 });

    return NextResponse.json({ result: jobDoc.data() as JobData }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error getting job", error }, { status: 500 });
  }
}