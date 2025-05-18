import React from "react";
import Link from "next/link";
import "./sidebar.css";
import Button from "../button/Button";
import AuthService from "@/app/services/AuthService";
import { useRouter } from "next/navigation";

type SideBarProps = {
  items?: { name: string; href: string; selected: boolean }[];
  buttons?: React.ReactNode[];
};

const SideBar = ({ items, buttons }: SideBarProps) => {
  const router = useRouter();

  function signoutClick() {
    AuthService.googleSignout();
    router.push("/");
  }

  return (
    <aside className="z-20 hidden w-64 overflow-y-auto bg-gray-800 md:block flex-shrink-0 sidebar box">
      <section className="py-4 text-gray-400">
        <a className="ml-6 text-lg font-bold text-gray-200" href="#">
          {/* Optional: Sidebar Title */}
        </a>
      
        <ul className="mt-6 list">
          {items?.map((item, index) => (
            <li key={index}>
              {item.selected ? (
                <Link
                  href={item.href}
                  className="block px-4 py-2 text-white bg-gray-700 rounded pointer-events-none"
                  aria-disabled={true}
                  tabIndex={-1}
                >
                  {item.name}
                </Link>
              ) : (
                <Link
                  href={item.href}
                  className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded"
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}

          {buttons?.map((button, index) => (
            <li key={`button-${index}`} className="block px-4 py-2 text-gray-300 hover:bg-gray-700 rounded hover-effect ">
              {button}
            </li>
          ))}

        </ul>
        
        <section className="absolute bottom-0 mb-4">
          <Button caption={"Log out"} onClick={() => signoutClick()} />
        </section>
      </section>
    </aside>
  );
};

export default SideBar;