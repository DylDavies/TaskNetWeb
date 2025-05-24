import { db } from "@/app/firebase";
import { getDoc, doc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {

    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("userID");

    if (!uid || typeof uid !== 'string' || uid.trim() === '') {
    console.warn('Invalid UID provided to getUser:', uid);
    return NextResponse.json({result: null}, {status: 200});
  }
    const userDoc = await getDoc(doc(db, "users", uid));

    if (!userDoc.exists()) return NextResponse.json({result: null}, {status: 200});

    return NextResponse.json({result: userDoc.data()}, {status: 200});
}