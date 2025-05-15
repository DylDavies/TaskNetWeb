import { db } from "@/app/firebase";
import { getDoc, doc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{jid: string}> }) {
    const jobDoc = await getDoc(doc(db, "Jobs", (await params).jid));

    if (!jobDoc.exists()) return NextResponse.json({result: null}, {status: 200});

    return NextResponse.json({result: jobDoc.data()}, {status: 200});
}