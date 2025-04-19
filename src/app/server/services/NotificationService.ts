import { addDoc, and, collection, doc, getDocs, query, setDoc, updateDoc, where, writeBatch } from "firebase/firestore";
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
        action: notif.action,
        deleted: notif.deleted
    }
}

function toDB(notif: Notification): FSNotification {
    if (!notif.action) {
        return {
            message: notif.message,
            seen: notif.seen,
            sentTime: notif.sentTime.getTime(),
            uid: notif.uid,
            uidFor: notif.uidFor,
            deleted: notif.deleted
        }
    }

    return {
        message: notif.message,
        seen: notif.seen,
        sentTime: notif.sentTime.getTime(),
        uid: notif.uid,
        uidFor: notif.uidFor,
        deleted: notif.deleted,
        action: notif.action
    }
}

async function createNotification(notificationData: Omit<Notification, "uid" | "sentTime" | "deleted">) {
    const docRef = await addDoc(collection(db, "notifications"), notificationData);

    const data: Notification = { uid: docRef.id, sentTime: new Date(), deleted: false, ...notificationData };

    await setDoc(docRef, toDB(data));
}

async function deleteNotification(uid: string) {
    await updateDoc(doc(db, "notifications", uid), {
        deleted: true
    });
}

async function setNotificationSeen(uid: string, seen: boolean) {
    await updateDoc(doc(db, "notifications", uid), {
        seen
    });
}

async function markAllNotificationsAsSeenForUser(uids: string[]) {
    const batch = writeBatch(db);

    for (const uid of uids) {
        const dc = doc(db, "notifications", uid);

        batch.update(dc, {
            seen: true
        });
    }

    try {
        await batch.commit();
    } catch (error) {
        console.error(error);
    }
}

async function getNotificationsForUser(userUId: string): Promise<Notification[]> {
    const snapshot = await getDocs(query(collection(db, "notifications"), and(where("uidFor", "==", userUId), where("deleted", "==", false))));

    const results: Notification[] = [];

    snapshot.forEach(s => results.push(fromDB(s.data() as FSNotification)));

    return results;
}

export { createNotification, setNotificationSeen, getNotificationsForUser, fromDB, deleteNotification, markAllNotificationsAsSeenForUser, toDB }