"use client";
import { approveUser, denyUser } from "@/app/server/services/DatabaseService";
import React, { useEffect, useState } from "react";

interface User  {
  uid: string;
  username: string;
  status: number;
  type: number; // Do we not need role like freelancer and client?
  date: number;
}
/*
  previously was name, role and date
*/

interface Props {
  data: User[];
}
const AdminTable: React.FC<Props> = ({ data }) => {
  //console.log(`The data is: ${JSON.stringify(data, null, 2)}`); //sanity check
  const [pendingUsers, setPendingUsers] = useState<User[]>(data);

  useEffect(() => {
    setPendingUsers(data);
    console.log(
      "new Updated pending users with new data:",
      JSON.stringify(data, null, 3)
    );
  }, [data]);

  const handleApprove = async (uid: string) => {
    try {
      await approveUser(uid);
      setPendingUsers((currentUser) =>
        currentUser.filter((user) => user.uid != uid)
      ); // for updating table when approved
      console.log(`Successfully approved user ${uid}`);
    } catch (error) {
      console.error(`Error when trying to approve user ${error}`);
    }
  };

  const handleDeny = async (uid: string) => {
    try {
      await denyUser(uid);
      setPendingUsers((currentUser) =>
        currentUser.filter((user) => user.uid != uid)
      ); // for updating table when approved
      console.log(`Successfully Denied user ${uid}`);
    } catch (error) {
      console.error(`Error when trying to deny user ${error}`);
    }
  };

  //This function will convert type from a number to a String
  function TypeHelper(type: number): string {
    
    switch (type) {
                case 0:
                  return "No User type";
                case 1:
                  return "Freelancer";
                case 2:
                  return "Client";
                case 3:
                  return "Admin";
                default:
                  return "Error";
              } 
  }
  /*
--- HOW TO USE ---
  use case example:

      <main className="p-4">
        <h1 className="text-2xl font-bold mb-4">Admin Table Test</h1>
        <AdminTable data={userData} />
      </main>

  - pass the AdminTable component an array of objects (prop)
  -structure: 
  {
  name:string, 
  role:string, 
  date:string
  }
    

  SAMPLE DATA BELOW

  --- Testing Data ---
  const userData = [
  {
    name: "Hans Burger",
    role: "freelancer",
    date: "6/10/2020",
  },
  {
    name: "Jolina Angelie",
    role: "client",
    date: "6/10/2020",
  },
  {
    name: "Sarah Curry",
    role: "freelancer",
    date: "6/10/2020",
  },
  {
    name: "Rulia Joberts",
    role: "client",
    date: "6/10/2020",
  },
  {
    name: "Wenzel Dashington",
    role: "freelancer",
    date: "6/10/2020",
  },
  {
    name: "Dave Li",
    role: "client",
    date: "6/10/2020",
  },
  {
    name: "Maria Ramovic",
    role: "client",
    date: "6/10/2020",
  },
];
  
  */

  return (
    <>
      <h4 className="mb-4 text-lg font-semibold text-gray-300">
  Administrator
</h4>
<section className="w-full mb-8 overflow-hidden rounded-lg shadow-xs box">
  <section className="w-full overflow-x-auto">
    <table className="w-full whitespace-no-wrap">
      <thead>
        <tr className="text-xs font-semibold tracking-wide text-left uppercase border-b border-gray-700 bg-gray-800 text-gray-400">
          <th className="px-4 py-3">User</th>
          <th className="px-4 py-3">Status</th>
          {/*<th className="px-4 py-3">Date</th>*/}
          <th className="px-4 py-3">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-700 bg-gray-800">
        {pendingUsers.map((item, index) => (
          <tr key={index} className="text-gray-400">
            <td className="px-4 py-3">
              <section className="flex items-center text-sm">
                <section className="relative hidden w-8 h-8 mr-3 rounded-full md:block">
                  <section
                    className="absolute inset-0 rounded-full shadow-inner"
                    aria-hidden="true"
                  />
                </section>
                <section>
                  <p className="font-semibold">{item.uid}</p>
                  <p className="font-semibold">{item.username}</p>
                  <p className="text-xs text-gray-400">
                    {TypeHelper(item.type)}
                  </p>
                </section>
              </section>
            </td>

            {/* Always show Pending in orange */}
            <td className="px-4 py-3 text-xs">
              <strong className="px-2 py-1 font-semibold leading-tight rounded-full text-white bg-orange-600">
                Pending
              </strong>
            </td>

            {/* Date column */}
            {/*<td className="px-4 py-3 text-sm">{item.date}</td>*/}

            {/* Approve and Deny buttons */}
            <td className="px-4 py-3 text-xs space-x-2">
              <button
                onClick={() => handleApprove(item.uid)}
                className="px-2 py-1 font-semibold leading-tight rounded-full bg-green-700 text-green-100"
              >
                Approve
              </button>
              <button
                onClick={() => handleDeny(item.uid)}
                className="px-2 py-1 font-semibold leading-tight rounded-full bg-red-700 text-red-100"
              >
                Deny
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </section>
</section>
    </>
  );
};

export default AdminTable;
