import { db } from "@/app/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    const { jobID, hiredUId }: { jobID: string; hiredUId: string } = await req.json();
    await updateDoc(doc(db, "Jobs", jobID), { hiredUId });
    
    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error updating hiredUId", error }, { status: 500 });
  }
}