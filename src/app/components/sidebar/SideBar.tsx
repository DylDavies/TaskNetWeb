import React from "react";

const SideBar = ({ items }) => {
  return (
    <aside className="w-64 overflow-y-auto bg-white dark:bg-gray-800 md:block flex-shrink-0 sidebar">
      <section className="py-4 text-gray-500 dark:text-gray-400">
        <a
          className="ml-6 text-lg font-bold text-gray-800 dark:text-gray-200"
          href="#"
        >
          TaskNet
        </a>
        <ul className="mt-6 list">
          {items.map((item, index) => (
            <li key={index}>{item.name}</li>
          ))}
        </ul>
      </section>
    </aside>
  );
};

export default SideBar;
