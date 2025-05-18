import { db } from "@/app/firebase";
import { getDoc, doc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{aid: string}> }) {
    const userDoc = await getDoc(doc(db, "applications", (await params).aid));

    if (!userDoc.exists()) return NextResponse.json({result: null}, {status: 200});

    return NextResponse.json({result: userDoc.data()}, {status: 200});
}