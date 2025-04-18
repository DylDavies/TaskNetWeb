import Notification from "../interfaces/Notification.interface";

interface Props {
    notification?: Notification,
    markAsRead?: () => void,
    deleteFn?: () => void,
    firstItem: boolean
}

const NotificationListItem = ({ notification, markAsRead, deleteFn, firstItem }: Props) => {
  let classes = 'inline-flex items-center justify-between w-full px-2 py-1 text-sm font-semibold transition-colors duration-150 rounded-md cursor-default';

  if (notification !== undefined && notification.seen) classes += " bg-gray-800 text-gray-200";

  return (
  <li className={firstItem ? "mt-12 flex" : "flex"}>
      <section className={classes}>
        <p>{ notification == undefined ? "No notifications" : notification.message }</p>
        { notification ? 
          <button
          className="inline-flex items-center justify-center text-gray-300 hover:bg-gray-800 hover:text-gray-200 cursor-pointer focus:outline-none focus:ring-2 focus: ring-indigo-500 rounded-md p-2"
          onClick={notification && !notification.seen ? markAsRead : deleteFn}
          >
            {!notification.seen ?
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            :
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
            }
          </button>
          :
          <></>
        }
      </section>
  </li>
  )
}

export default NotificationListItem;