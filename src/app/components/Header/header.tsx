import React, { useContext, useEffect, useState } from "react";
import Notifications from "../Notifications/Notifications";
import "./Header.css";
import { AuthContext, AuthContextType } from "@/app/AuthContext";
import Image from "next/image";
import UserType from "@/app/enums/UserType.enum";
import VerticalDots from "../VerticalDots/VerticalDots";
import FreelancerSkillsModal from "../FreelancerSkillsModal/FreelancerSkillsModal";

type Props = {
  usertype: string; // freelancer or client to determine the messag
  name: string; // name displayed in message
};

// Dynamic, enter a usertype and name to create
const Header: React.FC<Props> = ({ usertype, name }) => {
  const { user } = useContext(AuthContext) as AuthContextType;
  const initial = name.charAt(0).toUpperCase();
  const [showSkillsModal, setShowSkillsModal] = useState<boolean>(false);
  const [skills, setSkills] = useState<{ [skillArea: string]: string[] }>(
    user?.userData.skills ?? {}
  );

  useEffect(() => {
    if (user?.userData.skills) {
      setSkills(user.userData.skills);
    }
  }, [user?.userData.skills]);

  // Update skills
  const handleUpdateSkills = (updatedSkills: {
    [skillArea: string]: string[];
  }) => {
    setSkills(updatedSkills);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-gray-900 border-b border-gray-800 box-header">
      <section className="flex items-center justify-between max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
        <section className="flex items-center gap-3 lg:gap-4">
          {/*<img
        src="/images/WhiteLogo.png"
        alt="TaskNet Logo"
        className="w-8 h-8 sm:w-9 sm:h-9"
      />
      */}
          <h1 className="text-xl sm:text-2xl font-bold text-white">TaskNet</h1>
        </section>

        <p className="text-xl sm:text-2xl font-bold text-white">{usertype}</p>
        <section className="flex items-center gap-6 sm:gap-5">
          <Notifications></Notifications>

          {/* Profile Photo */}
          {user?.userData.avatar ? (
            <Image
              src={user.userData.avatar}
              alt="Avatar"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full"
              width={200}
              height={200}
            ></Image>
          ) : (
            <section className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-sm sm:text-base">
              {initial}
            </section>
          )}

          {/* User Name */}
          <section className="text-gray-200 font-medium text-sm sm:text-base">
            {name}
          </section>

          {/* Freelancer skills display and editing*/}
          <section>
            <VerticalDots
              isVisible={user?.userData.type === UserType.Freelancer}
              caption="Edit your skills"
              onClick={() => setShowSkillsModal(true)}
            />
          </section>

          {/* Freelancer Skills Modal */}
          <FreelancerSkillsModal
            show={showSkillsModal}
            onClose={() => setShowSkillsModal(false)}
            userSkills={skills}
            onUpdateSkills={handleUpdateSkills}
          />
        </section>
      </section>
    </header>
  );
};

export default Header;
