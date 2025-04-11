import React from "react";
import Link from "next/link";

/*
------NOTE TO USER OF THIS COMPONENT-----
  This component dynamically renders items onto the sidebar 
  using list components, to do so:

  Create a list of item name objects for example:

  const items = [{ name: "Client" }, { name: "Logout" }];

  and create the component:

  <SideBar items={items} />

  passing in the props

*/

interface Props {
  items: { name: string; href: string }[];
}
/*

  Sidebar is a react function component that expects props as its input, from those props were extracting items
  React.FS<Props> : functional component that takes in props of type 'Props'
  = ({ items }) => {...} is destructuring
  
  its equivalent to:
  const SideBar = (prop:Props) => {
    const { items } = props;
  }


  "Create a functional component named SideBar that receives props shaped like Props, and we’re pulling items straight out from the props."

*/
const SideBar: React.FC<Props> = ({ items }) => {
  return (
    <aside className="z-20 hidden w-64 overflow-y-auto bg-white dark:bg-gray-800 md:block flex-shrink-0 sidebar">
      <section className="py-4 text-gray-500 dark:text-gray-400">
        <a
          className="ml-6 text-lg font-bold text-gray-800 dark:text-gray-200"
          href="#"
        >
          
        </a>
        <ul className="mt-6 list">
          {items.map((item, index) => (
            <li key={index}>
              <Link href={item.href}>
                  {item.name}
              </Link>
              
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
};

export default SideBar;
