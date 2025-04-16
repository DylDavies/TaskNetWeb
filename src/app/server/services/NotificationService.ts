import { addDoc, collection, doc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "../../firebase";
import Notification from "@/app/interfaces/Notification.interface";
import FSNotification from "@/app/interfaces/FSNotification.interface";

function fromDB(notif: FSNotification): Notification {
    return {
        message: notif.message,
        seen: notif.seen,
        sentTime: new Date(notif.sentTime),
        uid: notif.uid,
        uidFor: notif.uidFor,
        action: notif.action
    }
}

function toDB(notif: Notification): FSNotification {
    return {
        message: notif.message,
        seen: notif.seen,
        sentTime: notif.sentTime.getTime(),
        uid: notif.uid,
        uidFor: notif.uidFor,
        action: notif.action
    }
}

async function createNotification(notificationData: Omit<Notification, "uid" | "sentTime">) {
    const docRef = await addDoc(collection(db, "notifications"), notificationData);

    const data: Notification = { uid: docRef.id, sentTime: new Date(), ...notificationData };

    await setDoc(docRef, toDB(data));
}

async function setNotificationSeen(uid: string, seen: boolean) {
    await updateDoc(doc(db, "notifications", uid), {
        seen
    });
}

async function getNotificationsForUser(uid: string): Promise<Notification[]> {
    const snapshot = await getDocs(query(collection(db, "notifications"), where("uidFor", "==", uid)));

    let results: Notification[] = [];

    snapshot.forEach(s => results.push(fromDB(s.data() as FSNotification)));

    return results;
}

export { createNotification, setNotificationSeen, getNotificationsForUser, fromDB }