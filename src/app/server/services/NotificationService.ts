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

//This function creates a notification for a user to see
async function createNotification(notificationData: Omit<Notification, "uid" | "sentTime" | "deleted">): Promise<void> {
    const response = await fetch("/api/notifications/create", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationData)
    });

    if (response.status == 500) console.error(await response.json());
}

//This function deletes the notification, if a user chooses to delete it
async function deleteNotification(uid: string): Promise<void> {
    const response = await fetch("/api/notifications/delete", {
        method: "DELETE",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({uid})
    });

    if (response.status == 500) console.error(await response.json());
}

//This function sets that the notification has been seen if the user has seen it
async function setNotificationSeen(uid: string, seen: boolean): Promise<void> {
    const response = await fetch("/api/notifications/seen", {
        method: "PATCH",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({uid, seen})
    });

    if (response.status == 500) console.error(await response.json());
}

//The user can choose to mark all notifications as seen with a click of a button
async function markAllNotificationsAsSeenForUser(uids: string[]): Promise<void> {
    const response = await fetch("/api/notifications/aseen", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({uids})
    });

    if (response.status == 500) console.error(await response.json());
}

//This function gets all of the notifications for a user
async function getNotificationsForUser(uid: string): Promise<Notification[]> {
    const response = await fetch(`/api/notifications/get/${uid}`, {
        method: "GET",
        headers: { 'Content-Type': 'application/json' }
    });

    if (response.status == 500) console.error(await response.json());

    return (await response.json()).results.map((v: FSNotification) => fromDB(v));
}

export { createNotification, setNotificationSeen, getNotificationsForUser, fromDB, deleteNotification, markAllNotificationsAsSeenForUser, toDB }