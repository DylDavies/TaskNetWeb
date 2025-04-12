'use server';

import { getDoc, doc, collection, where, query, getDocs } from "firebase/firestore";
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

export { getUser, getPendingUsers };


