'use server';

import { getDoc, doc, collection, where, query, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import UserData from "../../interfaces/UserData.interface";
import UserType from "@/app/enums/UserType.enum";
import UserStatus from "@/app/enums/UserStatus.enum";
import AuthService from "../../services/AuthService";
import { Router } from "react-router-dom";
import { useRouter } from "next/router";

async function getUser(uid: string): Promise<UserData | null> {
    const userDoc = await getDoc(doc(db, "users", uid));

    if (!userDoc.exists()) return null;

    return userDoc.data() as UserData;
}

// Fetch pending users Endpoint:
async function getPendingUsers(): Promise<{uid:string; status:number, type:number}[]>{
    const dbRef = collection(db,'users');  //db.collection('users');
    const pending = query(dbRef,where('status', '==', UserStatus.Pending));

    const snapshot = await getDocs(pending);

    const pendingUsers = snapshot.docs.map(doc => ({
        uid: doc.id,
        status: doc.data().status,
        type: doc.data().type
        
    }));

    console.log(pendingUsers);

    return pendingUsers;
}

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
      }
}

// Approve user Endpoint
async function approveUser(uid:string):Promise<void>{
    const dbRef = doc(db,'users', uid);

    await updateDoc(dbRef,{
        status:1, // 1 : Approve (temp)
    });
}

// Deny user Endpoint
async function denyUser(uid:string):Promise<void>{
    const dbRef = doc(db,'users', uid);

    await updateDoc(dbRef,{
        status:2, // 2 : Deny (temp)
    });
}

//  This function will take in a username as a string and set update it to the current user in the database
async function SetUserName(username: string){
    try {
        //getting the current user
        const activeUser = await AuthService.getCurrentUser();

        //if there is a user, will update the username
        if (activeUser) {
            const uid = activeUser.authUser.uid;
            console.log("User UID: ", uid);
            const userRef = doc(db, "users", uid);
        await updateDoc(userRef, {
          username: username
        });
        console.log("Username is", username);

          } else {
            console.log("No user is currently logged in.");
          }

      } catch (error) {
        console.error("Could not set username", error);
        throw error;
      }
}

async function LoginRedirect() {
    const activeUser = await AuthService.getCurrentUser();

    if(activeUser){
        const userType = activeUser.userData.type;
        if(userType == UserType.None){
            //ToDo
            //redirect to the secondary login page
        }
        else{
            Login(userType);
        }
    }
    else{
        console.log("No active user");
    }
    
}

async function Login(type: UserType){
    const router = useRouter()
        switch (type) {
            case 0:
              console.log("none");
              LoginRedirect();
              break;
            case 1:
              console.log("Freelancer");
              router.push('/freelancer');
              break;
            case 2:
              console.log("");
              break;
            case 3:
              console.log("You picked three!");
              break;
            default:
              console.log("Number is out of range (0-3).");
              break;
          }

}


export { getUser, getPendingUsers, approveUser, denyUser, setUserType, SetUserName };

