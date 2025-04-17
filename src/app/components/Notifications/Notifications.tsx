import { NotificationContext, NotificationContextType } from "@/app/NotificationContext"
import NotificationList from "@/app/NotificationList/NotificationList";
import { useContext, useEffect, useRef, useState } from "react"

const Notifications = () => {
    const { notifications } = useContext(NotificationContext) as NotificationContextType;
    const [ menuOpen, setMenuOpen ] = useState(false);
    const ref = useRef<HTMLElement | null>(null);

    const displayBadge: boolean | null = (notifications && notifications.filter(n => !n.seen).length > 0);

    useEffect(() => {
      document.addEventListener("mousedown", (event) => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          setMenuOpen(false);
        }
      });
    }, [ref]);



    function notificationButtonClick() {
      setMenuOpen(!menuOpen);
    }

    return (
      <nav className="relative" ref={ref}>
      <button className="text-gray-300 hover:text-blue-500 focus:outline-none" onClick={notificationButtonClick}>
        <svg
          className="w-6 h-6 sm:w-7 sm:h-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V5a2 2 0 00-4 0v.083A6 6 0 004 11v3.159c0 .538-.214 1.055-.595 1.436L2 17h5m8 0a3.001 3.001 0 01-6 0h6z"
          />
        </svg>
        { displayBadge ?
        <span
          aria-label="Notification Badge"
          role="status"
          className="absolute top-0 right-0 inline-block w-3 h-3 transform translate-x-1 -translate-y-1 bg-red-600 border-2 border-white rounded-full dark:border-gray-800"
        ></span>
        :
        <></> }
      </button>
      { menuOpen ? <NotificationList></NotificationList> : <></> }
      </nav>
    )
}

export default Notifications;