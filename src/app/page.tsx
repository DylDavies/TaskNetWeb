'use client';

import { getCurrentUser, googlePopupAuth, googleSignout } from "./auth/auth";

// <button onClick={signinClick} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">Sign in with google</button>
// <button onClick={signoutClick} className="bg-red-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">Sign in with google</button>
// <button onClick={currentUserClick} className="bg-orange-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">Sign in with google</button>

export default function Home() {
  async function signinClick() {
    const accessToken = await googlePopupAuth();

    console.log(accessToken);

    const user = getCurrentUser();

    console.log(user);
  }

  function signoutClick() {
    googleSignout();
  }

  function currentUserClick() {
    const user = getCurrentUser();

    console.log("User", user);
  }

  return (
<main className="flex h-screen">
  <section className="w-1/2 bg-violet-700 text-neutral-900 flex flex-col justify-center items-center p-10">
    <article className="flex flex-col items-center text-center">
      {/* Logo Placeholder */}
      <section className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-indigo-900 font-bold text-xl mb-6">
      🖤
      </section>
      <section className="text-8xl font-bold mb-4">TASKNET</section>
      <section className="text-4xl mb-2">slogan goes here</section>
      <section className="text-xl opacity-80">button goes here</section>
    </article>
  </section>
  <section className="w-1/2 bg-gray-900 justify-center items-center p-10">
    <article className="shadow-xl rounded-lg max-w-full h-auto">
      <img src="/your-landing-page-preview.png" alt="Landing Page Example" className="rounded-lg" />
    </article>
  </section>
</main>


  );
}
