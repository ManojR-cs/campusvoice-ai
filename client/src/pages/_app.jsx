import React, { useEffect } from 'react';
import '../styles/globals.css';
import { useAuthStore } from '../store/authStore';
import Navbar from '../components/AppShell/Navbar';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <>
      <Head>
        <title>CampusVoice AI - College Complaint & Operations Management</title>
        <meta name="description" content="AI-assisted campus complaint and operations tracking system" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1">
          <Component {...pageProps} />
        </main>
      </div>
    </>
  );
}
