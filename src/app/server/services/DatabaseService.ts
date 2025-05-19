'use server';

import { getDoc, doc, collection, where, query, getDocs, updateDoc } from "firebase/firestore";
import { db, storage } from "../../firebase";
import UserData from "../../interfaces/UserData.interface";
import UserStatus from "@/app/enums/UserStatus.enum";
import nodemailer from 'nodemailer';
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

//This function will return the user data for a given user id
async function getUser(uid: string): Promise<UserData | null> {
   if (!uid || typeof uid !== 'string' || uid.trim() === '') {
    console.warn('Invalid UID provided to getUser:', uid);
    return null;
  }
    const userDoc = await getDoc(doc(db, "users", uid));

    if (!userDoc.exists()) return null;

    return userDoc.data() as UserData;
};

// Fetch pending users Endpoint:
async function getPendingUsers(): Promise<{uid:string; status:number, type:number, username:string, date:number}[]>{
    const dbRef = collection(db,'users');  //db.collection('users');
    const pending = query(dbRef,where('status', '==', UserStatus.Pending));

    const snapshot = await getDocs(pending);

    const pendingUsers = snapshot.docs.map(doc => ({
        uid: doc.id,
        status: doc.data().status,
        type: doc.data().type,
        username: doc.data().username,
        date: doc.data().date
        
    }));

    return pendingUsers;
};

//Set the current users type to the given parameters:
// 0 = undefined 
// 1 = Client
// 2 = Freelancer
// 3 = Admin
async function setUserType(uid: string, type: number){
    try {
        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, {
          type: type
        });

      } catch (error) {
        console.error("Could not set user type", error);
        throw error;
      };
};

// Approve user Endpoint - Sets user status in database to 1 (permission granted)
async function approveUser(uid:string):Promise<void>{
    const dbRef = doc(db,'users', uid);

    await updateDoc(dbRef,{
        status:1, // 1 : Approve (temp)
    });
};

// Deny user Endpoint - Sets user status in database to 2 (permission denied)
async function denyUser(uid:string):Promise<void>{
    const dbRef = doc(db,'users', uid);

    await updateDoc(dbRef,{
        status:2, // 2 : Deny (temp)
    });
};

//  This function will take in a username as a string and set update it to the current user in the database
async function SetUserName(uid: string, username: string){
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      username: username
    });
  } catch (error) {
    console.error("Could not set username", error);
  };
};

//This funciton will set hte avatar as the google profile picture
async function setAvatar(uid: string, avatar: string | null) {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      avatar
    });
  } catch (error) {
    console.error("Could not set username", error);
  };
}

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com', //  Zoho SMTP server
  port: 465,             // Use 465 for secure connection
  secure: true,          // True for port 465 (SSL)
  auth: {
    user: 'no-reply@tasknet.tech', // Tasknet mail
    pass: 'no-reply@TaskNet1'//process.env.ZOHO_MAIL_PASS    - maybe do this to be safe
  }
});

//This function creats and sends an email to a user
const sendEmail = (to: string, subject: string, text: string) => {
  const mailOptions = {
    from: '"TaskNet" <no-reply@tasknet.tech>', // sender name + email
    to: to,
    subject: subject,
    text: text
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error: Error | null, info: { response: string }) => {
      if (error) {
        console.error('Email send error:', error);
        reject(error);
      } else {
        resolve(info.response);
      }
    });
  });
};

//this fucntion will take in a file, the path in which the file must be stored and file name, it will then store the file in the database in the given path and return the url at which the file can be accessed
const uploadFile = (file: File, path: string, name: string): Promise<string> => {
  //promises to return a string this will be the url at which the file can be accessed
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, `${path}/${name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on(
      "state_changed",
      () => {},
      (error) => {
        console.error("Upload failed", error);
        reject(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref)
          .then((downloadURL) => {
            resolve(downloadURL);
          })
          .catch((error) => {
            console.error("Failed to retrieve download URL:", error);
            reject("Failed to retrieve download url");
          });
      }
    );
  });
}

//this function will take in a users uid and return their username
async function getUsername(uid: string): Promise<string>{
    const user = await getUser(uid)
    if (user !== null){
      return user.username;
    }
    return "No username";
} 


// Add Skills for a freelancer
async function addSkillsToFreelancer(uid: string, skillAreaSkillMap: { [skillArea: string]: string[] }): Promise<void> {
  const userRef = doc(db, "users", uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    console.error("Users Doc doesnt exist");
    return;
  }

  const userData = userDoc.data();
  const currentSkills = userData?.skills || {}; 
  const updatedSkills = { ...currentSkills }; // make copy
  
  Object.entries(skillAreaSkillMap).forEach(([skillArea, skills]) => {
    if (!updatedSkills[skillArea]) {
      updatedSkills[skillArea] = []; // Create new skill area if it doesn't exist
    }

    // Add skills to array for that skill area
    skills.forEach((skill) => {
      if (!updatedSkills[skillArea].includes(skill)) {
        updatedSkills[skillArea].push(skill); 
      }
    });
  });

  // Update
  try {
    await updateDoc(userRef, {
      skills: updatedSkills
    });

  } catch (err) {
    console.error("Error updating user skills:", err);
    throw new Error("Error updating skills");
  }
}

// Get skills from freelancer
async function getSkillsForFreelancer(uid: string): Promise<{ [skillArea: string]: string[] }> {
  const userRef = doc(db, "users", uid);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {    
    return userDoc.data()?.skills || {};
  } else {
    return {};
  }
}

// Remove Skill for a freelancer
async function removeSkillFromFreelancer(uid: string, skillName: string): Promise<void> {
  const userRef = doc(db, "users", uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    console.error("Users doc doesnt exist");
    return;
  }

  const userData = userDoc.data() as UserData;
  const currentSkills = userData.skills || {}; 
  const updatedSkills = { ...currentSkills }; // Make copy

  let skillFound = false;

  // find skill in that skill area
  Object.entries(currentSkills).forEach(([skillArea, skills]) => {
    if (skills.includes(skillName)) {
      const filteredSkills = skills.filter((skill) => skill !== skillName);

      if (filteredSkills.length === 0) {
        delete updatedSkills[skillArea];
      } else {
        updatedSkills[skillArea] = filteredSkills;
      }

      skillFound = true;
    }
  });

  if (!skillFound) {
    console.warn(`Skill "${skillName}" not found for user`);
    return;
  }


  try {
    await updateDoc(userRef, {
      skills: updatedSkills
    });

  } catch (err) {
    console.error("Error removing user skill:", err);
    throw new Error("Error removing skill");
  }
}

export { getUser, getPendingUsers, approveUser, denyUser, setUserType, SetUserName, sendEmail, getUsername, uploadFile, setAvatar, addSkillsToFreelancer, getSkillsForFreelancer, removeSkillFromFreelancer };

