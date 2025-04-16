import NotificationActionType from "../enums/NotificationActionType.enum";

interface NotificationAction {
    type: NotificationActionType,
    locationUid: string
}

export default NotificationAction;