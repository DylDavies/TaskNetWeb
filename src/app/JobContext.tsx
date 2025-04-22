'use client';

import { createContext, FC, ReactNode, useState } from "react"

export type JobContextType = {
    jobID: string | null,
    setJobID: (id: string | null) => void;
}

export const JobContext = createContext<JobContextType | null>(null);

const JobProvider: FC<{ children: ReactNode }> = ({children}) => {
    const [ jobID, setJID ] = useState<string | null>(sessionStorage.getItem("jobID"));

    function setJobID(id: string | null): void {
        setJID(id);
        if (id) sessionStorage.setItem("jobID", id);
        else sessionStorage.removeItem("jobID");
    }

    return (
        <JobContext.Provider value={{ jobID, setJobID }}>
            {children}
        </JobContext.Provider>
    )
};

export default JobProvider;