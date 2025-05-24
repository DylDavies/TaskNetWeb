import { getDownloadURL, ref, uploadBytesResumable, UploadTaskSnapshot, StorageError } from "firebase/storage";
import { storage } from "../../../firebase"; 
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const path = formData.get("path") as string | null;
    const name = formData.get("name") as string | null;

    if (!file) {
      return NextResponse.json({ message: "File is required." }, { status: 400 });
    }
    if (!path) {
      return NextResponse.json({ message: "Path (storage folder) is required." }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ message: "File name is required." }, { status: 400 });
    }

    const storageRef = ref(storage, `${path}/${name}`);
    const fileBuffer = await file.arrayBuffer();

    const uploadTask = uploadBytesResumable(storageRef, fileBuffer, {
      contentType: file.type,
    });

    const downloadURL = await new Promise<string>((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot: UploadTaskSnapshot) => {
          switch (snapshot.state) {
            case "paused":
            
              break;
            case "running":
              break;
          }
        },
        (error: StorageError) => {
          // Handle unsuccessful uploads
          console.error("Firebase upload error:", error);
          switch (error.code) {
            case 'storage/unauthorized':
              reject(new Error("User doesn't have permission to access the object."));
              break;
            case 'storage/canceled':
              reject(new Error("User canceled the upload."));
              break;
            case 'storage/unknown':
              reject(new Error("Unknown error occurred, inspect error.serverResponse."));
              break;
            default:
              reject(new Error(`Firebase upload failed: ${error.message}`));
          }
        },
        async () => {
          // Handle successful uploads on complete
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          } catch (e) {
            const getUrlError = e instanceof Error ? e.message : String(e);
            console.error("Failed to retrieve download URL:", getUrlError);
            reject(new Error(`Failed to retrieve download URL after upload: ${getUrlError}`));
          }
        }
      );
    });

    return NextResponse.json({ message: "File uploaded successfull", downloadURL }, { status: 200 });

  } catch (error) {
    console.error("Error processing file upload request:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred.";
    return NextResponse.json({ message: "Server error during file upload.", error: errorMessage }, { status: 500 });
  }
}