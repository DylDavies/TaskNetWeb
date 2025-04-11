"use client"; // is this a problem?
import React from "react";

interface User {
  name: string;
  role: string;
  date: string;
}

interface Props {
  data: User[];
}

const AdminTable: React.FC<Props> = ({ data }) => {
  const handleApprove = (name: string) => {
    console.log(`Approved: ${name}`);
  };

  const handleDeny = (name: string) => {
    console.log(`Denied: ${name}`);
  };

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
      <h4 className="mb-4 text-lg font-semibold text-gray-600 dark:text-gray-300">
        Administrator
      </h4>
      <section className="w-full mb-8 overflow-hidden rounded-lg shadow-xs box">
        <section className="w-full overflow-x-auto">
          <table className="w-full whitespace-no-wrap">
            <thead>
              <tr className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
              {data.map((item, index) => (
                <tr key={index} className="text-gray-700 dark:text-gray-400">
                  <td className="px-4 py-3">
                    <section className="flex items-center text-sm">
                      <section className="relative hidden w-8 h-8 mr-3 rounded-full md:block">
                        <section
                          className="absolute inset-0 rounded-full shadow-inner"
                          aria-hidden="true"
                        />
                      </section>
                      <section>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {item.role}
                        </p>
                      </section>
                    </section>
                  </td>

                  {/* Always show Pending in orange */}
                  <td className="px-4 py-3 text-xs">
                    <strong className="px-2 py-1 font-semibold leading-tight rounded-full text-orange-700 bg-orange-100 dark:text-white dark:bg-orange-600">
                      Pending
                    </strong>
                  </td>

                  <td className="px-4 py-3 text-sm">{item.date}</td>

                  {/* Approve and Deny buttons */}
                  <td className="px-4 py-3 text-xs space-x-2">
                    <button
                      onClick={() => handleApprove(item.name)}
                      className="px-2 py-1 font-semibold leading-tight rounded-full text-green-700 bg-green-100 dark:bg-green-700 dark:text-green-100 approve"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDeny(item.name)}
                      className="px-2 py-1 font-semibold leading-tight rounded-full text-red-700 bg-red-100 dark:text-red-100 dark:bg-red-700 deny"
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
