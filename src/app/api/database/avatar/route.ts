import { db } from "@/app/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";



export async function PATCH(req: NextRequest) {
  try {
    //getting vars
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("userID");
    const avatar = searchParams.get("avatar");

    //if no userID, then return an error
    if(!uid){
        return NextResponse.json({ message: "Error setting user avatar" }, { status: 500 });
    }

    //Updating database 
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      avatar
    });


    //Successfull responce
    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error setting user avatar", error }, { status: 500 });
  }
}