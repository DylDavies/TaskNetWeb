"use client";
import React, { useEffect, useState } from "react";
import SkillData from "@/app/interfaces/SkillData.interface";

interface Props {
  data: SkillData[];
}
const SkillsTable: React.FC<Props> = ({ data }) => {

  return (
    <>
      <h4 className="mb-4 text-lg font-semibold text-gray-300">
        Skills
      </h4>
      <section className="w-full mb-8 overflow-hidden rounded-lg shadow-xs box">
        <section className="w-full overflow-x-auto">
          <table className="w-full whitespace-no-wrap">
            <thead>
              <tr className="text-xs font-semibold tracking-wide text-left uppercase border-b border-gray-700 bg-gray-800 text-gray-400">
                <th className="px-4 py-3">Skill Area</th>
                <th className="px-4 py-3">Skills</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 bg-gray-800">
              {data.map((item, index) => (
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
                        <p className="font-semibold">{item.id}</p>
                      </section>
                    </section>
                  </td>
                  <td>
                    {<p className="font-semibold">{item.skills.join(", ")}</p>}
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

export default SkillsTable;
