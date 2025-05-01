"use client";
import { useContext } from "react";
import { AuthContext, AuthContextType } from "@/app/AuthContext";
import UserType from "@/app/enums/UserType.enum";
import "./userInfo.css";

const UserInfo = () => {
  const { user } = useContext(AuthContext) as AuthContextType;

  const userType = user!.userData!.type;
  const redirectPath =
    userType === UserType.Freelancer
      ? "/freelancer"
      : userType === UserType.Client
      ? "/client"
      : "/";

  return (
    <section className="userInfo">
      <section className="user">
        <a
          href={redirectPath}
          className="btn-grad rounded-full text-sm py-2 px-4"
        >
          Back
        </a>
        <section className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-sm sm:text-base">
          {user?.userData.username?.charAt(0)}
        </section>
        <h2>{user?.userData.username}</h2>
      </section>
    </section>
  );
};

export default UserInfo;
