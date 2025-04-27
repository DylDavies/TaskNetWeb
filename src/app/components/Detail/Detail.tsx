import Button from "../button/Button";
import "./Detail.css";
import { useRouter } from "next/navigation";
import AuthService from "@/app/services/AuthService";
import { useContext, useEffect, useState } from "react";
import ActiveMessage from "@/app/interfaces/ActiveMessage.interface";
import JobWithUser from "@/app/interfaces/JobWithOtherUser.interface";
import { getContracted } from "@/app/server/services/JobDatabaseService";
import { AuthContext, AuthContextType } from "@/app/AuthContext";
import { getUser } from "@/app/server/services/DatabaseService";
import { getAllMessages } from "@/app/server/services/MessageDatabaseServices";

const Detail = () => {
  const { user } = useContext(AuthContext) as AuthContextType;

  const router = useRouter();

  const [messages, setMessages] = useState<ActiveMessage[]>([]);

  const [jobUsers, setJobUsers] = useState<JobWithUser[]>([]);

  // Testing getting jobs where people are contracted - may need to become a global state
  useEffect(() => {
    const fetchJobs = async () => {
      if (!user) return; // ⬅️ only run if user exists

      try {
        const jobs = await getContracted(user.authUser.uid);
        console.log("JOB DATA: ", jobs);

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
  }, [user]); // 👈 Depend on 'user' here

  // Test for fetching messages
  const testingJobID = "BFtUtw3vOMd2JpbhurLY";
  useEffect(() => {
    async function fetchMessages() {
      try {
        const messageData = await getAllMessages(jobUsers[0].job.jobId);
        console.log("fetched message data: ", messageData);
        setMessages(messageData);
      } catch (error) {
        console.error("Error occurred while trying to fetch messages: ", error);
      }
    }
    fetchMessages();
  }, [jobUsers]);

  function signoutClick() {
    AuthService.googleSignout();
    router.push("/");
  }

  return (
    <section className="detail">
      <section className="user">
        <img src="./avatar.png" alt="" />
        {jobUsers.length > 0 ? (
          <h2>{jobUsers[0].userData?.username}</h2>
        ) : (
          <h2>Loading...</h2> // or some other placeholder
        )}
        {jobUsers.length > 0 ? (
          <p>{jobUsers[0].job.jobData.title}</p>
        ) : (
          <p>Loading...</p>
        )}
      </section>
      <section className="info">
        {/* Option 1 */}
        <section className="option">
          <section className="title">
            <em>Chat settings</em>
            <img src="./arrowUp.png" alt="" />
          </section>
        </section>

        {/* Option 2 */}
        <section className="option">
          <section className="title">
            <em>Privacy & help</em>
            <img src="./arrowUp.png" alt="" />
          </section>
        </section>

        {/* Option 3 */}
        <section className="option">
          <section className="title">
            <em>Shared photos and messages</em>
            <img src="./arrowDown.png" alt="" />
          </section>
          <section className="photos">
            {/*photo item 1*/}
            <section className="photoItem">
              <section className="photoDetail">
                <img src="" alt="" /> {/*image*/}
                <em>photo_2025_2.png</em> {/*photo name*/}
              </section>
              <img src="./download.png" alt="" className="icon" />
              {/*download icon*/}
            </section>

            {/*photo item 2*/}
            <section className="photoItem">
              <section className="photoDetail">
                <img src="" alt="" /> {/*image*/}
                <em>photo_2025_2.png</em> {/*photo name*/}
              </section>
              <img src="./download.png" alt="" className="icon" />
              {/*download icon*/}
            </section>

            {/*photo item 3*/}
            <section className="photoItem">
              <section className="photoDetail">
                <img src="" alt="" /> {/*image*/}
                <em>photo_2025_2.png</em> {/*photo name*/}
              </section>
              <img src="./download.png" alt="" className="icon" />
              {/*download icon*/}
            </section>
          </section>
        </section>

        {/* Option 4 */}
        <section className="option">
          <section className="title">
            <em>Shared Files</em>
            <img src="./arrowUp.png" alt="" />
          </section>
        </section>
        <Button caption="Block user" />
        <Button caption="Logout" onClick={() => signoutClick()} />
      </section>
    </section>
  );
};

export default Detail;
