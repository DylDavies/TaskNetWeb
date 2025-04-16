'use client';

import { createContext, FC, ReactNode, useContext, useEffect, useState } from "react"
import Notification from "./interfaces/Notification.interface"
import { fromDB, getNotificationsForUser, setNotificationSeen } from "./server/services/NotificationService"
import { AuthContext, AuthContextType } from "./AuthContext"
import { Unsubscribe } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "./firebase";
import FSNotification from "./interfaces/FSNotification.interface";

export type NotificationContextType = {
    notifications: Notification[] | null,
    markAsSeen: typeof setNotificationSeen
}

export const NotificationContext = createContext<NotificationContextType | null>(null);

const NotificationProvider: FC<{ children: ReactNode }> = ({children}) => {
    const { user } = useContext(AuthContext) as AuthContextType;

    const [ notifications, setNotifications ] = useState<Notification[] | null>(null);

    useEffect(() => {
        (async () => {
            if (user) {
                setNotifications(await getNotificationsForUser(user.authUser.uid))
            }
        })();

        let unsubscribeSnapshot: Unsubscribe | null = null;

        if (user) {
            unsubscribeSnapshot = onSnapshot(query(collection(db, "notifications"), where("uidFor", "==", user.authUser.uid)), (qSnapshot) => {
                const results: Notification[] = [];

                qSnapshot.forEach(s => results.push(fromDB(s.data() as FSNotification)));

                setNotifications(results);
            });
        }

        return () => {
            if (unsubscribeSnapshot) unsubscribeSnapshot();
        }
    }, [user]);

    return (
        <NotificationContext.Provider value={{ notifications, markAsSeen: setNotificationSeen }}>
            {children}
        </NotificationContext.Provider>
    )
};

export default NotificationProvider;