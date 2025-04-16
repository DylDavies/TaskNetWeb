import NotificationAction from "./NotificationAction.interface";

interface Notification {
    uid: string;
    uidFor: string;
    message: string;
    seen: boolean;
    action?: NotificationAction;
    sentTime: Date
}

export default Notification;