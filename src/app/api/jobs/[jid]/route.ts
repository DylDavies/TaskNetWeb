import { db } from "@/app/firebase";
import { getDoc, doc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  jid?: string;
}

export async function GET(req: NextRequest, { params }: { params: Params }) {
  const jobId = params?.jid;

  if (!jobId) {
    return NextResponse.json({ result: null }, { status: 400 });
  }

  try {
    const jobDoc = await getDoc(doc(db, "Jobs", jobId));

    if (!jobDoc.exists()) {
      return NextResponse.json({ result: null }, { status: 200 });
    }

    return NextResponse.json({ result: jobDoc.data() }, { status: 200 });
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      { error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}