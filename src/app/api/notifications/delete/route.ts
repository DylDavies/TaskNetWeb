import { db } from "@/app/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
    try {
        const { uid }: { uid: string } = await req.json();

        await updateDoc(doc(db, "notifications", uid), {
            deleted: true
        });

        return NextResponse.json({}, {status: 200});
    } catch (error) {
        return NextResponse.json({message: "Error deleting notification", error}, { status: 500 })
    }
}