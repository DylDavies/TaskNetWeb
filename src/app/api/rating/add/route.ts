import { db } from "@/app/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";



export async function PATCH(req: NextRequest) {
  try {
    //getting info from the parameters
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("userID");
    const rating = Number(searchParams.get("rating"));

    if(!uid){
        return NextResponse.json({ message: "Error adding rating: no user ID" }, { status: 500 });
    }
    const userRef = doc(db, "users", uid);

    //getting currecnt rating and adding the new rating to it
    const userSnap = await getDoc(userRef);
    const currentRatings = userSnap.data()?.ratings || [];
    const updatedRatings = [...currentRatings, rating];
        
    await updateDoc(userRef, {
        ratings: updatedRatings
    });

    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error adding rating", error }, { status: 500 });
  }
}