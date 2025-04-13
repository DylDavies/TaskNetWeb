'use server';

import { getDoc, doc, collection, where, query, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import UserData from "../../interfaces/UserData.interface";
import UserStatus from "@/app/enums/UserStatus.enum";
import AuthService from "../../services/AuthService";
import nodemailer from 'nodemailer';

async function getUser(uid: string): Promise<UserData | null> {
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

    console.log(pendingUsers);

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
        console.log(`User type is`, type);

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
        //if there is a user, will update the username
            console.log("User UID: ", uid);
            const userRef = doc(db, "users", uid);
        await updateDoc(userRef, {
          username: username
        });
        console.log("Username is", username);


      } catch (error) {
        console.error("Could not set username", error);
        throw error;
      };
};

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com', //  Zoho SMTP server
  port: 465,             // Use 465 for secure connection
  secure: true,          // True for port 465 (SSL)
  auth: {
    user: 'no-reply@tasknet.tech', // Tasknet mail
    pass: 'no-reply@TaskNet1'//process.env.ZOHO_MAIL_PASS    - maybe do this to be safe
  }
});

const sendEmail = (to: string, subject: string, text: string) => {
  const mailOptions = {
    from: '"TaskNet" <no-reply@tasknet.tech>', // sender name + email
    to: to,
    subject: subject,
    text: text
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, function (error: Error | null, info: { response: string }) {
      if (error) {
        console.error('Email send error:', error);
        reject(error);
      } else {
        console.log('Email sent:', info.response);
        resolve(info.response);
      }
    });
  });
};

export { getUser, getPendingUsers, approveUser, denyUser, setUserType, SetUserName, sendEmail };
