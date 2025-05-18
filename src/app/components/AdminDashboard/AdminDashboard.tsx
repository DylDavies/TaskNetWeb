"use client";
import React, { useEffect, useState } from "react";
import AdminTable from "../AdminTable/AdminTable";
import { getPendingUsers } from "@/app/server/services/DatabaseService";
import InputBar from "../inputbar/InputBar";
import PendingUser from "@/app/interfaces/PendingUser.interface";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/app/firebase";

  export default function DashboardContent() {

    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
    const [SearchQuery, setSearchQuery] = useState<string>("");
    const [filteredUsers, setFilteredUsers] = useState<PendingUser[]>([]);



  // To update the admin table after the Admin approves or denies user
    useEffect(() => {
    async function fetchPendingUsers() {
      const pendingUsers = await getPendingUsers();
      setPendingUsers(pendingUsers);
    }

    fetchPendingUsers();
  }, []);

  //This will set pending users when they load the page
  useEffect(() => {
    const usersRef = collection(db, "users");
  
    const unsubscribe = onSnapshot(usersRef, async () => {
      const updated = await getPendingUsers();
      setPendingUsers([...updated]);
    });
  
    return () => unsubscribe();
  }, []);
  
//This will set pending users in the table when there is a change in perding users or searched for users
useEffect(() => {
  let filtered = pendingUsers;
  const query = SearchQuery.toLowerCase();
  if (SearchQuery){
    filtered = pendingUsers.filter(user => {
      const email = user?.uid?.toLowerCase() || '';
      const username = user?.username?.toLowerCase() || '';
      
      return email.includes(query) || 
             username.includes(query);
  });
  }
  setFilteredUsers(filtered);
}, [pendingUsers, SearchQuery]);

    return (
      <section className="flex flex-col items-center space-y-4">
        {/* SearchBar */}
        <section className="w-full max-w-4xl mt-10 mb-6">
          <section className="w-full h-14">
            <InputBar
              value={SearchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="!w-full h-14 searchbar"
            />
          </section>
        </section>
  
        {/* Pending users table */}
        <section className="w-full max-w-8xl mt-16">
          <AdminTable data={filteredUsers} />
        </section>
      </section>
    );
  }
