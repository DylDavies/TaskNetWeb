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

async function createNotification(notificationData: Omit<Notification, "uid" | "sentTime" | "deleted">): Promise<void> {
    const response = await fetch("/api/notifications/create", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationData)
    });

    if (response.status == 500) console.error(await response.json());
}

async function deleteNotification(uid: string): Promise<void> {
    const response = await fetch("/api/notifications/delete", {
        method: "DELETE",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({uid})
    });

    if (response.status == 500) console.error(await response.json());
}

async function setNotificationSeen(uid: string, seen: boolean): Promise<void> {
    const response = await fetch("/api/notifications/seen", {
        method: "PATCH",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({uid, seen})
    });

    if (response.status == 500) console.error(await response.json());
}

async function markAllNotificationsAsSeenForUser(uids: string[]): Promise<void> {
    const response = await fetch("/api/notifications/aseen", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({uids})
    });

    if (response.status == 500) console.error(await response.json());
}

async function getNotificationsForUser(uid: string): Promise<Notification[]> {
    const response = await fetch(`/api/notifications/get/${uid}`, {
        method: "GET",
        headers: { 'Content-Type': 'application/json' }
    });

    if (response.status == 500) console.error(await response.json());

    return (await response.json()).results;
}

export { createNotification, setNotificationSeen, getNotificationsForUser, fromDB, deleteNotification, markAllNotificationsAsSeenForUser, toDB }