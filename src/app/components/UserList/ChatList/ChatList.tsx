import { useContext, useEffect, useState } from "react";
import InputBar from "../../inputbar/InputBar";
import "./ChatList.css";
import Image from "next/image";
import { getContracted } from "@/app/server/services/JobDatabaseService";
import { AuthContext, AuthContextType } from "@/app/AuthContext";
import JobWithUser from "@/app/interfaces/JobWithOtherUser.interface";
import { getUser } from "@/app/server/services/DatabaseService";

const ChatList = () => {
  const { user } = useContext(AuthContext) as AuthContextType;

  const [jobUsers, setJobUsers] = useState<JobWithUser[]>([]);

  // Testing getting jobs where people are contracted - may need to become a global state
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // fetches the jobs where the active user and another user are contracted (this currently is only working for clients)
        const jobs = await getContracted("a51lgtG2VAPTUubLGZZDrGeRRo23");
        console.log("JOB DATA: ", jobs);

        // For each job, fetch the hired user's data
        const jobsWithUsers: JobWithUser[] = await Promise.all(
          jobs.map(async (job) => {
            console.log("HIRED UID: ", job.jobData.hiredUId);
            const userData = await getUser(job.jobData.hiredUId);
            console.log("USERDATA: ", userData);
            return { job, userData };
          })
        );

        setJobUsers(jobsWithUsers);
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      }
    };

    fetchJobs();
  }, []);

  return (
    <section className="chatList scrollable">
      <section className="search">
        <InputBar className="searchbar" /> {/*add all the props*/}
      </section>

      {/* items from the user list */}
      {jobUsers.map((item, index) => (
        <section className="item" key={index}>
          <Image
            src="/avatar.png" // you can later update this to dynamic user avatars
            alt="User avatar"
            width={50}
            height={50}
            className="avatar"
          />
          <section className="texts">
            <em>{item.userData?.username}</em>{" "}
            {/* replace with the correct field from job */}
            <p>{item.job.jobData.description || "No messages yet"}</p>{" "}
          </section>
        </section>
      ))}

      <section className="item">
        <Image
          src="/avatar.png"
          alt="User avatar"
          width={50}
          height={50}
          className="avatar"
        />
        <section className="texts">
          <em>Jane Doe</em> {/*username*/}
          <p>Hello</p> {/*latest message from that chat*/}
        </section>
      </section>
    </section>
  );
};

export default ChatList;
