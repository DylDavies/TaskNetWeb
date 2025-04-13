"use client";
import React from "react";
import InputBar from "../components/inputbar/InputBar";
import "../components/inputbar/inputBar.css";
import Button from "../components/button/Button";
import "../components/button/Button.css";
import "./global.css";

export default function Page() {
    return(
        <main className="flex items-center justify-center h-screen bg-neutral-900">
            <section className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex overflow-hidden">
                {/* Left side (Image section) */}
                <section className="w-1/2 bg-neutral-900 text-white flex justify-center items-center">
                    <img
                        src="/images/signup.jpg"
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
                                <input
                                    type="text"
                                    placeholder="Enter username"
                                    className="w-full p-2 rounded text-black"
                                />
                            </section>
                        </section>

                        {/* Role Selection */}
                        <section className="flex items-center gap-4">
                            <section className="w-1/3 text-right text-lg opacity-80">Select Role</section>
                            <section className="w-2/3">
                                <select className="w-full p-2 rounded text-white">
                                    <option value="client">Client</option>
                                    <option value="freelancer">Freelancer</option>
                                </select>
                            </section>
                        </section>
                        <Button caption={"SIGN UP"}/>
                    </article>
                </section>
            </section>
        </main>
    );
}