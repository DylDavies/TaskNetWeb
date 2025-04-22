import React, { JSX } from "react";
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

type SideBarProps = {
  items: { name: string; href: string }[];
  myfunction? :() => JSX.Element ;
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
const SideBar =  ({ items ,myfunction}: SideBarProps ) => {
  return (
    <aside className="z-20 hidden w-64 overflow-y-auto bg-gray-800 md:block flex-shrink-0 sidebar box">
  <section className="py-4 text-gray-400">
    <a className="ml-6 text-lg font-bold text-gray-200" href="#">
      {/* Optional: Sidebar Title */}
    </a>
    <ul className="mt-6 list">
      {items.map((item, index) => (
        <li key={index}>
          <Link href={item.href} className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded">
            {item.name}
          </Link>

        </li>
      ))}
          
    {myfunction &&(
       <li  className="block px-4 py-2 text-gray-300 hover:bg-gray-700 rounded hover-effect">
        {myfunction()}
     </li>
     )}
    </ul>
  </section>
</aside>

  );
};

export default SideBar;