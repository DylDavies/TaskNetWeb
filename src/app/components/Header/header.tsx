import React from "react";

type Props = {
  usertype: string; // freelancer or client to determine the messag
  name: string; // name displayed in message
};

// Dynamic, enter a usertype and name to create
const Header: React.FC<Props> = ({ usertype, name }) => {
  const initial = name.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <section className="flex items-center justify-between max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
        {/* Left Side: Logo */}
        <section className="flex items-center gap-3 lg:gap-4">
          <img
            src="/images/Logo.png"
            alt="TaskNet Logo"
            className="w-8 h-8 sm:w-9 sm:h-9"
          />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
            TaskNet
          </h1>
        </section>

        {/* Center: Message */}
        <p className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
          {usertype}
        </p>

        {/* Right Side: User Info */}
        <section className="flex items-center gap-6 sm:gap-5">
          {/* Notification Icon (SVG) */}
          <button className="relative text-gray-600 dark:text-gray-300 hover:text-blue-500 focus:outline-none">
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
          </button>

          {/* Profile Initial - should make a user profile photo instead*/}
          <section className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-sm sm:text-base">
            {initial}
          </section>

          {/* User Name */}
          <section className="text-gray-700 dark:text-gray-200 font-medium text-sm sm:text-base">
            {name}
          </section>
        </section>
      </section>
    </header>
  );
};

export default Header;
