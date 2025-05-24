import { db } from "@/app/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";



export async function PATCH(req: NextRequest) {
  try {
    //getting vars
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("userID");
    const status = Number(searchParams.get("status"));

    //if no userID, then return an error
    if(!uid){
        return NextResponse.json({ message: "Error setting user status" }, { status: 500 });
    }

    //Updating database 
    const dbRef = doc(db,'users', uid);

    await updateDoc(dbRef,{
        status: status, // 1 : Approve (temp)
    });


    //Successfull responce
    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error setting user status", error }, { status: 500 });
  }
}