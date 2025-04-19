import { useContext } from "react";
import { NotificationContext, NotificationContextType } from "../NotificationContext";
import NotificationListItem from "./NotificationListItem";
import { deleteNotification, markAllNotificationsAsSeenForUser, setNotificationSeen } from "../server/services/NotificationService";

const NotificationList = () => {
    const { notifications } = useContext(NotificationContext) as NotificationContextType;

    let notificationList: React.JSX.Element[] | null = null;

    if (notifications) {
        notifications.sort((a, b) => 
            a.sentTime.getTime() - b.sentTime.getTime()
        )
        notificationList = notifications.map((val, i) => 
            <NotificationListItem firstItem={i == 0} notification={val} markAsRead={() => {if (!val.seen) setNotificationSeen(val.uid, true)}} deleteFn={() => deleteNotification(val.uid)} key={val.uid}></NotificationListItem>)
    }

    function markAllAsRead() {
        if (!notifications) return;

        const uids = notifications.filter(val => !val.seen).map(val => val.uid);

        markAllNotificationsAsSeenForUser(uids);
    }

    return (
        <ul
        //   x-transition:leave="transition ease-in duration-150"
        //   x-transition:leave-start="opacity-100"
        //   x-transition:leave-end="opacity-0"
          className="absolute right-0 w-100 max-h-100 p-2 mt-2 space-y-2 border rounded-md shadow-md text-gray-300 border-gray-700 bg-gray-700 overflow-y-auto"
          aria-label="submenu"
        >
            { notifications && notifications.length > 0 ?
            <>
            <li className="flex fixed bg-gray-700 w-93 p-2 -mt-2">
                <button
                className="cursor-pointer inline-flex items-center justify-center text-gray-300 hover:bg-gray-800 hover:text-gray-200 p-2 rounded-md"
                onClick={markAllAsRead}
                >Mark all as read</button>
            </li>
            {notificationList}
            </> : <NotificationListItem firstItem={false}></NotificationListItem>}
        </ul>
    )
}

export default NotificationList;