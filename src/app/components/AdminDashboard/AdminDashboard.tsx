"use client";
import React, { useEffect, useState } from "react";
import AdminTable from "../AdminTable/AdminTable";
import { getPendingUsers } from "@/app/server/services/DatabaseService";
import InputBar from "../inputbar/InputBar";

interface User {
  uid: string;
  username: string;
  status: number;
  type: number;
  date: number;
}



  export default function DashboardContent() {

    const [pendingUsers, setPendingUsers] = useState<User[]>([]);
    const [SearchQuery, setSearchQuery] = useState<string>("");
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  // To update the admin table after the Admin approves or denies user
    useEffect(() => {
    async function fetchPendingUsers() {
      const pendingUsers = await getPendingUsers();
      //console.log("Pending users: ", pendingUsers);
      setPendingUsers(pendingUsers);
    }

    fetchPendingUsers();
  }, []);

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
              className="w-full h-14 searchbar"
            />
          </section>
        </section>
  
        {/* AdminTable */}
        <section className="w-full max-w-8xl mt-16">
          <AdminTable data={filteredUsers} />
        </section>
      </section>
    );
  }
