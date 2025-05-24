import { db } from "@/app/firebase"; // Assuming your firebase instance is exported from here
import { doc, updateDoc, getDoc, DocumentData } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

// Define a basic structure for UserData for better type safety
interface UserData extends DocumentData {
  skills?: { [skillArea: string]: string[] };
  // other user properties...
}

export async function PATCH(req: NextRequest) {
  try {
    // Getting UID and skillName from search params
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("userID");
    const skillName = searchParams.get("skillName");

    // Validate input
    if (!uid) {
      return NextResponse.json({ message: "User ID (userID) is required" }, { status: 400 });
    }
    if (!skillName) {
      return NextResponse.json({ message: "Skill name (skillName) is required" }, { status: 400 });
    }

    // Get user document
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.error("User document doesn't exist for UID:", uid);
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data() as UserData; 
    const currentSkills = userData.skills || {};
    const updatedSkills = JSON.parse(JSON.stringify(currentSkills));

    let skillFoundAndRemoved = false;

    // Find and remove the skill
    for (const skillArea in updatedSkills) {
      if (updatedSkills[skillArea] && updatedSkills[skillArea].includes(skillName)) {
        // Filter out the skill
        updatedSkills[skillArea] = updatedSkills[skillArea].filter((skill: string) => skill !== skillName);
        skillFoundAndRemoved = true;

        // If the skill area becomes empty, remove the skill area itself
        if (updatedSkills[skillArea].length === 0) {
          delete updatedSkills[skillArea];
        }
        break;
      }
    }

    if (!skillFoundAndRemoved) {
      console.warn(`Skill "${skillName}" not found for user UID: ${uid}`);
      return NextResponse.json({ message: `Skill "${skillName}" not found for this user` }, { status: 404 });
    }

    // Update Firestore document
    try {
      await updateDoc(userRef, {
        skills: updatedSkills
      });
    } catch (err) {
      console.error("Error updating user skills after removal:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during Firestore update";
      return NextResponse.json({ message: "Error removing skill from database", error: errorMessage }, { status: 500 });
    }

    // Successful response
    return NextResponse.json({ message: `Skill "${skillName}" removed successfully`, skills: updatedSkills }, { status: 200 });

  } catch (error) {
    console.error("Error processing remove skill request:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred";
    return NextResponse.json({ message: "Error processing request", error: errorMessage }, { status: 500 });
  }
}