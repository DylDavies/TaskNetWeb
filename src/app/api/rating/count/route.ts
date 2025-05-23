import { db } from "@/app/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";



export async function PATCH(req: NextRequest) {
  try {
    //Getting variables
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("userID");
    const count = searchParams.get("count");;

    if(!uid){
        return NextResponse.json({ message: "Error updating Count" }, { status: 500 });
    }

    //Updating the database
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
        ratingCount: count
    });

    //successfull responce 
    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error updating Count", error }, { status: 500 });
  }
}