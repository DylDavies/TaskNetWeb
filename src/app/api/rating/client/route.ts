import { db } from "@/app/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {

    //Getting variables
    const { searchParams } = new URL(req.url);
    const jid = searchParams.get("JobID");

    if(!jid){
        return NextResponse.json({ message: "Error updating client rated, no job ID" }, { status: 500 });
    }

    //Updating the database
    const userRef = doc(db, "Jobs", jid)
    await updateDoc(userRef, {
      hasClientRated: true
    });

    //responce
    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error client rated", error }, { status: 500 });
  }
}
