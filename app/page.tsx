"use client";

import Link from "next/link";
import { useState } from "react";
export default function Home() {
  const [modal, setModal] = useState<"about" | "contact" | null>(null);
  
  // ...rest of your existing component logic (handlePass, TABS, etc.)
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#1a0f08] text-white">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-orange-600/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[500px] rounded-full bg-amber-500/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-8">
        {/* Nav */}
        <div className="mb-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🎸</span>
            <span className="text-lg font-bold tracking-tight text-white">
              Song<span className="text-amber-400">Quest</span>
            </span>
          </div>

          <nav className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md">
            <button
              onClick={() => setModal("about")}
              className="rounded-full px-4 py-2 text-sm font-medium text-white/70 transition-colors duration-200 hover:bg-white/10 hover:text-white"
            >
              About
            </button>
            <button
              onClick={() => setModal("contact")}
              className="rounded-full px-4 py-2 text-sm font-medium text-white/70 transition-colors duration-200 hover:bg-white/10 hover:text-white"
            >
              Contact
            </button>

            <div className="mx-1 h-5 w-px bg-white/10" />

            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-white/70 transition-colors duration-200 hover:bg-white/10 hover:text-white"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 17l5-5-5-5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15 12H3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Log In
            </Link>

            <Link
              href="/signup"
              className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-2 text-sm font-semibold text-[#2a1608] shadow-[0_4px_16px_rgba(232,163,61,0.4)] transition-transform duration-200 hover:scale-[1.03] hover:shadow-[0_6px_20px_rgba(232,163,61,0.55)]"
            >
              Sign Up
            </Link>
          </nav>
        </div>

        {/* Hero */}
        <div className="text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-white/60">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Practice smarter, not longer
          </div>

          <h1 className="mx-auto max-w-3xl text-6xl font-bold leading-[1.05] tracking-tight sm:text-7xl">
            Learn the songs you
            <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent"> actually </span>
            want to play
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-white/60">
            Master skills step by step, generate backing tracks on the fly, and unlock harder songs as you go.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-7 py-3.5 font-semibold text-[#2a1608] shadow-[0_8px_24px_rgba(232,163,61,0.35)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_10px_30px_rgba(232,163,61,0.5)]"
            >
              Start Learning
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div className="mt-24 grid gap-5 sm:grid-cols-3">
          {[
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
                </svg>
              ),
              title: "Songs",
              body: "Browse hundreds of songs, tagged by difficulty and the skills each one teaches.",
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M13 2 3 14h7l-1 8 11-14h-7z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ),
              title: "Build Skills",
              body: "Get a guided path of practice songs that build toward the one you really want.",
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 16V4M7 9l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ),
              title: "Upload",
              body: "Submit a video of your performance and mark songs complete once you nail it.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-7 text-left shadow-[0_8px_30px_rgba(0,0,0,0.25)] transition-all duration-300 hover:border-amber-400/30 hover:bg-white/[0.05]"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 text-amber-300">
                {card.icon}
              </div>
              <h2 className="text-lg font-semibold text-white">{card.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{card.body}</p>
            </div>
          ))}
        </div>
      </div>

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onClick={() => setModal(null)}
        >
          <div
            className={`w-full rounded-3xl border border-white/10 bg-[#241209] p-8 text-white shadow-2xl ${modal === "contact" ? "max-w-md" : "max-w-3xl"}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => setModal(null)}
                className="rounded-full px-3 py-1 text-sm font-semibold text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                Close
              </button>
            </div>

            {modal === "about" ? (
              <p className="text-lg leading-8 text-white/85">
                SongQuest helps guitarists go from "I know a few chords" to "I can actually play that song." Search a growing library of songs by difficulty and the specific skills they teach, follow a guided path of three stepping-stone songs that build toward a harder goal, and unlock it once you're ready. Practice with a live backing-track generator for any chord progression, then upload a video of yourself playing to check your progress and mark songs complete, earning experience to level up.
              </p>
            ) : (
              <p className="text-center text-2xl font-semibold text-white/85">vikysobti@gmail.com</p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}