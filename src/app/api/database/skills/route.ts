import { db } from "@/app/firebase"; // Assuming your firebase instance is exported from here
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    // Getting UID from search params
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("userID");

    // If no userID, then return an error
    if (!uid) {
      return NextResponse.json({ message: "User ID (userID) is required" }, { status: 400 });
    }

    // Getting skillAreaSkillMap from request body
    let skillAreaSkillMap: { [skillArea: string]: string[] };
    try {
      skillAreaSkillMap = await req.json();
    } catch {
      return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
    }

    if (!skillAreaSkillMap || Object.keys(skillAreaSkillMap).length === 0) {
      return NextResponse.json({ message: "Skill data (skillAreaSkillMap) is required in the request body" }, { status: 400 });
    }

    // Get user document
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.error("Users Doc doesn't exist for UID:", uid);
      return NextResponse.json({ message: "User document does not exist" }, { status: 404 });
    }

    const userData = userDoc.data();
    const currentSkills = userData?.skills || {}; 
    const updatedSkills = { ...currentSkills }; 

    // Merge skills
    Object.entries(skillAreaSkillMap).forEach(([skillArea, skillsToAdd]) => {
      if (!Array.isArray(skillsToAdd)) {
        console.warn(`Skills for area '${skillArea}' is not an array. Skipping.`);
        return;
      }
      if (!updatedSkills[skillArea]) {
        updatedSkills[skillArea] = []; // Create new skill area if it doesn't exist
      }

      // Add new skills to the array for that skill area, avoiding duplicates
      skillsToAdd.forEach((skill) => {
        if (!updatedSkills[skillArea].includes(skill)) {
          updatedSkills[skillArea].push(skill);
        }
      });
    });

    // Update Firestore document
    await updateDoc(userRef, {
      skills: updatedSkills
    });

    // Successful response
    return NextResponse.json({ message: "Skills updated successfully", skills: updatedSkills }, { status: 200 });

  } catch (error) {
    console.error("Error updating user skills:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ message: "Error updating user skills", error: errorMessage }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {

    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("userID");

    if (!uid || typeof uid !== 'string' || uid.trim() === '') {
        console.warn('Invalid UID provided to getUser:', uid);
        return NextResponse.json({result: null}, {status: 200});
    }

    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) return NextResponse.json({result: null}, {status: 200});

    return NextResponse.json({result: userDoc.data()?.skills || {}}, {status: 200});
}