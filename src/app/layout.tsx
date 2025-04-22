import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "./AuthContext";
import NotificationProvider from "./NotificationContext";
import { Toaster } from 'react-hot-toast';
import JobProvider from "./JobContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TaskNet",
  description: "Powering the future of freelance",
};

//Function making routing possible
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster position="top-center" reverseOrder={false} /> {/* This allows us to use toast messages on all pages, is used in the upload file component*/}
        <AuthProvider>
          <NotificationProvider>
            <JobProvider>
              {children}
            </JobProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
