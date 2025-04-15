"use client";
import Header from "../components/Header/header";
import "../components/Header/Header.css";
import WelcomeCard from "../components/WelcomeCard/WelcomeCard";
import SideBar from "../components/sidebar/SideBar";
import "../components/sidebar/sidebar.css";
import Button from "../components/button/Button";
import "../components/button/Button.css";
import "./global.css";
import { useEffect, useState } from "react";
import AuthService from "../services/AuthService";
import ActiveUser from "../interfaces/ActiveUser.interface";
import { useRouter } from "next/navigation";
import UserType from "../enums/UserType.enum";
import UserStatus from "../enums/UserStatus.enum";
import JobData from "../interfaces/JobData.interface";
import { getJob } from "../server/services/JobDatabaseService";

//constant for links to other pages
const links = [{ name: "Home", href: "/" }];

//this is a comment
export default function Page() {
  const [activeUser, setActiveUser] = useState<ActiveUser>();
  const [loading, setLoading] = useState(true); // move this above conditional
  const [jobData, setJobData] = useState<JobData | null>(null); // move this up too

  const router = useRouter();

  useEffect(() => {
    (async () => {
      setActiveUser((await AuthService.getCurrentUser()) as ActiveUser);
    })();
  }, []);

  //sign out
  function signoutClick() {
    AuthService.googleSignout();
    router.push("/");
  }

  // auth check
  useEffect(() => {
    async function auth() {
      const user = await AuthService.getCurrentUser();

      if (
        user?.userData.type !== UserType.Freelancer &&
        user?.userData.type !== UserType.Admin
      )
        router.push("/");

      if (
        user?.userData.type !== UserType.Admin &&
        user?.userData.status == UserStatus.Pending
      )
        router.push("/pending");

      if (
        user?.userData.type !== UserType.Admin &&
        user?.userData.status == UserStatus.Denied
      )
        router.push("/denied");

      setLoading(false);
    }

    auth();
  }, []);

  // fetch job data
  useEffect(() => {
    async function fetchJobWithUID() {
      try {
        const jobData = await getJob("Kb3PXEXuWGlSrWug6Dn2");
        setJobData(jobData);
        console.log("Fetched job data: ", jobData);
      } catch (error) {
        console.error("Error occured while fetching Job: ", error);
      }
    }

    if (!loading) fetchJobWithUID();
  }, [loading]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <section className="min-h-screen flex flex-col dark:bg-[#27274b] text-white font-sans">
      <header className="w-full bg-orange-500 ">
        <Header
          name={activeUser?.userData.username || "Username"}
          usertype="Freelancer"
        />
      </header>

      <main className="flex flex-1 dark:bg-[#cdd5f6] bg-color">
        <section className="w-64">
          <SideBar items={links} />
        </section>

        <section className="flex-1 p-4 flex items-start justify-center">
          <WelcomeCard
            username={activeUser?.userData.username || "Username"}
            type="freelancer"
          />
        </section>
      </main>

      <footer className=" py-4 flex justify-end bg-gray-900 box-footer">
        <Button caption={"Log out"} onClick={() => signoutClick()} />
      </footer>
    </section>
  );
}
