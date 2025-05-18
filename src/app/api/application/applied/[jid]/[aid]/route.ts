import { db } from "@/app/firebase";
import { makeApplicationID } from "@/app/server/services/ApplicationService";
import { doc, getDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ jid: string; aid: string }> }) {
    try {
        const ref = await getDoc(doc(db, "applications", makeApplicationID((await params).jid, (await params).aid)));

        return NextResponse.json({result: ref.exists()}, {status: 200})
    } catch (error) {
        return NextResponse.json({message: "Error adding application", error}, {status: 500});
    }
}