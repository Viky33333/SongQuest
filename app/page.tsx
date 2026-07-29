"use client";

import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [modal, setModal] = useState<"about" | "contact" | null>(null);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#9f491e] via-[#c96b22] to-[#9f491e] text-white p-10">
      <div className="mx-auto mb-8 flex w-full max-w-6xl items-center justify-between">
        {/* Brand mark */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎸</span>
          <span className="text-lg font-bold tracking-tight text-white">
            Song<span className="text-white/70">Quest</span>
          </span>
        </div>

        {/* Nav bar */}
        <nav className="flex items-center gap-1 rounded-full border border-white/20 bg-white/[0.07] p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-md">
          <button
            onClick={() => setModal("about")}
            className="rounded-full px-4 py-2 text-sm font-medium text-white/80 transition-colors duration-200 hover:bg-white/10 hover:text-white"
          >
            About
          </button>
          <button
            onClick={() => setModal("contact")}
            className="rounded-full px-4 py-2 text-sm font-medium text-white/80 transition-colors duration-200 hover:bg-white/10 hover:text-white"
          >
            Contact
          </button>

          <div className="mx-1 h-5 w-px bg-white/15" />

          <button className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-white/80 transition-colors duration-200 hover:bg-white/10 hover:text-white">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 17l5-5-5-5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15 12H3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Log In
          </button>

          <button className="group relative rounded-full bg-gradient-to-r from-amber-300 to-orange-400 px-5 py-2 text-sm font-semibold text-[#5c2a10] shadow-[0_4px_16px_rgba(232,163,61,0.45)] transition-transform duration-200 hover:scale-[1.03] hover:shadow-[0_6px_20px_rgba(232,163,61,0.6)]">
            Sign Up
          </button>
        </nav>
      </div>

      <h1 className="text-7xl font-bold mb-4 text-center">🎸 SongQuest 🎸</h1>

      <p className="text-xl text-gray-300 mb-10 text-center">
        Learn songs. Master skills. Unlock harder challenges.
      </p>

      <div className="grid grid-cols-3 gap-6 text-center">
        <div className="bg-white/10 rounded-2xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold">Songs</h2>
          <p className="mt-2 text-gray-300">Browse hundreds of songs.</p>
        </div>

        <div className="bg-white/10 rounded-2xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold">Build Skills</h2>
          <p className="mt-2 text-gray-300">Get practice song recommendations.</p>
        </div>

        <div className="bg-white/10 rounded-2xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold">Upload</h2>
          <p className="mt-2 text-gray-300">Submit your performance.</p>
        </div>
      </div>

      <div className="flex justify-center mt-12">
        <Link
          href="/dashboard"
          className="bg-[#d88528] hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition duration-300 hover:scale-110"
        >
          GO
        </Link>
      </div>

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setModal(null)}
        >
          <div
            className={`w-full rounded-3xl border border-white/15 bg-[#2b140d] p-8 text-white shadow-2xl ${modal === "contact" ? "max-w-md" : "max-w-3xl"}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => setModal(null)}
                className="rounded-full px-3 py-1 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                Close
              </button>
            </div>

            {modal === "about" ? (
              <p className="text-lg leading-8 text-gray-100">
                SongQuest helps guitarists go from "I know a few chords" to "I can actually play that song." Search a growing library of songs by difficulty and the specific skills they teach, follow a guided path of three stepping-stone songs that build toward a harder goal, and unlock it once you're ready. Practice with a live backing-track generator for any chord progression, then upload a video of yourself playing to check your progress and mark songs complete, earning experience to level up.
              </p>
            ) : (
              <p className="text-center text-2xl font-semibold text-gray-100">vikysobti@gmail.com</p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}