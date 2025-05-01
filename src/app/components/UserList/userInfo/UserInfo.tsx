"use client";
import { useRouter } from "next/navigation";
import { AuthContext, AuthContextType } from "@/app/AuthContext";
import "./userInfo.css";
import { useContext } from "react";
import Button from "../../button/Button";
import UserType from "@/app/enums/UserType.enum";

const UserInfo = () => {
  const { user } = useContext(AuthContext) as AuthContextType;
  const router = useRouter();

  const handleBackClick = () => {
    const userType = user?.userData?.type;

    const redirectPath =
      userType === UserType.Freelancer
        ? "/freelancer"
        : userType === UserType.Client
        ? "/client"
        : "/"; // fallback to home

    router.push(redirectPath);
  };

  return (
    <section className="userInfo">
      <section className="user">
        <Button caption="Back" onClick={handleBackClick} />
        <section className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-sm sm:text-base">
          {user?.userData.username?.charAt(0)}
        </section>
        <h2>{user?.userData.username}</h2>
      </section>
    </section>
  );
};

export default UserInfo;
