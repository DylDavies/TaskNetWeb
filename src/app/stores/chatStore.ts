import { create } from 'zustand'
import ChatStore from '../interfaces/ChatStore.interface'
import JobWithUser from '../interfaces/JobWithOtherUser.interface';
// import { getAllMessages } from '../server/services/MessageDatabaseServices';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import MessageData from '../interfaces/MessageData.interface';
import UserType from '../enums/UserType.enum';
import UserStatus from '../enums/UserStatus.enum';

export const useChatStore = create<ChatStore>((set) =>({
    jobsWithUsers: [],
    activeConversation: null,
    messages: [],
    isLoadingJobs: false,
    isLoadingMessages: false,


    fetchJobsWithUsers: async(uid:string, userType:UserType) =>{
        set({ isLoadingJobs:true });

        try{
            const { getContracted } = await import("@/app/server/services/JobDatabaseService")
            const { getUser } = await import("@/app/server/services/DatabaseService");

            const jobs = await getContracted(uid, userType); // get array of all jobs contracted to the active user
            const jobsWithUsers = await Promise.all(
                jobs.map(async (job) =>{
                    let userData;
                    if (userType == UserType.Admin || userType == UserType.Client){
                        userData = await getUser(job.jobData.hiredUId); // get data from clients POV
                    }

                    if (userType == UserType.Admin || userType == UserType.Freelancer){
                        userData = await getUser(job.jobData.clientUId); // get data from the freelancers POV
                    }
                    
                    if(userData){
                        return { job, userData }
                    }
                    else{
                        return{
                            job,
                            userData: { type: UserType.None, status: UserStatus.Denied, username: "Error", date: 20250202, },
                        } // return this "Error" object os jobsWithUsers isnt null or undefined
                    }
                    
                })
            );
            console.log("Entered fetch jobs ");

            set({ jobsWithUsers, isLoadingJobs:false });
        }
        catch(error){
            console.error("Failed to fetch jobs: ",error);
            set({ isLoadingJobs:false });
        }
    },

    setActiveConversation: (jobWithUser: JobWithUser) => {
        set({ activeConversation: jobWithUser, messages: [], isLoadingMessages: true });
    
        const messagesRef = collection(
          db,
          "Jobs",
          jobWithUser.job.jobId,
          "messages"
        );
        const q = query(messagesRef, orderBy("DateTimeSent"));
    
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const msgs = snapshot.docs.map((doc) => ({
            MessageID: doc.id,
            messageData: doc.data() as MessageData,
          }));

          console.log("unsubscribe: ",unsubscribe);
          console.log("Entered messages ");
    
          set({ messages: msgs, isLoadingMessages: false });
        });
    
        // Optional: save unsubscribe if you want to stop listening later
      },

      clearMessages: () => set({ messages: [] }),
}));