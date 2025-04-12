'use server';

import { getDoc, doc, collection, where, query, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import UserData from "../../interfaces/UserData.interface";

async function getUser(uid: string): Promise<UserData | null> {
    const userDoc = await getDoc(doc(db, "users", uid));

    if (!userDoc.exists()) return null;

    return userDoc.data() as UserData;
}

// Fetch pending users Endpoint:
async function getPendingUsers(): Promise<{uid:string; status:number, type:number}[]>{
    const dbRef = collection(db,'users');  //db.collection('users');
    const pending = query(dbRef,where('status', '==', 0));

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
async function setUserType(uid: String, type: number){
    try {
        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, {
          type: type
        });
        console.log(`User ${uid}'s type set to ${type}`);

      } catch (error) {
        console.error("Could not set error type", error);
        throw error;
      }
}

export { getUser, getPendingUsers, setUserType };