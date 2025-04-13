"use client";
import React, { useState } from "react";
import InputBar from "../components/inputbar/InputBar";
import "../components/inputbar/inputBar.css";
import Button from "../components/button/Button";
import "../components/button/Button.css";
import "./global.css";
import { SetUserName, setUserType } from "../server/services/DatabaseService";
import AuthService from "../services/AuthService";
import UserType from "../enums/UserType.enum";
import { Login } from "../Navigation/navigation";
import { useRouter } from "next/navigation";



export default function Page() {
    const [inputText, setInputText] = useState("");
    const[type, setType] = useState("");
    const router = useRouter();
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setType(e.target.value);
    };

    async function LoginClick(usertype: number, username: string){

        console.log(username, usertype);
        //getting the current user
        const activeUser = await AuthService.getCurrentUser();
        
        //if there is a user, will call set username and type
        if (activeUser) {
            const uid = activeUser.authUser.uid;
            setUserType(uid,usertype);
            SetUserName(uid,username);
        }
        else{
            console.log("No active user");
        }

        Login(usertype, router);
        
    };



    return(
        <main className="flex items-center justify-center h-screen bg-neutral-900">
            <section className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex overflow-hidden">
                {/* Left side (Image section) */}
                <section className="w-1/2 bg-neutral-900 text-white flex justify-center items-center">
                    <img
                        src="/images/signup-freelance.jpg"
                        className="w-full h-full object-cover"
                        alt="Sign Up"
                />
            </section>

                {/* Right side (Form section) */}
                <section className="w-1/2 bg-neutral-800 flex flex-col justify-center items-center p-10 text-white">
                    <article className="w-full text-center mb-6">
                        <h1 className="text-4xl font-bold mb-4">SIGN UP</h1>
                    </article>

                    {/* Form Fields */}
                    <article className="w-full flex flex-col gap-4">
                        {/* Username */}
                        <section className="flex items-center gap-4">
                            <section className="w-1/3 text-right text-lg opacity-80">Username</section>
                            <section className="w-2/3">
                            <InputBar
                                value= {inputText}
                                onChange={handleInputChange}
                                placeholder="Enter your username"
                                type="username"
/>
                            </section>
                        </section>

                        {/* Role Selection */}
                        <section className="flex items-center gap-4">
                            <section className="w-1/3 text-right text-lg opacity-80">Select Role</section>
                            <section className="w-2/3">
                                <select className="w-full p-2 rounded text-white" 
                                    value={type} 
                                    onChange={handleTypeChange}
                                    >
                                    <option className="bg-neutral-800 text-white" value={UserType.Client} >Client</option>
                                    <option className="bg-neutral-800 text-white" value={UserType.Freelancer}>Freelancer</option>
                                </select>
                            </section> 
                        </section>
                        <Button caption={"SIGN UP"} onClick = {()=> LoginClick(Number(type), inputText)}/>
                    </article>
                </section>
            </section>
        </main>
    );
}