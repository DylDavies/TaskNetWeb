import NotificationAction from "./NotificationAction.interface";

interface FSNotification {
    uid: string;
    uidFor: string;
    message: string;
    seen: boolean;
    action?: NotificationAction;
    sentTime: number
}

export default FSNotification;