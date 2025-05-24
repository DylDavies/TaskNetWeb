"use client";
import { approveUser, denyUser } from "@/app/server/services/DatabaseService";
import React, { useEffect, useState } from "react";
import "./AdminTable.css";
interface User {
  uid: string;
  username: string;
  status: number;
  type: number;
  date: number;
}

interface Props {
  data: User[];
}
const AdminTable: React.FC<Props> = ({ data }) => {
  const [pendingUsers, setPendingUsers] = useState<User[]>(data);

  useEffect(() => {
    setPendingUsers(data);
  }, [data]);

  const handleApprove = async (uid: string) => {
    try {
      await approveUser(uid);
      setPendingUsers((currentUser) =>
        currentUser.filter((user) => user.uid != uid)
      ); // for updating table when approved
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
